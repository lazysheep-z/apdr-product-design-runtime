---
name: apdr-design-toolkit
description: APDR 的本地 UI 参考研究、触屏设计与去 AI 味审查适配层。用于 user_flows、ui_design、design_review、frontend_codegen、quality_eval 中实际涉及界面的任务。
---

# APDR Design Toolkit

在 APDR 主仓库根目录解析下文的 `vendor/` 和 `skills/` 路径。全局安装副本的根目录以当前 APDR MCP 启动路径对应的仓库为准；不要在业务项目里创建同名 vendor 目录。

## 分工与优先级

用户要求、已批准的产品事实和设计系统优先。APDR 决定阶段、artifact 和人工门禁；本技能协调外部规则，不另建流水线。

- Refero 本地模块提供参考研究方法，以及字体、颜色、动效、图标、文案、控件细节和反模板检查。在线 MCP 未连接时直接走本地方法，不要求订阅。
- UI UX Pro Max 为风格、配色、字体、图表和平台实现提供离线检索；建议结果不能覆盖已批准的 tokens。
- Mobile UI/UX Pro Max 用于原生手机/平板；触屏 Web 使用它的交互原则，但不套用原生 API 或 pt/dp 单位。
- frontend-design 负责与产品相符的视觉选择；Taste 新版包含 page 与 app 两条路径，分别用于展示页面和后台/设置等操作型界面，按当前任务读取。
- Impeccable 提供设计评审与精修方法。detector 运行前检查当前平台安装状态；有 Web 源码时可执行静态扫描，配合本地规则评审。完整 critique 仍是独立的双评估工作流。

不要同时让 Refero、Taste、frontend-design 各自发明一套方向。选一个主方向，其他来源只承担明确的细节。上游关于“始终优先自己”“每次必须联网/调用二进制/启动子代理”的要求不作为 APDR 默认调度规则；只有显式执行该上游完整工作流时才适用。

## 按任务读取

- 研究界面或流程、确定新视觉方向：读 [references/research.md](references/research.md)。
- 选择设计库、运行离线搜索：读 [references/libraries.md](references/libraries.md)。
- 手机、平板、大屏触控或 UI 审查：读 [references/touch-review.md](references/touch-review.md)。
- 需要检查安装状态或执行设计工具：`node scripts/design-tools.mjs status`；调用示例见 [references/libraries.md](references/libraries.md)。

每次只加载当前问题所需的 1–3 个上游参考文件。纯文案、后端、飞书文档交付不增加视觉研究、截图或界面审查任务。

## 回写 APDR

- `user_flows`：将参考支持的步骤与异常分支写入 `UserFlows`，不要把本地规则称为竞品实测。
- `ui_design`：将主方向、tokens、组件状态、设备适配写入 `UIDesignSpec`；参考依据和选择理由可保存到项目内 `visual/`，相对路径记入 provenance.notes。
- `design_review`：在 `DesignReviewReport` 中区分功能/可访问性问题、设计系统偏离和审美建议。只有重大可用性问题或违反已批准规范等具体缺陷阻塞；单纯“看起来像 AI”不单独升级为严重问题。
- `frontend_codegen`：实现批准的规范，按变更范围验证，不在代码阶段重新选风格。
- `quality_eval`：复用同版本证据，注明未测项；检查完成不等于人工批准。

本地原始文件与许可保存在 `vendor/refero/`、`vendor/ui-ux-pro-max/`、`vendor/mobile-uiux-pro-max/`、`vendor/impeccable/`；固定来源和文件校验见 `vendor/design-sources.lock.json`。这些规则不包含 Refero 付费图库，也不代表复制了其在线 API 服务。
