# 通用产品、UI 与测试流程

APDR v0.4.0 将可复用验收规则连接到现有 13 阶段，不增加阶段或默认扩大工作范围。

| 阶段 | 使用的规则与产物 |
|---|---|
| requirements_analysis / prd | 筛选、日期、树表、编辑日志、批量、导入导出和指标口径 → 可测试验收条件 |
| user_flows / information_architecture | 真实入口、缓存往返、权限与异常分支 → 流程及导航 |
| ui_design | 组件状态、稳定分类色、图表与明细一致性、设备适配 → UIDesignSpec |
| design_review | 当前规范、弹层/编辑状态、主按钮状态、可访问性 → DesignReviewReport |
| frontend_codegen | 增量基线、共用组件影响、最终交付哈希、保存/导出闭环 → CodeBundle |
| handoff / quality_eval | 覆盖矩阵、版本关联证据、缺陷与未测项、使用边界 → HandoffDoc / QualityReport |

规则入口为 `skills/product-quality/SKILL.md`，同时绑定 stage playbook 与 agent registry。`get_next_action` 的执行指引可发现该入口。

独立审查只使用适用技能并写 draft 报告；缺少正式上游产物时不创建假的全流程审批。纯文案/文档不运行 UI 工具。测试使用隔离匿名数据，不访问或修改真实业务项目。

质量报告分数与通过状态分开；失败或缺少显式通过状态的审查报告不能批准。可选 verification 校验当前版本、范围、必测结论和重大问题复测，旧报告仍兼容显式 passed=true。

运行 `npm run build`、`npm run typecheck`、`npm run test:quality`。发布前暂存文件并运行 `npm run privacy:check`；私有排除词可用 `--deny-file` 指向仓库外 JSON 数组。此检查只扫描 Git index，不上传其内容。上游第三方署名和许可证应保留；操作者与客户资料不得入库。
