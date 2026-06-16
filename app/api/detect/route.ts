import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/deepseek";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { FALLBACK_RESULT, type DetectResult } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---- 简易 IP 速率限制 ---- */
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;
const ipRequests = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  record.count++;
  return record.count <= RATE_LIMIT_MAX;
}

// 定期清理过期记录
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    ipRequests.forEach((rec, ip) => {
      if (now > rec.resetAt) keysToDelete.push(ip);
    });
    keysToDelete.forEach((ip) => ipRequests.delete(ip));
  }, 120_000);
}

interface DetectRequestBody {
  me?: string;
  her?: string;
  chatLog?: string;
  gender?: string;
}

export async function POST(req: NextRequest) {
  // 速率限制
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }

  let body: DetectRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求体不是合法 JSON" },
      { status: 400 }
    );
  }

  const chatLog = (body.chatLog || "").trim();
  const me = (body.me || "我").trim();
  const her = (body.her || "她").trim();
  const gender = body.gender === "female" ? "female" : "male";

  if (!chatLog || chatLog.length < 20) {
    return NextResponse.json(
      { ok: false, error: "聊天记录至少需要 20 个字" },
      { status: 400 }
    );
  }
  if (chatLog.length > 800) {
    return NextResponse.json(
      { ok: false, error: "聊天记录不要超过 800 字" },
      { status: 400 }
    );
  }

  // 构造 user message，女生视角追加说明
  let userMessage = `以下是${me}和${her}的聊天记录，请分析暧昧信号：\n\n${chatLog}`;
  if (gender === "female") {
    userMessage = `注意：用户是女生，启用女生视角模式。\n分析方向：他读懂我的信号了吗。\n额外输出 his_awareness / signal_clarity / female_suggestion 字段。\n\n${userMessage}`;
  }

  let raw: string;
  try {
    raw = await chatCompletion({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      maxTokens: 1000,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI 调用失败";
    console.error("[/api/detect] DeepSeek 调用失败：", msg);
    return NextResponse.json({ ok: true, result: FALLBACK_RESULT });
  }

  // 解析 JSON
  let result: DetectResult;
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    result = JSON.parse(clean);
  } catch {
    console.error("[/api/detect] JSON 解析失败：", raw.slice(0, 200));
    return NextResponse.json({ ok: true, result: FALLBACK_RESULT });
  }

  // 校验字段
  if (
    typeof result.pct !== "number" ||
    !Array.isArray(result.signals) ||
    typeof result.xiaoai !== "string" ||
    typeof result.bold_line !== "string"
  ) {
    console.error("[/api/detect] 字段校验失败");
    return NextResponse.json({ ok: true, result: FALLBACK_RESULT });
  }

  // 钳制 pct 到 0-100
  result.pct = Math.round(Math.max(0, Math.min(100, result.pct)));

  // 兼容：如果返回了 type 但没有 primary_type，自动映射
  if (!result.primary_type && result.type) {
    result.primary_type = result.type;
  }
  if (result.primary_type && !result.type) {
    result.type = result.primary_type;
  }

  // 确保 behavior_data 存在
  if (!result.behavior_data) {
    result.behavior_data = FALLBACK_RESULT.behavior_data;
  }

  // 确保 risk 字段存在
  if (typeof result.risk !== "string") {
    result.risk = "";
  }

  // 确保 secondary_type 存在
  if (typeof result.secondary_type !== "string") {
    result.secondary_type = "";
  }

  // 确保 signals 中每个都有 proof 字段
  result.signals = result.signals.map((s) => ({
    quote: (s as any).quote || "",
    layer1: (s as any).layer1 || "",
    layer2: (s as any).layer2 || "",
    layer3: (s as any).layer3 || "",
    proof: (s as any).proof || "",
  }));

  return NextResponse.json({ ok: true, result });
}
