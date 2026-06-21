"""`arbor setup` — interactive one-time configuration wizard.

A first-time user runs ``arbor`` (or ``arbor setup``) and answers a few prompts;
we write ``~/.arbor/config.yaml`` so subsequent runs need no flags. The wizard is
the interactive sibling of the flag-driven ``arbor config init`` and shares its
writer (:func:`write_user_llm_config`) so both produce the same file shape.
"""

from __future__ import annotations

from pathlib import Path

import typer

from ..._app import GLOBAL_CONFIG_FILE
from .._constants import (
    DEFAULT_CLAUDE_MODEL,
    PROVIDER_CHOICES,
    default_model_for_provider,
)
from .config_cmd import write_user_llm_config


def run_setup_wizard(*, force: bool = False) -> bool:
    """Interactively collect LLM settings and write the global config.

    Returns True if a config was written, False if the user aborted (e.g. an
    existing config and they declined to overwrite). Reuses
    :func:`write_user_llm_config` so the file matches ``arbor config init``.
    """
    from ..style import console as _console

    if GLOBAL_CONFIG_FILE.exists() and not force:
        _console.print(f"\n[yellow]A config already exists at[/] {GLOBAL_CONFIG_FILE}")
        if not typer.confirm("Overwrite it?", default=False):
            _console.print("[dim]Keeping the existing config. Run `arbor config show` to view it.[/]")
            return False

    _console.print()
    _console.print("[bold cyan]arbor setup[/] — let's configure your model (one time).")
    _console.print("[dim]Press Enter to accept each default. Stored in "
                   f"{GLOBAL_CONFIG_FILE}.[/]\n")

    # 0. Easy start — a free key or a local model gets you running in ~2 minutes.
    #    Returns a ready-to-write llm dict, or None to fall through to the full
    #    provider/model/key prompts below.
    easy_llm = _choose_easy_start()
    if easy_llm is not None:
        _console.print()
        write_user_llm_config(easy_llm)
        _probe_credentials(easy_llm["provider"], easy_llm.get("api_key"))
        _console.print(
            f"\n[green]Done.[/] Saved to [bold]{GLOBAL_CONFIG_FILE}[/] "
            "([dim]view it anytime with[/] [bold]arbor config show[/])."
        )
        _console.print("Just run [bold]arbor[/] to start a session.\n")
        return True

    # 1. API type / provider
    _console.print(
        "[dim]API type:\n"
        "  [bold]auto[/bold]             let Arbor detect it — probes the endpoint's Responses\n"
        "                   API and uses it when available, else chat completions\n"
        "  [bold]openai-responses[/bold] OpenAI / o-series via the Responses API (reasoning chain)\n"
        "  [bold]openai-chat[/bold]      any OpenAI-compatible endpoint (DeepSeek / Qwen / GLM / …)\n"
        "  [bold]anthropic[/bold]        Claude via the native Anthropic API[/]"
    )
    provider = _prompt_choice(
        "API type",
        choices=list(PROVIDER_CHOICES),
        default="auto",
    )

    # 2. base_url (local proxy / vLLM / official API)
    base_url = typer.prompt(
        "Base URL (local proxy / vLLM, blank for the official API)",
        default="",
        show_default=False,
    ).strip()

    # 3. model
    suggested_model = default_model_for_provider(provider) or DEFAULT_CLAUDE_MODEL
    model = typer.prompt("Model", default=suggested_model).strip() or suggested_model

    # 4. api_key (hidden; blank keeps env-var auth)
    api_key = typer.prompt(
        "API key (blank to read from the environment; local proxies often accept dummy)",
        default="",
        hide_input=True,
        show_default=False,
    ).strip()

    llm: dict[str, str] = {"provider": provider, "model": model}
    if base_url:
        llm["base_url"] = base_url
    if api_key:
        llm["api_key"] = api_key

    _console.print()
    write_user_llm_config(llm)

    _probe_credentials(provider, api_key or None)
    _console.print(
        f"\n[green]Done.[/] Saved to [bold]{GLOBAL_CONFIG_FILE}[/] "
        "([dim]view it anytime with[/] [bold]arbor config show[/])."
    )
    _console.print("Just run [bold]arbor[/] to start a session.\n")
    return True


