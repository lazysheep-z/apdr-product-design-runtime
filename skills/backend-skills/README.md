# Backend skills（用户扩展目录）

把你后续提供的**后端专用** `SKILL.md` 放到本目录下，例如：

```
skills/backend-skills/
  my-api-scaffold/SKILL.md
  java-spring-crud/SKILL.md
```

APDR 进入 `backend_codegen` 且 `ProjectBrief.includeBackend=true` 时，Agent 会：

1. 扫描本目录所有 `*/SKILL.md`
2. 优先按这些 skill 执行
3. 再写入 `BackendCodeBundle` artifact

## 约定

- 不要在 skill 或示例里写真实密钥 / 个人 CLI ID
- 产出路径默认：`projects/{projectId}/server/`
- 必须与 PRD + 前端 `CodeBundle` 的 API 契约对齐

当前为空时：使用 `skills/backend-engineer/SKILL.md` 的默认 Express stub 流程。
