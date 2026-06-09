# Plugins

Plugins retarget Arbor to a **domain** without changing any code. A plugin is a single
YAML file that declares how to evaluate work, what must stay protected, what outputs are
required, and a set of ready-made budget profiles. Activate one with a single line of
config.

```yaml title="research_config.yaml"
plugin: mle_kaggle
plugin_profile: mle_bench_lite_6h
```

## Why plugins

A general research agent needs domain-specific guardrails: the metric to optimize, the
direction of "better", the data it must never edit, and a sensible compute budget. Rather
than hard-code these for one benchmark, Arbor reads them from a plugin — so the same agent
can target Kaggle competitions today and a different domain tomorrow by swapping one name.

## The plugin format

Here is the structure, drawn from the bundled `mle_kaggle` plugin:

```yaml
name: mle_kaggle
description: "Engineering optimization for Kaggle/MLE-bench competitions"
schema_version: 1

# How to score a candidate and which way is "better".
eval_contract:
  metric_direction: maximize          # or: minimize
  eval_cmd: "bash {cwd}/eval.sh"      # {cwd} -> project directory
  submission_path: "submission.csv"
  sample_submission_path: "data/sample_submission.csv"

# Paths executors may read but must never modify.
protected_paths:
  - "data/**"
  - "private/**"
  - "evaluation/**"

# Artifacts a valid run must produce.
required_outputs:
  - "submission.csv"

# Named budget/behaviour bundles, selected via `plugin_profile`.
profiles:
  smoke:
    max_cycles: 2
    max_tree_depth: 2
    executor_timeout: 1800
    time_budget: 3600
  mle_bench_lite_6h:
    max_cycles: 8
    max_tree_depth: 3
    executor_timeout: 10800
    time_budget: 21600
  mle_bench_lite:
    max_cycles: 20
    max_tree_depth: 4
    executor_timeout: 14400
    time_budget: 86400

# Domain guidance injected into the coordinator's system prompt.
meta_preamble_inject: |
  ## Competition Objective
  You are optimizing for an engineering competition.
  The sole objective is maximizing the evaluation metric...
```

### Sections

| Section | Purpose |
| --- | --- |
| `name`, `description` | Identify the plugin. |
| `schema_version` | Plugin format version. |
| `eval_contract` | How to evaluate: `metric_direction`, `eval_cmd` (with `{cwd}` substitution), and the submission/sample paths. |
| `protected_paths` | Glob patterns that are read-only to executors — your data and harness. |
| `required_outputs` | Artifacts that must exist for a run to be valid. |
| `profiles` | Named bundles of `max_cycles`, `max_tree_depth`, `executor_timeout`, and `time_budget`. Selected with `plugin_profile`. |
| `meta_preamble_inject` | Extra domain instructions merged into the coordinator's system prompt. |

## Profiles

Profiles let you switch budgets by name instead of editing numbers. The bundled
`mle_kaggle` plugin ships several:

| Profile | Cycles | Depth | Executor timeout | Total budget |
| --- | --- | --- | --- | --- |
| `smoke` | 2 | 2 | 30 min | 1 h |
| `mle_bench_lite_6h` | 8 | 3 | 3 h | 6 h |
| `mle_bench_lite` | 20 | 4 | 4 h | 24 h |
| `production_24h` | 20 | 4 | 4 h | 24 h |

```yaml
plugin: mle_kaggle
plugin_profile: mle_bench_lite_6h
```

Anything you set explicitly in your config or on the command line still overrides the
profile — see [Configuration → Where configuration comes from](configuration.md#where-configuration-comes-from).

## A complete Kaggle config

```yaml title="kaggle_config.example.yaml"
plugin: mle_kaggle
plugin_profile: mle_bench_lite_6h

llm:
  provider: anthropic
  model: claude-sonnet-4-5
  api_key: ${ANTHROPIC_API_KEY}
```

```bash
arbor run "maximize the competition metric" \
  --yes --yes-cwd /path/to/competition \
  --config /path/to/competition/kaggle_config.yaml
```

A ready-to-edit version lives at `examples/kaggle_config.example.yaml` in the repository.

## Writing your own plugin

Copy `src/plugins/mle_kaggle.yaml` as a starting point, adjust the `eval_contract`,
`protected_paths`, and `profiles` for your domain, and reference it by `name`. Pair it
with a [Skill](skills.md) when you also want to shape *how* the agent reasons, not just
what it optimizes.
