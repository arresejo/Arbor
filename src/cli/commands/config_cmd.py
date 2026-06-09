"""`arbor config` — view and edit user-level defaults."""

from __future__ import annotations

from typing import Any
from urllib.parse import urlsplit, urlunsplit

import typer
import yaml

from ..._app import GLOBAL_CONFIG_DIR, GLOBAL_CONFIG_FILE, LEGACY_GLOBAL_CONFIG_FILE
from .._constants import (
    DEFAULT_CLAUDE_MODEL,
    VALID_PROVIDERS,
    default_model_for_provider,
    normalize_provider,
)


config_app = typer.Typer(
    name="config",
    help=f"View or edit {GLOBAL_CONFIG_FILE}",
    no_args_is_help=True,
)


@config_app.command("show")
def show_command(
    show_secrets: bool = typer.Option(
        False,
        "--show-secrets",
        help="Print secret values instead of masking them",
    ),
) -> None:
    """Print the effective user config."""
    config_path = _config_path_for_display()
    if config_path is None:
        typer.echo(f"(no config at {GLOBAL_CONFIG_FILE})")
        raise typer.Exit(code=0)
    typer.echo(f"# {config_path}")
    if config_path == LEGACY_GLOBAL_CONFIG_FILE:
        typer.echo(f"# legacy path; consider moving it to {GLOBAL_CONFIG_FILE}")
    typer.echo(_read_config_for_display(config_path, show_secrets=show_secrets))


@config_app.command("init")
def init_command(
    provider: str = typer.Option(
        "anthropic", "--provider",
        help="API type: anthropic / openai / litellm. OpenAI defaults to Responses API.",
    ),
    model: str | None = typer.Option(None, "--model",
                                     help="Model name. Defaults to a provider-appropriate model."),
    base_url: str | None = typer.Option(None, "--base-url",
                                        help="e.g. http://localhost:4141 for local proxies"),
    api_key: str | None = typer.Option(None, "--api-key",
                                       help="overrides env var; leave empty to keep env-based auth"),
    force: bool = typer.Option(False, "--force", help="overwrite existing config"),
) -> None:
    """Generate the user config file with the given LLM settings.

    Examples:

            # local proxy serving a gpt-5.x / o-series model (uses Responses API)
            arbor config init --provider openai --model gpt-5.5 \
                --base-url http://localhost:4141 --api-key dummy

            # local proxy serving an open-source model via litellm
            arbor config init --provider litellm --model qwen-72b \
                --base-url http://localhost:4141 --api-key dummy

              # Claude via Anthropic with env-var ANTHROPIC_API_KEY
              arbor config init --provider anthropic --model claude-sonnet-4-20250514
    """
    provider = normalize_provider(provider)

    if provider not in VALID_PROVIDERS:
        typer.secho(
            f"error: --provider must be anthropic, openai, or litellm (got {provider!r})",
            fg=typer.colors.RED,
            err=True,
        )
        raise typer.Exit(code=2)

    if GLOBAL_CONFIG_FILE.exists() and not force:
        typer.secho(f"error: {GLOBAL_CONFIG_FILE} already exists. Use --force to overwrite.",
                    fg=typer.colors.RED, err=True)
        raise typer.Exit(code=2)

    GLOBAL_CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    resolved_model = model or default_model_for_provider(provider) or DEFAULT_CLAUDE_MODEL
    llm: dict[str, str] = {"provider": provider, "model": resolved_model}
    if base_url:
        llm["base_url"] = base_url
    if api_key:
        llm["api_key"] = api_key

    write_user_llm_config(llm)


def write_user_llm_config(llm: dict[str, Any]) -> None:
    """Write ``{"llm": llm}`` to the global config and echo a masked summary.

    Shared by ``arbor config init`` and the interactive ``arbor setup`` wizard so
    both produce the same file shape. Callers own the "exists + not --force" guard
    and the ``GLOBAL_CONFIG_DIR.mkdir`` is repeated here so the wizard can call
    this directly without depending on init's prologue.
    """
    GLOBAL_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    llm = dict(llm)
    original_provider = str(llm.get("provider") or "anthropic")
    original_openai_api = str(llm.pop("openai_api", "") or "") or None
    llm["provider"] = normalize_provider(
        original_provider,
        original_openai_api,
    )
    if original_provider.lower() in {"openai-chat", "chat", "openai_compat"}:
        llm["openai_api"] = "chat"
    elif original_openai_api and original_openai_api.lower() == "chat":
        llm["openai_api"] = "chat"
    if llm.get("base_url"):
        llm["base_url"] = _normalize_base_url(str(llm["base_url"]))
    payload = {"llm": llm}
    GLOBAL_CONFIG_FILE.write_text(
        yaml.safe_dump(payload, sort_keys=False, default_flow_style=False),
        encoding="utf-8",
    )
    typer.secho(f"wrote {GLOBAL_CONFIG_FILE}", fg=typer.colors.GREEN)
    typer.echo("---")
    typer.echo(yaml.safe_dump(_mask_secrets(payload), sort_keys=False, default_flow_style=False))


@config_app.command("path")
def path_command() -> None:
    """Print the config file path (whether it exists or not)."""
    typer.echo(str(GLOBAL_CONFIG_FILE))


def _config_path_for_display():
    if GLOBAL_CONFIG_FILE.exists():
        return GLOBAL_CONFIG_FILE
    if LEGACY_GLOBAL_CONFIG_FILE.exists():
        return LEGACY_GLOBAL_CONFIG_FILE
    return None


def _normalize_base_url(base_url: str) -> str:
    """Normalize common local OpenAI-compatible gateway URLs.

    The local Copilot/GPT gateway commonly listens at ``http://localhost:4141/v1``.
    Users often type ``https://localhost:4141`` in setup, which fails with TLS
    errors before any model call can happen. Keep arbitrary remote endpoints
    untouched; only normalize the local 4141 gateway.
    """
    url = (base_url or "").strip()
    if not url:
        return url
    if "://" not in url:
        url = "http://" + url
    try:
        parts = urlsplit(url)
    except ValueError:
        return base_url.strip()
    if parts.hostname not in {"localhost", "127.0.0.1"} or parts.port != 4141:
        return url
    path = parts.path or "/v1"
    if path == "/":
        path = "/v1"
    return urlunsplit(("http", parts.netloc, path, parts.query, parts.fragment))

def _read_config_for_display(path, *, show_secrets: bool) -> str:
    text = path.read_text(encoding="utf-8")
    if show_secrets:
        return text
    try:
        raw = yaml.safe_load(text)
    except yaml.YAMLError:
        return "(config contains invalid YAML; refusing to print possible secrets)"
    return yaml.safe_dump(_mask_secrets(raw), sort_keys=False, default_flow_style=False)


_SECRET_KEY_PARTS = ("api_key", "token", "secret", "password", "auth")


def _mask_secrets(value: Any) -> Any:
    if isinstance(value, dict):
        masked = {}
        for key, item in value.items():
            if any(part in str(key).lower() for part in _SECRET_KEY_PARTS):
                masked[key] = _mask_value(item)
            else:
                masked[key] = _mask_secrets(item)
        return masked
    if isinstance(value, list):
        return [_mask_secrets(item) for item in value]
    return value


def _mask_value(value: Any) -> Any:
    if value in (None, ""):
        return value
    text = str(value)
    if len(text) <= 8:
        return "***"
    return f"{text[:4]}...{text[-4:]}"
