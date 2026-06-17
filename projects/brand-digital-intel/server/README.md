# brand-digital-intel Mock API

Express 演示后端，契约见 `../data/api-contract.json`。

## 启动

```bash
npm install
cp .env.example .env
# 编辑 .env，填入 TOKEN_PLAN_API_KEY
npm start
```

## 阿里云 Token Plan（大模型）

| 协议 | Base URL |
|------|----------|
| OpenAI 兼容（默认） | `https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1` |
| Anthropic 兼容 | `https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic` |

环境变量：

| 变量 | 说明 |
|------|------|
| `TOKEN_PLAN_API_KEY` | Token Plan API Key（必填才启用 LLM） |
| `TOKEN_PLAN_PROTOCOL` | `openai`（默认）或 `anthropic` |
| `TOKEN_PLAN_BASE_URL` | 覆盖默认 Base URL |
| `DASHSCOPE_API_KEY` | 兼容别名，与上同效 |

未配置 Key 时 `/api/chat` 降级为关键词 mock；配置后走真实大模型，并在 system prompt 注入希尔顿/皇冠假日榜单数据。

## 健康检查

```bash
curl http://localhost:8787/api/health
```

返回 `llm.enabled: true` 表示已接入 Token Plan。
