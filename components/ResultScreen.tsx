"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  TYPES,
  HOOKS,
  getColor,
  getTemperature,
  type DetectResult,
} from "@/lib/constants";

interface ResultScreenProps {
  result: DetectResult;
  gender?: string;
  onRetry: () => void;
}

export default function ResultScreen({ result, gender = "male", onRetry }: ResultScreenProps) {
  const pct = Math.round(Math.max(0, Math.min(100, result.pct)));
  const primaryType = result.primary_type || result.type || "";
  const secondaryType = result.secondary_type || "";
  const typeDesc = result.type_desc || TYPES[primaryType] || "";
  const temperature = result.temperature || getTemperature(pct);
  const ahaMoment = result.aha_moment || "";
  const color = getColor(pct);

  const [animatedPct, setAnimatedPct] = useState(0);
  const [copied, setCopied] = useState(false);
  const [boldCopied, setBoldCopied] = useState(false);
  const [femaleCopied, setFemaleCopied] = useState(false);
  const [showUnlockToast, setShowUnlockToast] = useState<string | null>(null);
  const [unlockedTypes, setUnlockedTypes] = useState<string[]>([]);
  const [showUnlockList, setShowUnlockList] = useState(false);
  const [lastResult, setLastResult] = useState<{ pct: number; temperature: string; primary_type: string; timestamp: number } | null>(null);
  const [showFullUnlock, setShowFullUnlock] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // 数字动画
  useEffect(() => {
    const dur = 900;
    const t0 = performance.now();
    let lastRendered = -1;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const newPct = Math.round(e * pct);
      if (newPct !== lastRendered) {
        lastRendered = newPct;
        setAnimatedPct(newPct);
      }
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [pct]);

  // localStorage: 读取上次结果 + 类型解锁
  useEffect(() => {
    // 确保在客户端执行
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("aimai_last_result");
      if (saved) {
        setLastResult(JSON.parse(saved));
      }
    } catch {}

    try {
      const saved = localStorage.getItem("aimai_unlocked_types");
      const existing: string[] = saved ? JSON.parse(saved) : [];
      const newTypes = [primaryType, secondaryType].filter(Boolean);
      const toAdd = newTypes.filter((t) => !existing.includes(t));

      if (toAdd.length > 0) {
        const updated = [...existing, ...toAdd];
        localStorage.setItem("aimai_unlocked_types", JSON.stringify(updated));
        setUnlockedTypes(updated);
        // 显示解锁提示
        toAdd.forEach((t, i) => {
          setTimeout(() => setShowUnlockToast(t), i * 1500);
        });
        // 全部解锁
        if (updated.length >= 20) {
          setTimeout(() => setShowFullUnlock(true), 1000);
          setTimeout(() => setShowFullUnlock(false), 4000);
        }
      } else {
        setUnlockedTypes(existing);
      }
    } catch {}

    // 保存本次结果
    try {
      localStorage.setItem(
        "aimai_last_result",
        JSON.stringify({ pct, temperature, primary_type: primaryType, timestamp: Date.now() })
      );
    } catch {}
  }, [pct, temperature, primaryType, secondaryType]);

  // 解锁提示自动消失
  useEffect(() => {
    if (showUnlockToast) {
      const t = setTimeout(() => setShowUnlockToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [showUnlockToast]);

  // 复制分享文案
  const handleCopy = useCallback(() => {
    if (typeof window === "undefined") return;
    
    const text = [
      `暧昧检测局鉴定报告`,
      ``,
      `${temperature}`,
      `类型：${primaryType}${secondaryType ? " + " + secondaryType : ""}`,
      ``,
      `小暧说：`,
      `「${result.sp_quote}」`,
      ``,
      `今晚小暧让我发：`,
      `${result.bold_line}`,
      ``,
      `aimai.starfluxes.com`,
      `你也有一段搞不懂的聊天记录吗 →`,
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {});
  }, [pct, result, temperature, primaryType, secondaryType]);

  // 复制 bold_line
  const handleCopyBold = useCallback(() => {
    if (typeof window === "undefined") return;
    
    navigator.clipboard.writeText(result.bold_line).then(() => {
      setBoldCopied(true);
      setTimeout(() => setBoldCopied(false), 2500);
    }).catch(() => {});
  }, [result.bold_line]);

  // 复制 female_suggestion
  const handleCopyFemale = useCallback(() => {
    if (typeof window === "undefined") return;
    
    if (result.female_suggestion) {
      navigator.clipboard.writeText(result.female_suggestion).then(() => {
        setFemaleCopied(true);
        setTimeout(() => setFemaleCopied(false), 2500);
      }).catch(() => {});
    }
  }, [result.female_suggestion]);

  // 截这句：生成单句分享卡片
  const handleCaptureSignal = useCallback((layer3: string) => {
    if (typeof window === "undefined") return;
    
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 背景
    ctx.fillStyle = "#1d0f12";
    ctx.fillRect(0, 0, 600, 400);

    // 文字
    ctx.fillStyle = "#ffb2be";
    ctx.font = "20px 'Noto Serif SC', Georgia, serif";
    ctx.textAlign = "center";
    // 自动换行
    const maxWidth = 480;
    const words = layer3.split("");
    let line = "";
    let y = 160;
    for (const char of words) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line, 300, y);
        line = char;
        y += 32;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 300, y);

    // 底部
    ctx.fillStyle = "rgba(225, 190, 194, 0.3)";
    ctx.font = "12px sans-serif";
    ctx.fillText("aimai.starfluxes.com", 300, 360);

    // 下载
    const link = document.createElement("a");
    link.download = "aimai-signal.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // 温度对比
  const lastTempNum = lastResult?.temperature?.match(/([\d.]+)°/)?.[1];
  const currentTempNum = temperature.match(/([\d.]+)°/)?.[1];
  const tempDiff = lastTempNum && currentTempNum ? parseFloat(currentTempNum) - parseFloat(lastTempNum) : null;
  const tempTrend = tempDiff !== null
    ? tempDiff > 0 ? "温度在升。" : tempDiff < 0 ? "冷下来了。" : "还在原地。"
    : null;

  return (
    <div className="px-edge-margin pt-6 pb-20" ref={resultRef}>
      {/* 解锁提示 Toast */}
      {showUnlockToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-3 rounded-xl text-sm text-primary animate-fade-up">
          解锁新类型：{showUnlockToast}
        </div>
      )}

      {/* 全解锁特效 */}
      {showFullUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-up">
          <div className="text-center px-8">
            <p className="text-2xl text-primary font-light mb-3">
              你解锁了全部20种暧昧类型。
            </p>
            <p className="text-sm text-on-surface-variant/60">
              小暧说：你的感情经历有点复杂啊。
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-headline-lg text-on-surface font-light">
            鉴定报告
          </h2>
          <p className="label-caps text-on-surface-variant/40 mt-1">
            暧昧检测局 · 小暧出品
          </p>
        </div>
        <button
          className="label-caps text-on-surface-variant/60 glass-card px-3 py-1.5 rounded-lg hover:text-primary transition-colors active:scale-95"
          onClick={onRetry}
        >
          重新鉴定
        </button>
      </header>

      {/* 温度对比 */}
      {lastResult && tempTrend && (
        <div className="text-center mb-4 animate-fade-up">
          <span className="text-xs text-on-surface-variant/40">
            上次 {lastTempNum}° → 这次 {currentTempNum}° · {tempTrend}
          </span>
        </div>
      )}

      {/* 模块0：AHA 时刻 */}
      {ahaMoment && (
        <section className="text-center mb-6 animate-fade-up" style={{ animationDelay: "0s" }}>
          <p className="font-serif text-[22px] leading-relaxed" style={{ color: "#ff4d7e" }}>
            {ahaMoment}
          </p>
        </section>
      )}

      {/* 模块1：温度隐喻句 */}
      <section
        className="glass-card rounded-3xl p-6 text-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <p
          className="font-serif text-[22px] leading-relaxed"
          style={{ color: color.text }}
        >
          「{temperature}」
        </p>
      </section>

      {/* 模块2：暧昧指数卡片 */}
      <section
        className="glass-card rounded-3xl p-8 mb-6 animate-fade-up"
        style={{
          animationDelay: "0.2s",
          boxShadow: `0 0 20px ${color.main}20`,
        }}
      >
        <div className="flex flex-col items-center">
          <span className="label-caps text-on-surface-variant/40 mb-4">
            暧昧指数
          </span>
          <div className="relative">
            <span
              className="text-display-hero-mobile tracking-tighter transition-all duration-1000 number-glow"
              style={{ color: color.main }}
            >
              {animatedPct}
            </span>
            <span
              className="absolute -right-5 bottom-3 text-lg opacity-60"
              style={{ color: color.main }}
            >
              %
            </span>
          </div>
          {/* 类型标签 */}
          <div className="text-center mt-3">
            <span className="text-primary text-lg font-light">{primaryType}</span>
            {secondaryType && (
              <span className="text-on-surface-variant/50 text-sm ml-2">+ {secondaryType}</span>
            )}
          </div>
          {typeDesc && (
            <p className="text-xs text-on-surface-variant/40 mt-1 text-center">{typeDesc}</p>
          )}
        </div>
        {/* Progress Bar */}
        <div className="w-full mt-6">
          <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[1300ms] ease-out"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, #4e436a 0%, ${color.bar} 50%, ${color.main} 100%)`,
              }}
            />
          </div>
        </div>
        {/* 行为数据面板 */}
        {result.behavior_data && (
          <div className="mt-5 space-y-1.5 text-xs text-on-surface-variant/40 font-light">
            <div>
              {result.behavior_data.her_initiative} · {result.behavior_data.your_initiative}
            </div>
            {result.behavior_data.reply_ratio && (
              <div>{result.behavior_data.reply_ratio}</div>
            )}
            <div>{result.behavior_data.unnecessary_questions}</div>
            {result.behavior_data.time_signal && (
              <div>时间信号：{result.behavior_data.time_signal}</div>
            )}
            <div className="border-t border-white/5 pt-2 mt-2">
              <p style={{ color: color.text }} className="text-sm">
                {result.behavior_data.summary}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 模块3：信号解读卡片 */}
      <section
        className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        <p className="label-caps text-on-surface-variant/40 mb-4">
          关键信号解读
        </p>
        <div className="space-y-6">
          {result.signals.map((signal, i) => (
            <div key={i} className="space-y-3 relative">
              {/* 截这句按钮 */}
              <button
                className="absolute -top-1 right-0 text-[10px] text-primary/50 hover:text-primary transition-colors"
                onClick={() => handleCaptureSignal(signal.layer3)}
              >
                截这句
              </button>
              {/* Quote */}
              <div className="signal-quote-border pl-4 py-1">
                <p className="font-serif text-body-quote italic text-on-surface-variant">
                  &ldquo;{signal.quote}&rdquo;
                </p>
              </div>
              {/* Layers */}
              <div className="space-y-2 pl-2">
                <div className="text-xs text-on-surface-variant/50">
                  <span className="text-on-surface-variant/30 mr-1">表面</span>
                  {signal.layer1}
                </div>
                <div className="text-xs text-on-surface-variant/50">
                  <span className="text-on-surface-variant/30 mr-1">其实</span>
                  {signal.layer2}
                </div>
                <div
                  className="text-sm font-medium mt-1"
                  style={{ color: color.text }}
                >
                  <span className="text-on-surface-variant/30 mr-1 text-xs font-normal">
                    深了
                  </span>
                  {signal.layer3}
                </div>
                {signal.proof && (
                  <div className="text-[11px] text-on-surface-variant/30 mt-1 pl-2 border-l border-white/5">
                    依据：{signal.proof}
                  </div>
                )}
              </div>
              {i < result.signals.length - 1 && (
                <div className="border-t border-white/5 pt-4" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 模块4：小暧说卡片 */}
      <section
        className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
        style={{
          animationDelay: "0.4s",
          backgroundColor: color.bg,
        }}
      >
        <div className="flex gap-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${color.main}, ${color.avatarBg})`,
              color: "#fff",
            }}
          >
            暧
          </div>
          <div className="flex-grow space-y-2">
            <div
              className="label-caps"
              style={{ color: color.text, opacity: 0.7 }}
            >
              小暧说
            </div>
            <div className="text-body-md font-light leading-relaxed text-on-surface/90 whitespace-pre-line">
              {result.xiaoai}
            </div>
          </div>
        </div>
      </section>

      {/* 风险提示卡片 */}
      {result.risk && (
        <section
          className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
          style={{
            animationDelay: "0.45s",
            borderStyle: "dashed",
            backgroundColor: "rgba(255, 100, 50, 0.05)",
          }}
        >
          <div className="flex gap-3">
            <span className="text-sm opacity-60">⚠</span>
            <div>
              <p className="label-caps text-on-surface-variant/40 mb-2">
                小暧提醒
              </p>
              <p className="text-sm text-on-surface-variant/70 font-light leading-relaxed whitespace-pre-line">
                {result.risk}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 模块5：小暧忍不住了卡片 */}
      <section
        className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
        style={{
          animationDelay: "0.5s",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <span
            className="label-caps"
            style={{ color: color.text }}
          >
            小暧忍不住了
          </span>
          <svg
            className="w-4 h-4"
            style={{ color: color.main }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        <p className="text-xs text-on-surface-variant/50 mb-2">
          要是我，我就这么回她：
        </p>
        <p className="font-serif text-xl text-on-surface leading-tight mb-2">
          「{result.bold_line}」
        </p>
        <p className="text-xs text-on-surface-variant/40 mb-4">
          {result.bold_reason}
        </p>

        <div className="border-t border-white/5 pt-4">
          <p className="label-caps text-on-surface-variant/30 mb-2">
            稳一稳版
          </p>
          <p className="text-sm text-on-surface-variant/60 font-light">
            「{result.safe_line}」
          </p>
          <p className="text-xs text-on-surface-variant/30 mt-3 text-right italic">
            {result.ending || "剩下的，看她接不接。"}
          </p>
        </div>

        {/* 复制台词按钮 */}
        <button
          className="w-full mt-4 py-3 glass-card rounded-xl text-sm text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
          onClick={handleCopyBold}
        >
          {boldCopied ? "已复制" : "复制小暧的台词"}
        </button>
      </section>

      {/* 模块6：女生视角结果 */}
      {gender === "female" && (
        <>
          {/* 感知评分 */}
          {typeof result.his_awareness === "number" && (
            <section
              className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
              style={{ animationDelay: "0.55s" }}
            >
              <p className="label-caps text-on-surface-variant/40 mb-3">
                他的信号感知评分
              </p>
              <div
                className="text-5xl font-light number-glow mb-2"
                style={{ color: color.main }}
              >
                {result.his_awareness}
              </div>
              <p className="text-sm text-on-surface-variant/60 font-light">
                {result.his_awareness <= 30
                  ? "他真的没看出来，不是不喜欢你。"
                  : result.his_awareness <= 60
                  ? "他可能感觉到了，但不确定。"
                  : result.his_awareness <= 80
                  ? "他感觉到了，在等你再明确一点。"
                  : "他知道，他在等你先说。"}
              </p>
            </section>
          )}

          {/* 信号清晰度 */}
          {result.signal_clarity && (
            <section
              className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
              style={{ animationDelay: "0.6s" }}
            >
              <p className="label-caps text-on-surface-variant/40 mb-3">
                你的信号清晰度
              </p>
              <p
                className="text-2xl font-light"
                style={{
                  color:
                    result.signal_clarity === "直接"
                      ? "#59e073"
                      : result.signal_clarity === "模糊"
                      ? "#d85a30"
                      : "#b91c1c",
                }}
              >
                {result.signal_clarity}
              </p>
            </section>
          )}

          {/* 小暧建议 */}
          {result.female_suggestion && (
            <section
              className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
              style={{ animationDelay: "0.65s" }}
            >
              <p className="label-caps text-on-surface-variant/40 mb-3">
                小暧建议
              </p>
              <p className="font-serif text-lg text-on-surface/90 leading-relaxed mb-4">
                {result.female_suggestion}
              </p>
              <button
                className="w-full py-3 glass-card rounded-xl text-sm text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
                onClick={handleCopyFemale}
              >
                {femaleCopied ? "已复制" : "复制这句话"}
              </button>
            </section>
          )}
        </>
      )}

      {/* 模块7：分享卡片 */}
      <section
        className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
        style={{ animationDelay: "0.7s" }}
      >
        <p className="label-caps text-on-surface-variant/40 mb-4">
          {gender === "female" ? "分享给姐妹" : "分享给哥们"}
        </p>
        {/* Preview */}
        <div className="glass-card rounded-xl p-5 mb-4">
          <p className="label-caps text-on-surface-variant/30 mb-2">
            暧昧检测局 · 鉴定报告
          </p>
          <div className="flex items-baseline gap-2">
            <div
              className="text-4xl font-light number-glow"
              style={{ color: color.main }}
            >
              {pct}%
            </div>
            <span className="text-xs text-on-surface-variant/50">{temperature}</span>
          </div>
          <p className="text-sm text-on-surface-variant/60 mt-1">
            {primaryType}{secondaryType ? " + " + secondaryType : ""}
          </p>
          <div className="border-t border-white/5 my-3" />
          <p className="text-sm text-on-surface-variant/50 italic font-serif">
            「{result.sp_quote}」
          </p>
          <p className="text-sm text-on-surface font-medium mt-2">
            {result.bold_line}
          </p>
          <p className="label-caps text-on-surface-variant/30 mt-3">
            aimai.starfluxes.com · 你也有一段搞不懂的聊天吗
          </p>
        </div>
        <button
          className="w-full py-3.5 bg-primary-container text-white rounded-xl font-light tracking-widest text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ boxShadow: `0 4px 20px ${color.main}30` }}
          onClick={handleCopy}
        >
          {copied ? "已复制，发给哥们看" : "复制分享文案"}
        </button>
      </section>

      {/* 模块9：类型解锁系统 */}
      {unlockedTypes.length > 0 && (
        <section
          className="glass-card rounded-3xl p-5 mb-6 animate-fade-up"
          style={{ animationDelay: "0.75s" }}
        >
          <button
            className="w-full flex justify-between items-center"
            onClick={() => setShowUnlockList(!showUnlockList)}
          >
            <span className="text-sm text-on-surface-variant/60 font-light">
              已解锁 {unlockedTypes.length}/20 种暧昧类型
            </span>
            <span className="text-xs text-primary/50">
              {showUnlockList ? "收起" : "展开"}
            </span>
          </button>
          {showUnlockList && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
              {unlockedTypes.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md text-[10px] text-on-surface-variant/70"
                  style={{ backgroundColor: "rgba(255, 77, 126, 0.1)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 四钩子 2x2 Grid */}
      <section
        className="grid grid-cols-2 gap-3 animate-fade-up"
        style={{ animationDelay: "0.8s" }}
      >
        {HOOKS.map((hook) => (
          <a
            key={hook.name}
            href={hook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-4 rounded-2xl flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200 active:scale-95"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: hook.color }}
                />
                <span className="text-sm font-medium text-on-surface">
                  {hook.name}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant/50 leading-relaxed">
                {hook.desc}
              </p>
            </div>
            <p className="text-xs text-primary/60 mt-3">{hook.cta}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
