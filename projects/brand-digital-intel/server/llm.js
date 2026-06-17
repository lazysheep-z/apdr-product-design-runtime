/**
 * 阿里云 Token Plan — OpenAI / Anthropic 兼容协议
 * OpenAI: https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
 * Anthropic: https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic
 */

const DEFAULT_OPENAI_BASE =
  "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1";
const DEFAULT_ANTHROPIC_BASE =
  "https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic";

const MODEL_MAP = {
  "qwen3.7-max": process.env.TOKEN_PLAN_MODEL_MAX || "qwen3.7-max",
  "qwen3.6-plus": process.env.TOKEN_PLAN_MODEL_PLUS || "qwen3.6-plus",
  "qwen3.6-flash": process.env.TOKEN_PLAN_MODEL_FLASH || "qwen3.6-flash",
};

export function getLlmConfig() {
  const apiKey =
    process.env.TOKEN_PLAN_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";
  const protocol = (process.env.TOKEN_PLAN_PROTOCOL || "openai").toLowerCase();
  const baseUrl =
    process.env.TOKEN_PLAN_BASE_URL ||
    (protocol === "anthropic" ? DEFAULT_ANTHROPIC_BASE : DEFAULT_OPENAI_BASE);

  return {
    enabled: Boolean(apiKey),
    apiKey,
    protocol: protocol === "anthropic" ? "anthropic" : "openai",
    baseUrl: baseUrl.replace(/\/$/, ""),
  };
}

export function resolveModelId(model) {
  return MODEL_MAP[model] || model || MODEL_MAP["qwen3.6-plus"];
}

export function buildSystemPrompt(rankings) {
  const rows = Object.values(rankings);
  return `你是「迈点品牌情报」专业助手，基于迈点 MBI 品牌指数体系（MI 媒体传播、CI 用户点评、II 投资潜力）分析酒店品牌。

当前已接入演示数据（${rows[0]?.period ?? "最新"} · 国际高端酒店）：
${JSON.stringify(rows, null, 2)}

要求：
1. 仅基于上述结构化数据作答；未接入品牌须明确说明 V1 演示仅含希尔顿、皇冠假日。
2. 加盟选型、品牌对比、排名解读、维度拆解均可回答；对比时给出可执行结论与依据（引用 MBI/MI/CI/II 数值）。
3. 使用简洁、专业的中文；分段清晰，避免空泛营销话术。
4. 不要编造榜单中没有的品牌数据。`;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content) }));
}

async function chatOpenAiCompatible({ baseUrl, apiKey, model, systemPrompt, history, message }) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg =
      data?.error?.message || data?.message || data?.error || res.statusText || "openai_compatible_error";
    throw new Error(String(errMsg));
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty_llm_response");
  return String(content).trim();
}

async function chatAnthropicCompatible({ baseUrl, apiKey, model, systemPrompt, history, message }) {
  const messages = [...history, { role: "user", content: message }];

  const res = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data?.error?.message || data?.message || res.statusText || "anthropic_compatible_error";
    throw new Error(String(errMsg));
  }

  const textBlock = data?.content?.find((b) => b.type === "text");
  const content = textBlock?.text ?? data?.content?.[0]?.text;
  if (!content) throw new Error("empty_llm_response");
  return String(content).trim();
}

/**
 * @param {{ message: string, model: string, history: object[], rankings: object }} params
 */
export async function chatWithTokenPlan({ message, model, history, rankings }) {
  const cfg = getLlmConfig();
  if (!cfg.enabled) {
    throw new Error("llm_not_configured");
  }

  const resolvedModel = resolveModelId(model);
  const systemPrompt = buildSystemPrompt(rankings);
  const normalizedHistory = normalizeHistory(history);

  if (cfg.protocol === "anthropic") {
    return chatAnthropicCompatible({
      baseUrl: cfg.baseUrl,
      apiKey: cfg.apiKey,
      model: resolvedModel,
      systemPrompt,
      history: normalizedHistory,
      message,
    });
  }

  return chatOpenAiCompatible({
    baseUrl: cfg.baseUrl,
    apiKey: cfg.apiKey,
    model: resolvedModel,
    systemPrompt,
    history: normalizedHistory,
    message,
  });
}
