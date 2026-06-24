# APDR × Ruflo: Multi-Agent Orchestration Engine

Ruflo（原名 claude-flow, 61k★）作为 APDR 的底层编排引擎，将 11 阶段流水线转型为**多 Agent Swarm**。

## 为什么要用 Ruflo

| 对比项 | APDR 原生 Orchestrator | APDR + Ruflo |
|--------|------------------------|--------------|
| 执行模式 | 线性, 逐一推进 | Pipeline + 并行组 |
| Agent 通信 | 通过 artifact 文件间接传递 | 共享内存 + 上下文窗口 |
| 错误恢复 | 手动 rollback | 自动重试 + pause/skip |
| 并发能力 | 无 | 最多 3 个 agent 并行 |
| 记忆系统 | 最后一次 artifact | 滑动窗口（10 条） |

## 安装

```bash
# 在 APDR 根目录执行
npm install ruflo

# 或全局安装
npm install -g ruflo
```

## 启动

```bash
# 启动完整 APDR swarm（需先安装 ruflo）
npx ruflo start --config packages/ruflo-apdr/config/ruflo-config.yaml

# 开发模式（带热重载）
npx ruflo dev --config packages/ruflo-apdr/config/ruflo-config.yaml

# 查看 swarm 状态
npx ruflo status --config packages/ruflo-apdr/config/ruflo-config.yaml
```

## 架构

```
npx ruflo start
    │
    ▼
┌──────────────────────────────────────────────────┐
│              Ruflo Swarm Engine                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  ...  │
│  │ intake   │→│ req anal │→│ prd      │→ ...   │
│  │ SKILL.md │  │ SKILL.md │  │ SKILL.md │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│         │            │            │              │
│         ▼            ▼            ▼              │
│         Shared Memory (artifact window = 10)     │
│                   │                              │
│                   ▼                              │
│               MCP Servers                        │
│  (design-artifacts, research, diagram, etc.)     │
└──────────────────────────────────────────────────┘
```

## Agent 依赖关系

```
intake → req_analysis → prd → ux_flow → ia → wireframes → visual → design_review → code → handoff → quality
                                     ↑——————↑
                             并行组入口    并行组入口
```

当前配置为 `consensus: sequential`（线性推进），如需并行可改为 `hybrid`。

## 配置说明

编辑 `config/ruflo-config.yaml`：

- `swarm.max_concurrent_agents` — 并行 agent 数上限（默认 3）
- `swarm.consensus` — sequential / parallel / hybrid
- `memory.context_window` — 每个 agent 能看到的上游产物数量
- `pipeline.retry` — 失败重试策略
- `pipeline.on_failure` — pause / skip / retry

## 参考

- [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow) — Ruflo GitHub (61k★)
- `npx ruflo --help` — Ruflo CLI 文档
