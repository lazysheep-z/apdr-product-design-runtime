/**
 * Mock API — 后端 Java 团队可替换为正式实现
 * 契约见 ../data/api-contract.json
 * LLM：阿里云 Token Plan（OpenAI / Anthropic 兼容）
 */
import "dotenv/config";
import cors from "cors";
import express from "express";
import crypto from "node:crypto";
import { chatWithTokenPlan, getLlmConfig } from "./llm.js";

const PORT = process.env.PORT || 8787;
const GUEST_TRIAL_MAX = 3;

const rankings = {
  希尔顿酒店: {
    brand: "希尔顿酒店",
    group: "希尔顿酒店集团",
    period: "2026年04月",
    rank: 1,
    mbi: 523.41,
    mi: 201.37,
    ci: 197.28,
    ii: 124.76,
  },
  皇冠假日酒店: {
    brand: "皇冠假日酒店",
    group: "洲际酒店集团",
    period: "2026年04月",
    rank: 2,
    mbi: 511.85,
    mi: 114.17,
    ci: 219.41,
    ii: 178.27,
  },
};

const aliases = {
  希尔顿: "希尔顿酒店",
  皇冠假日: "皇冠假日酒店",
  皇冠: "皇冠假日酒店",
};

function resolveBrand(text) {
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (text.includes(alias)) return canonical;
  }
  return null;
}

function analyzeQuery(query) {
  const q = String(query).trim();
  const hasHilton = q.includes("希尔顿");
  const hasCrowne = q.includes("皇冠");

  if (hasHilton && hasCrowne) {
    const a = rankings["希尔顿酒店"];
    const b = rankings["皇冠假日酒店"];
    return {
      type: "compare",
      brands: [a, b],
      summary: `希尔顿 MBI ${a.mbi}（第${a.rank}名）领先，优势在媒体传播 MI（${a.mi}）；皇冠假日点评 CI（${b.ci}）与投资 II（${b.ii}）更强。`,
      sources: ["迈点榜单 2026-04"],
    };
  }

  const single = resolveBrand(q);
  if (single && rankings[single]) {
    const r = rankings[single];
    return {
      type: "single",
      brands: [r],
      summary: `${r.brand} ${r.period} 国际高端酒店榜单第 ${r.rank} 名，MBI ${r.mbi}。MI ${r.mi}、CI ${r.ci}、II ${r.ii}。`,
      sources: ["迈点榜单 2026-04"],
    };
  }

  return {
    type: "unknown",
    brands: [],
    summary:
      "暂未识别品牌或未接入该品牌数据。V1 演示含希尔顿、皇冠假日。可问：「希尔顿最新排名」或「皇冠假日和希尔顿对比」。",
    sources: [],
  };
}

/** LLM 模式下为 UI 卡片推断要展示的品牌数据 */
function inferBrandsForCards(query, structured) {
  if (structured.brands.length) return structured.brands;
  const q = String(query).trim();
  if (/加盟|选择|哪个品牌|选哪个|应该选|对比|怎么样|哪个好/.test(q)) {
    return [rankings["希尔顿酒店"], rankings["皇冠假日酒店"]];
  }
  return [];
}

const guestTrials = new Map();
const sessions = new Map();
const tokens = new Map();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const payload = tokens.get(auth.slice(7));
    if (payload) {
      req.user = payload;
      return next();
    }
  }
  req.user = null;
  req.guestId = req.headers["x-guest-id"] || "anonymous";
  next();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.get("/api/health", (_req, res) => {
  const llm = getLlmConfig();
  res.json({
    ok: true,
    llm: {
      enabled: llm.enabled,
      protocol: llm.protocol,
      baseUrl: llm.baseUrl,
    },
    // 兼容旧前端字段
    dashscope: llm.enabled,
  });
});