def _choose_easy_start() -> dict[str, str] | None:
    """Offer free/local presets first; return a ready llm dict or None.

    None means "I'll set it up myself" — the caller falls through to the full
    provider/model/key prompts. This is the cheapest path to a running session:
    a free hosted key (Gemini/Groq) or a local model (Ollama), no card required.
    """
    from ..quickstart import EASY_PRESETS, build_llm_from_preset
    from ..style import console as _console

    _console.print("[bold]How do you want to connect a model?[/]")
    _console.print("[dim]The first options get you running in ~2 minutes — free or local.[/]")
    for i, preset in enumerate(EASY_PRESETS, start=1):
        _console.print(f"  [bold cyan]{i}[/]  {preset.label}  [dim]— {preset.blurb}[/]")
    full_choice = len(EASY_PRESETS) + 1
    _console.print(
        f"  [bold cyan]{full_choice}[/]  Set it up myself  "
        "[dim]— Anthropic / OpenAI / custom endpoint[/]"
    )

    choices = [str(n) for n in range(1, full_choice + 1)]
    raw = _prompt_choice("Choose", choices=choices, default="1")
    idx = int(raw)
    if idx == full_choice:
        _console.print("[dim]OK — full setup.[/]\n")
        return None

    preset = EASY_PRESETS[idx - 1]
    _console.print(f"\n[bold]{preset.label}[/]")
    if preset.signup_url:
        verb = "get a free key" if preset.needs_key else "install"
        _console.print(f"[dim]{verb}:[/] [cyan underline]{preset.signup_url}[/]")
    if not preset.needs_key:
        _console.print("[dim]make sure the local server is running first "
                       "(e.g. `ollama serve`) and the model is pulled.[/]")

    model = typer.prompt("Model", default=preset.default_model).strip() or preset.default_model

    api_key = None
    if preset.needs_key:
        api_key = typer.prompt(
            "API key (blank to read from the environment)",
            default="", hide_input=True, show_default=False,
        ).strip() or None

    _console.print(
        "[dim]note: free-tier models are great for trying Arbor on your own task; "
        "a heavy run wants a stronger model.[/]"
    )
    return build_llm_from_preset(preset, api_key=api_key, model=model)


def _probe_credentials(provider: str, api_key: str | None) -> None:
    """Best-effort: confirm a key is resolvable (env or entered). Never raises."""
    from ..preflight import PreflightChecker
    from ..style import console as _console

    try:
        result = PreflightChecker(
            cwd=Path.cwd(), provider=provider, explicit_api_key=api_key,
        ).check_llm_credentials(render=False)
    except Exception:
        return
    if result.status == "fail":
        _console.print(f"[yellow]![/] {result.message}")
        if result.hint:
            _console.print(f"  [dim]{result.hint}[/]")
    else:
        _console.print("[green]✓[/] credentials look resolvable")


def _prompt_choice(label: str, *, choices: list[str], default: str) -> str:
    """Prompt until the answer is one of ``choices`` (case-insensitive)."""
    options = "/".join(choices)
    while True:
        ans = typer.prompt(f"{label} ({options})", default=default).strip().lower()
        if ans in choices:
            return ans
        typer.secho(f"  please choose one of: {options}", fg=typer.colors.YELLOW)


def setup_command(
    force: bool = typer.Option(
        False, "--force",
        help="Re-run setup even if a config already exists (overwrites it).",
    ),
) -> None:
    """Interactively configure arbor (writes ~/.arbor/config.yaml)."""
    wrote = run_setup_wizard(force=force)
    raise typer.Exit(code=0 if wrote else 1)


def quickstart_command(
    force: bool = typer.Option(
        False, "--force",
        help="Re-run even if a config already exists (overwrites it).",
    ),
) -> None:
    """Get running fast — a free key or a local model, no card required.

    Same writer as ``arbor setup``; this entry point just leads with the
    free/local presets so a first-time user can start a real session in minutes.
    """
    wrote = run_setup_wizard(force=force)
    raise typer.Exit(code=0 if wrote else 1)
