"use client";

import { useState, useRef, useCallback } from "react";
import { EXAMPLES } from "@/lib/constants";

interface InputScreenProps {
  onDetect: (me: string, her: string, chatLog: string, gender: string) => void;
}

export default function InputScreen({ onDetect }: InputScreenProps) {
  const [me, setMe] = useState("");
  const [her, setHer] = useState("");
  const [chatLog, setChatLog] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const charLen = chatLog.length;
  const canSubmit = chatLog.trim().length >= 20;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePillClick = (example: (typeof EXAMPLES)[number]) => {
    setMe(example.me);
    setHer(example.her);
    setChatLog(example.text);
  };

  const toggleGender = () => {
    setGender((g) => (g === "male" ? "female" : "male"));
  };

  // 粘贴后处理：不阻止默认行为，让浏览器原生粘贴完整内容
  // 然后在 onChange 中标准化换行符
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let v = e.target.value;
    // 标准化换行符（\r\n → \n，\r → \n）
    v = v.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    // 去除多余空行（3个以上连续换行压缩为2个）
    v = v.replace(/\n{3,}/g, "\n\n");
    setChatLog(v.slice(0, 800));
  }, []);

  return (
    <div className="px-edge-margin pt-8 pb-16 flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.8" />
              <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <path d="M16 6 L18 16 L16 26" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
              <circle cx="16" cy="16" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-headline-lg text-primary tracking-widest font-light leading-8">
              暧昧检测局
            </h1>
            <p className="label-caps text-on-surface-variant/40">
              AIMAI DETECTOR
            </p>
          </div>
        </div>
        <span className="label-caps text-on-surface-variant/40 border border-white/10 px-2 py-1 rounded-md">
          beta
        </span>
      </header>

      {/* Hero */}
      <section className="text-center mb-10 animate-drift-up">
        <h2 className="text-[26px] font-light text-on-surface leading-tight mb-3">
          你觉得怪怪的
          <br />
          那就是真的怪
        </h2>
        <p className="text-sm text-on-surface-variant/60 font-light leading-relaxed">
          不管你们聊的什么，小暧只看她的行为
        </p>
      </section>

      {/* Input Area */}
      <section className="flex-grow space-y-stack-gap animate-drift-up" style={{ animationDelay: "0.1s" }}>
        {/* Name Inputs */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block label-caps text-on-surface-variant/60 mb-1 pl-1">
              你的代号
            </label>
            <div className="glass-surface rounded-xl px-4 py-3 input-glow transition-all">
              <input
                className="w-full bg-transparent border-none p-0 text-body-md font-light text-on-surface focus:ring-0 focus:outline-none"
                placeholder="随便填"
                value={me}
                onChange={(e) => setMe(e.target.value.slice(0, 10))}
                maxLength={10}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block label-caps text-on-surface-variant/60 mb-1 pl-1">
              {gender === "female" ? "他的代号" : "她的代号"}
            </label>
            <div className="glass-surface rounded-xl px-4 py-3 input-glow transition-all">
              <input
                className="w-full bg-transparent border-none p-0 text-body-md font-light text-on-surface focus:ring-0 focus:outline-none"
                placeholder="随便填"
                value={her}
                onChange={(e) => setHer(e.target.value.slice(0, 10))}
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Chat Textarea */}
        <div className="flex flex-col pt-2">
          <label className="block label-caps text-on-surface-variant/60 mb-1 pl-1">
            把聊天记录贴进来
          </label>
          <div className="glass-surface rounded-2xl p-4 flex flex-col min-h-[260px] input-glow transition-all">
            <textarea
              ref={textareaRef}
              className="w-full flex-grow bg-transparent border-none p-0 text-body-md font-light text-on-surface resize-none leading-relaxed focus:ring-0 focus:outline-none"
              placeholder={"把你反复看的那几句粘进来就够了\n不用整理格式，不用解释背景。"}
              value={chatLog}
              onChange={handleChange}
            />
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-on-surface-variant/40">
                {charLen} / 800字
              </span>
              <span className="text-xs text-on-surface-variant/40">
                你的聊天记录小暧看完就忘，她嘴严的
              </span>
            </div>
          </div>
        </div>

        {/* Gender Toggle */}
        <button
          className={`w-full py-3 rounded-xl text-sm font-light transition-all active:scale-[0.98] ${
            gender === "female"
              ? "border border-primary bg-primary/10 text-primary"
              : "glass-card text-on-surface-variant/60 hover:text-primary"
          }`}
          onClick={toggleGender}
        >
          {gender === "female"
            ? "已切换女生视角 · 再点切回"
            : "我是女生，换个视角 →"}
        </button>
      </section>

      {/* Action Button */}
      <section className="mt-section-gap animate-drift-up" style={{ animationDelay: "0.2s" }}>
        <button
          className="w-full py-4 bg-primary-container text-white rounded-full font-light tracking-[0.3em] text-base glow-button active:scale-95 transition-transform duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={!canSubmit}
          onClick={() => onDetect(me || "我", her || "她", chatLog, gender)}
        >
          小暧，你来看看
        </button>
      </section>

      {/* Example Pills */}
      <section className="mt-6 animate-drift-up" style={{ animationDelay: "0.3s" }}>
        <p className="label-caps text-on-surface-variant/40 mb-3">
          没有素材？试试这些 →
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              className="px-4 py-2 glass-card rounded-full text-xs text-on-surface-variant/80 hover:text-primary hover:border-primary/30 transition-all active:scale-95"
              onClick={() => handlePillClick(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
