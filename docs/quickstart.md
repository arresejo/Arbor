# Quickstart

This guide takes you from a fresh install to a running research session.

## 1. Configure a provider

Run the interactive setup wizard once. It writes your provider, model, and API key to a
user config so you don't repeat them on every run:

```bash
arbor setup
```

!!! tip "First run shortcut"
    If you start a run before configuring anything, Arbor detects the missing config in an
    interactive terminal and walks you through `arbor setup` automatically.

Prefer to do it by hand? Set environment variables instead:

=== "Anthropic"

    ```bash
    export ANTHROPIC_API_KEY=sk-ant-...
    ```

=== "OpenAI"

    ```bash
    export OPENAI_API_KEY=sk-...
    ```

=== "OpenAI-compatible (LiteLLM)"

    ```bash
    export OPENAI_API_KEY=...            # your gateway key
    export OPENAI_BASE_URL=https://your-gateway/v1
    ```

See [Configuration](configuration.md) for the full provider matrix.

## 2. Start a session

The simplest way to begin — run `arbor` inside any directory:

```bash
arbor
```

This opens an **intake chat**. You describe your goal in plain language; the intake agent
confirms which project directory to work on, helps you shape a plan, and then launches the
study once you both agree.

You can also seed the goal directly:

```bash
arbor run "maximize dev score without changing eval or data"
```

## 3. Skip the chat (headless / scripted)

To launch immediately without the intake conversation — useful for benchmarks and CI:

```bash
arbor run "improve held-out accuracy" \
  --yes \
  --yes-cwd /path/to/project \
  --config /path/to/project/research_config.yaml
```

## 4. Watch it work

While a run is active you get three views:

- **Terminal dashboard** — live status of the current cycle, the Idea Tree, and costs.
- **Read-only web monitor** — auto-starts in your browser near port `8765`
  (disable with `--no-webui`, change with `--webui-port`).
- **`REPORT.md`** — the final write-up, generated when the run finishes.

Inside the dashboard you can steer the run with slash commands such as `/status`, `/tree`,
`/evidence`, `/cost`, `/pause`, and `/resume`. See the [CLI reference](cli.md#interactive-slash-commands).

## 5. Read the results

When the run completes, Arbor writes a `REPORT.md` and opens an optional read-only Q&A
prompt so you can interrogate the finished study (disable with `--no-followup`). All
artifacts — the Idea Tree, checkpoints, logs, and per-experiment branches — live under
`<project>/.arbor/sessions/<run_name>/`.

## Where to go next

<div class="grid cards" markdown>

-   :material-book-open-variant: **Preparing a Benchmark**

    Wire up an eval command and protect your data so Arbor can iterate safely.

    [:octicons-arrow-right-24: Preparing a Benchmark](preparing-a-benchmark.md)

-   :material-sitemap: **How It Works**

    The arbor cycle, the Idea Tree, and held-out discipline.

    [:octicons-arrow-right-24: How It Works](how-it-works.md)

</div>
