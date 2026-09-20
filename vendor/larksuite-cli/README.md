# larksuite/cli skills (selected)

Source: https://github.com/larksuite/cli (official Feishu/Lark CLI + Agent Skills)

Vendored **documentation only** for APDR. No app credentials, tokens, or personal IDs are stored here.

## Included

- `lark-shared` — auth/config rules (use local `lark-cli auth login`; never commit secrets)
- `lark-doc` (+ `references/`) — cloud docs read/write
- `lark-wiki`, `lark-drive`, `lark-sheets`, `lark-base`, `lark-slides`
- `lark-im` — messaging (optional)
- `lark-minutes`, `lark-whiteboard` — optional meeting/whiteboard

## Install CLI (user machine)

```bash
npm install -g @larksuite/cli
lark-cli config init --new
lark-cli auth login --domain docs --domain drive
```

## APDR entry

See `skills/feishu-lark/SKILL.md`.