/** 短信发送 — 迈点自有平台由后端替换 */
app.post("/api/auth/sms/send", (req, res) => {
  const { phone } = req.body || {};
  if (!phone || String(phone).length < 11) {
    return res.status(400).json({ error: "invalid_phone" });
  }
  res.json({ ok: true, message: "验证码已发送（演示环境任意 4 位以上数字即可）" });
});

app.post("/api/auth/sms/login", (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code || String(code).length < 4) {
    return res.status(400).json({ error: "invalid_credentials" });
  }
  const token = crypto.randomUUID();
  tokens.set(token, { phone, loggedIn: true });
  res.json({ token, phone });
});

app.get("/api/guest/trial", (req, res) => {
  const id = req.guestId;
  const used = guestTrials.get(id) || 0;
  res.json({ used, remaining: Math.max(0, GUEST_TRIAL_MAX - used), max: GUEST_TRIAL_MAX });
});

app.post("/api/guest/trial/consume", (req, res) => {
  if (req.user) return res.json({ ok: true, remaining: GUEST_TRIAL_MAX });
  const id = req.guestId;
  const used = guestTrials.get(id) || 0;
  if (used >= GUEST_TRIAL_MAX) {
    return res.status(403).json({ error: "trial_exhausted", remaining: 0 });
  }
  guestTrials.set(id, used + 1);
  res.json({ ok: true, remaining: GUEST_TRIAL_MAX - used - 1 });
});

app.get("/api/brands", (_req, res) => {
  res.json({
    brands: Object.keys(rankings),
    total: Object.keys(rankings).length,
    note: "演示 2 品牌，正式环境 2000+",
  });
});

app.get("/api/brands/:name/ranking", (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const r = rankings[name];
  if (!r) return res.status(404).json({ error: "brand_not_found" });
  res.json(r);
});

/** 对话 — Token Plan LLM + 榜单数据上下文；无 Key 时 mock */
app.post("/api/chat", async (req, res) => {
  const { message, model = "qwen3.6-plus", history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: "message_required" });

  if (!req.user) {
    const id = req.guestId;
    const used = guestTrials.get(id) || 0;
    if (used >= GUEST_TRIAL_MAX) {
      return res.status(403).json({ error: "trial_exhausted" });
    }
    guestTrials.set(id, used + 1);
  }

  const structured = analyzeQuery(message);
  const llm = getLlmConfig();

  if (llm.enabled) {
    try {
      const reply = await chatWithTokenPlan({
        message,
        model,
        history,
        rankings,
      });
      const brands = inferBrandsForCards(message, structured);
      return res.json({
        model,
        reply,
        brands,
        sources: brands.length ? ["迈点榜单 2026-04"] : structured.sources,
        disclaimer: "迈点品牌指数 MBI 为监测参考，不能与其品牌发展完全等同",
        historyCount: history.length,
        llmMode: `token-plan-${llm.protocol}`,
      });
    } catch (err) {
      console.error("[chat] Token Plan error:", err.message);
      return res.status(502).json({
        error: "llm_request_failed",
        message: err.message,
        llmMode: `token-plan-${llm.protocol}`,
      });
    }
  }

  res.json({
    model,
    reply: structured.summary,
    brands: structured.brands,
    sources: structured.sources,
    disclaimer: "迈点品牌指数 MBI 为监测参考，不能与其品牌发展完全等同",
    historyCount: history.length,
    llmMode: "mock",
  });
});

app.get("/api/sessions", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "login_required" });
  const list = sessions.get(req.user.phone) || [];
  res.json({ sessions: list });
});

app.listen(PORT, () => {
  const llm = getLlmConfig();
  console.log(`brand-digital-intel API http://localhost:${PORT}`);
  if (llm.enabled) {
    console.log(`LLM: Token Plan (${llm.protocol}) → ${llm.baseUrl}`);
  } else {
    console.log("LLM: mock mode — set TOKEN_PLAN_API_KEY in .env to enable");
  }
});
