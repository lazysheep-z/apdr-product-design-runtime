# Privacy & what not to commit

APDR is published as an open-source runtime. Keep **operator workspaces and personal accounts** out of git.

## Never commit

| Kind | Examples |
|------|----------|
| Feishu / Lark credentials | `.lark-cli/`, `appsecret*`, `*_cli_*.enc`, tokens, `open_id` |
| Machine-local MCP config | `.cursor/mcp.json`, `.mcp.json` with absolute `/Users/...` paths |
| Business project data | Anything under `projects/` except `demo` / `conv-test` stubs |
| Operator preference files | `projects/*/operator-preference.json` (gitignored; may contain local notes) |
| PII | Real names in prefs, emails, phone numbers, private Feishu tenant URLs used as identity |

`set_operator_preference` sanitizes notes (emails, `/Users/...`, Feishu tenant hosts, tokens → `[redacted]`).

## Safe to commit

- Skill docs that say “use local `lark-cli auth`” without embedding secrets
- `.cursor/mcp.json.example` with `<APDR_ROOT>` placeholders
- Anonymous demo `meta.json` files

## Feishu usage

Document import/publish goes through `skills/feishu-lark/SKILL.md`. Auth stays on the operator’s machine. Artifacts may store a **document URL** after publish, not account identifiers.

## Reusable workflow lessons

Keep only abstract product, UI and testing rules in the framework. Do not copy raw conversation history, real project names or identifiers, customer or operator records, private document links, business fixtures, screenshots, audit exports or personal paths into skills, tests, examples or release notes. Keep third-party license attribution intact. Scan the Git index before publishing; optional private deny lists stay outside the repository.
