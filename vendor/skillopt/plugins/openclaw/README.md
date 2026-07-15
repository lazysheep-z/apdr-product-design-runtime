# OpenClaw Plugin for SkillOpt-Sleep

Thin shell for running [SkillOpt-Sleep](https://github.com/microsoft/SkillOpt) on [OpenClaw](https://github.com/openclaw/openclaw).

## What it does

Adds a nightly "sleep cycle" to any OpenClaw agent. The cycle:

1. **Harvests** recent session transcripts from `~/.openclaw/agents/<name>/sessions/*.jsonl`
2. **Mines** recurring task patterns using the optimizer LLM
3. **Replays** each pattern with the current `SKILL.md` (baseline) and a candidate `SKILL.md` (with proposed edits)
4. **Gates** the candidate against the held-out score (rejects regressions)
5. **Stages** the accepted proposal in `~/.skillopt-sleep/staging/<night>/`
6. Leaves adoption to the operator (Ethan)

Nothing live changes until you adopt. Every adopt backs up first.

## Install

The plugin is a thin wrapper around the engine at `~/.openclaw/workspace/SkillOpt/skillopt_sleep/`:

```bash
# 1. Clone the engine (one-time)
cd ~/.openclaw/workspace
git clone https://github.com/microsoft/SkillOpt.git

# 2. Install the OpenClaw skill (this folder)
ln -s /path/to/openclaw ~/.openclaw/workspace/skills/skillopt-sleep

# 3. Configure
cp ~/.openclaw/workspace/skills/skillopt-sleep/config.json ~/.skillopt-sleep/config.json
$EDITOR ~/.skillopt-sleep/config.json
# Set backend = "openclaw-deepseek"
# Set model = "deepseek-v4-pro" (or "deepseek-v4-flash" for budget)

# 4. Set API key
echo 'export DEEPSEEK_API_KEY="sk-..."' >> ~/.openclaw/.env

# 5. Add the nightly cron
(crontab -l 2>/dev/null; echo "0 3 * * * cd ~/.openclaw/workspace/skills/skillopt-sleep && bash run_sleep_cron.sh >> ~/.skillopt-sleep/nightly.log 2>&1") | crontab -
```

## Use

### Manual trigger

```bash
# Run one cycle now
python3 ~/.openclaw/workspace/skills/skillopt-sleep/run_sleep.py

# Dry run (report only)
python3 ~/.openclaw/workspace/skills/skillopt-sleep/run_sleep.py --dry-run

# One category only
python3 ~/.openclaw/workspace/skills/skillopt-sleep/run_sleep.py --tasks tests/research-cron-tasks.json
```

### Slash command

```bash
# In any OpenClaw session
/sleep status
/sleep run
/sleep run research-cron
/sleep dry-run
/sleep adopt              # adopt most recent accepted proposal
/sleep reject             # discard most recent
/sleep cost
```

## Architecture

```
plugins/openclaw/
├── README.md                       # this file
├── run_sleep_cron.sh               # wrapper for cron invocation
├── run_sleep.py                    # main entry point
├── slash_sleep.py                  # /sleep command implementation
├── skillopt_sleep_openclaw.py      # DeepSeek + Ollama backend
├── config.json                     # engine config
├── SKILL.md                        # OpenClaw skill manifest
└── tests/                          # held-out test sets
    ├── research-cron-tasks.json
    ├── devops-tasks.json
    └── wiki-tasks.json
```

The OpenClaw shell is one engine (skillopt_sleep/) + one backend (DeepSeek/Ollama) + four thin wrappers (cron, slash, skill, tests).

## Why this matters for OpenClaw

OpenClaw currently has no built-in "self-evolving skills" mechanism. The community has:

- **Manual skills** — Ethan writes them
- **LLM-generated skills** — one-shot, no validation
- **Self-revision** — unbounded, no quality bar

SkillOpt-Sleep adds a 4th option: **validated self-evolution**. The skill is the training target, the engine is the optimizer, the gate is the quality bar, the operator is the human-in-the-loop.

## Validation

Validated on the public [gbrain-evals](https://github.com/garrytan/gbrain-evals) `skillopt-v1` benchmark with real Claude and Codex (deficient skills 0.00 → 1.00 on held-out, all 4 seeds).

End-to-end test on our own 14-task held-out set: pipeline runs, gate correctly rejects non-improvements, staging artifacts land in `~/.skillopt-sleep/staging/<night>/`.

## Cost

Measured: ~$0.02/night with `deepseek-v4-pro` at 12 tasks/night. ~$0.59/month, $7.18/year.

## License

MIT (same as SkillOpt core).
