"""Shared CLI constants and small provider helpers.

Single source of truth for values the ``run`` / ``config`` commands and the
intake REPL all need, so they cannot drift apart — e.g. a provider added in one
command but forgotten in another, or two copies of a "default model" helper that
quietly disagree.
"""

from __future__ import annotations

VALID_PROVIDERS = {"anthropic", "openai", "litellm"}
VALID_OPENAI_APIS = {"chat", "responses"}

# Intake-agent LLM call budget — seeded into the agent config by ``run`` and
# applied directly by the REPL.
INTAKE_LLM_TIMEOUT = 20.0
INTAKE_LLM_PROVIDER_RETRIES = 0
INTAKE_LLM_RETRY_ATTEMPTS = 2
INTAKE_LLM_RETRY_BASE_DELAY = 1.0
INTAKE_LLM_RETRY_MAX_DELAY = 2.0

# Intake is a planning conversation (read the eval, propose a contract), not a
# deep-reasoning task — so it overrides the user's reasoning_effort (often
# "high") with a lighter setting to keep each turn snappy.
INTAKE_REASONING_EFFORT = "low"

DEFAULT_OPENAI_MODEL = "gpt-4o"
DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-20250514"

# Read-only WebUI: the browser monitor binds here by default for interactive
# runs (no flag needed). If the port is taken we walk the next few ports so a
# second concurrent run doesn't collide.
DEFAULT_WEBUI_PORT = 8765
WEBUI_PORT_SCAN = 10

_OPENAI_FAMILY = ("openai", "litellm")


def normalize_provider(provider: str | None, openai_api: str | None = None) -> str:
    """Return the canonical provider name stored in config files.

    User-facing setup uses one axis only: anthropic | openai | litellm.
    ``openai`` defaults to the Responses API; advanced configs may still set
    ``openai_api: chat`` in YAML for chat-only endpoints.
    """
    p = (provider or "anthropic").strip().lower()
    if p == "claude":
        return "anthropic"
    if p in ("openai", "openai-responses", "openai-chat", "responses", "chat", "openai_response", "openai_compat"):
        return "openai"
    return p


def default_model_for_provider(provider: str | None) -> str | None:
    """Default model for ``provider``, or ``None`` to defer to the provider.

    Claude/Anthropic return ``None`` because the provider supplies its own
    default; only the OpenAI family and litellm need an explicit model here.
    Callers that must persist a concrete string (e.g. writing a config file)
    substitute :data:`DEFAULT_CLAUDE_MODEL` when this returns ``None``.
    """
    provider = normalize_provider(provider)
    if provider in _OPENAI_FAMILY:
        return DEFAULT_OPENAI_MODEL
    return None
