# Preparing a Benchmark

Arbor improves a project by running real experiments and measuring them. To do that
safely, it needs to know two things: **how to evaluate** a candidate solution, and **what
it must never touch** (your held-out data and the evaluation harness itself).

This page shows how to prepare a project directory so Arbor can iterate productively.

## The project directory

Point Arbor at any directory that contains your code and data. A typical layout:

```text
my_task/
├── data/                 # datasets — protected from edits
│   └── sample_submission.csv
├── eval.sh               # how to score a candidate (held-out)
├── train.py              # your code — Arbor is free to edit this
└── research_config.yaml  # Arbor configuration (optional)
```

Nothing about this layout is mandatory — it's all expressed in configuration. What matters
is that Arbor can (a) run an evaluation command and read a score, and (b) know which paths
are off-limits.

## 1. Define how to evaluate

The agent needs a deterministic way to score a candidate and a clear notion of which
direction is "better". The cleanest way to declare this is an **eval contract**, most
commonly via a [plugin](plugins.md):

```yaml title="eval contract (excerpt)"
eval_contract:
  metric_direction: maximize          # or: minimize
  eval_cmd: "bash {cwd}/eval.sh"      # {cwd} is substituted with the project dir
  submission_path: "submission.csv"
  sample_submission_path: "data/sample_submission.csv"
```

`eval_cmd` should print or write a metric the agent can parse, and exit non-zero on
failure. Keep it fast enough to run many times, but faithful to your real objective.

!!! tip "Dev vs. held-out"
    Give executors a **dev** signal to iterate against, and reserve a **held-out** split
    for the merge gate. Arbor only keeps changes that improve the held-out metric by a
    configurable margin — this is what prevents overfitting to the iteration signal. See
    [How It Works → Evaluation discipline](how-it-works.md#evaluation-discipline).

## 2. Protect data and the harness

Tell Arbor which paths must never be modified. Anything matching `protected_paths` is
read-only to executors — they can read your data and eval scripts but cannot edit them to
"win" by cheating:

```yaml
protected_paths:
  - "data/**"
  - "private/**"
  - "evaluation/**"
```

For benchmarks, also keep the agent on a clean base branch. By default Arbor refuses to
start from a non-`main`/`master` branch; pass `--allow-non-base-branch` only when you
deliberately want to start from a feature branch (useful for dev, risky for benchmarks).

## 3. Declare required outputs

If a valid run must produce specific artifacts (e.g. a submission file), declare them so
the agent knows what "done" looks like:

```yaml
required_outputs:
  - "submission.csv"
```

## 4. Choose a profile or set a budget

Decide how much compute the study may spend. You can use a plugin **profile** (a named
bundle of `max_cycles`, tree depth, executor timeout, and total time budget) or set the
budget directly in your config. See [Configuration → Budgets & timeouts](configuration.md#budgets-and-timeouts).

```bash
# Use a plugin profile tuned for a 6-hour benchmark:
arbor run --config research_config.yaml
```

```yaml title="research_config.yaml"
plugin: mle_kaggle
plugin_profile: mle_bench_lite_6h
```

## 5. Launch

```bash
arbor run "maximize the competition metric" \
  --yes --yes-cwd /path/to/my_task \
  --config /path/to/my_task/research_config.yaml
```

Arbor runs a quick preflight against the project (git state, protected paths, eval
command) and then begins the study.

## A worked example: Kaggle / MLE-bench

Arbor ships with the `mle_kaggle` plugin, which encodes the eval contract, protected
paths, and a set of time-budget profiles for Kaggle-style competitions. See
[Plugins](plugins.md) for the full walkthrough and `examples/kaggle_config.example.yaml`
in the repository for a ready-to-edit config.
