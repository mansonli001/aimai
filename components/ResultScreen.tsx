"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TYPES,
  HOOKS,
  getColor,
  getTagline,
  type DetectResult,
} from "@/lib/constants";

interface ResultScreenProps {
  result: DetectResult;
  onRetry: () => void;
}

export default function ResultScreen({ result, onRetry }: ResultScreenProps) {
  const pct = Math.round(Math.max(0, Math.min(100, result.pct)));
  const typeDesc = TYPES[result.type] || "";
  const tagline = getTagline(pct);
  const color = getColor(pct);

  const [animatedPct, setAnimatedPct] = useState(0);
  const [copied, setCopied] = useState(false);

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

  // 复制文案
  const handleCopy = useCallback(() => {
    const text = [
      `暧昧检测局鉴定报告`,
      ``,
      `暧昧指数：${pct}`,
      `类型：${result.type}`,
      `小暧说：「${result.sp_quote}」`,
      `今晚小暧让我发：${result.bold_line}`,
      ``,
      `aimai.starfluxes.com · 你也有一段搞不懂的聊天吗 →`,
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          alert("复制失败，请手动复制");
        }
        document.body.removeChild(ta);
      });
  }, [pct, result]);

  return (
    <div className="px-edge-margin pt-6 pb-20">
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

      {/* 1. 定调句卡片 */}
      <section
        className="glass-card rounded-3xl p-6 text-center mb-6 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <p
          className="font-serif text-[22px] leading-relaxed"
          style={{ color: color.text }}
        >
          「{tagline}」
        </p>
      </section>

      {/* 2. 暧昧指数卡片 */}
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
          <div className="text-primary text-lg font-light mt-2">
            {result.type}
          </div>
          <p className="text-sm text-on-surface-variant/50 mt-1">
            {typeDesc}
          </p>
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
      </section>

      {/* 3. 行为数据卡片 */}
      {result.behavior_data && (
        <section
          className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
          style={{ animationDelay: "0.25s" }}
        >
          <p className="label-caps text-on-surface-variant/40 mb-4">
            小暧数了一下
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.main }}
              />
              <span className="text-sm text-on-surface/80 font-light">
                {result.behavior_data.her_initiative}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.main, opacity: 0.6 }}
              />
              <span className="text-sm text-on-surface/80 font-light">
                {result.behavior_data.your_initiative}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.main, opacity: 0.4 }}
              />
              <span className="text-sm text-on-surface/80 font-light">
                {result.behavior_data.unnecessary_questions}
              </span>
            </div>
            <div className="border-t border-white/5 pt-3 mt-3">
              <p className="text-sm font-light" style={{ color: color.text }}>
                {result.behavior_data.summary}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. 关键信号卡片 */}
      <section
        className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        <p className="label-caps text-on-surface-variant/40 mb-4">
          关键信号解读
        </p>
        <div className="space-y-6">
          {result.signals.map((signal, i) => (
            <div key={i} className="space-y-3">
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
                {/* Proof */}
                {signal.proof && (
                  <div className="text-xs text-on-surface-variant/30 mt-1 pl-2 border-l border-white/5">
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

      {/* 5. 小暧的话卡片 */}
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

      {/* 6. 风险提示卡片 */}
      {result.risk && (
        <section
          className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
          style={{
            animationDelay: "0.45s",
            borderLeft: `2px solid ${color.main}40`,
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

      {/* 7. 小暧忍不住了卡片 */}
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
            剩下的，看她接不接。
          </p>
        </div>
      </section>

      {/* 分享卡片 */}
      <section
        className="glass-card rounded-3xl p-6 mb-6 animate-fade-up"
        style={{ animationDelay: "0.6s" }}
      >
        <p className="label-caps text-on-surface-variant/40 mb-4">
          分享给哥们
        </p>
        {/* Preview */}
        <div className="glass-card rounded-xl p-5 mb-4">
          <p className="label-caps text-on-surface-variant/30 mb-2">
            暧昧检测局 · 鉴定报告
          </p>
          <div
            className="text-4xl font-light number-glow"
            style={{ color: color.main }}
          >
            {pct}%
          </div>
          <p className="text-sm text-on-surface-variant/60 mt-1">
            {result.type}
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
          {copied ? "已复制，发给哥们看" : "复制小暧的台词"}
        </button>
      </section>

      {/* 四钩子 2x2 Grid */}
      <section
        className="grid grid-cols-2 gap-3 animate-fade-up"
        style={{ animationDelay: "0.7s" }}
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
