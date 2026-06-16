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
  const [pasteHint, setPasteHint] = useState("");
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

  // 从 HTML 中提取纯文本，保留换行结构
  const htmlToText = useCallback((html: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    // 将 block 元素后面加换行
    doc.querySelectorAll("div, p, br").forEach((el) => {
      el.appendChild(doc.createTextNode("\n"));
    });
    let text = doc.body?.textContent || "";
    // 清理多余空行
    text = text.replace(/\n{3,}/g, "\n\n").trim();
    return text;
  }, []);

  // 将文本插入到 textarea
  const insertText = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setChatLog(text.slice(0, 800));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = chatLog;
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    setChatLog(newValue.slice(0, 800));
    requestAnimationFrame(() => {
      const pos = Math.min(start + text.length, 800);
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  }, [chatLog]);

  // 拦截粘贴事件：优先读 HTML（微信多条消息完整内容在 HTML 里）
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData || (window as any).clipboardData;
    if (!clipboardData) return;

    let text = "";

    // 1. 优先尝试 text/html —— 微信多选复制的完整内容在这里
    const html = clipboardData.getData("text/html");
    if (html && html.trim()) {
      text = htmlToText(html);
    }

    // 2. 如果 HTML 解析结果太短，用 text/plain 补充
    const plain = clipboardData.getData("text/plain") || "";
    if (!text || plain.length > text.length) {
      text = plain;
    }

    if (!text) return; // 没有内容则让浏览器默认处理

    e.preventDefault();

    // 标准化换行符
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    text = text.replace(/\n{3,}/g, "\n\n");

    insertText(text);
  }, [htmlToText, insertText]);

  // "粘贴聊天记录"按钮：用 Clipboard API 直接读取系统剪贴板
  const handlePasteButton = useCallback(async () => {
    try {
      // 优先用 read() API 尝试获取 HTML
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes("text/html")) {
            const blob = await item.getType("text/html");
            const html = await blob.text();
            const text = htmlToText(html);
            if (text) {
              insertText(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n"));
              setPasteHint("已粘贴完整内容");
              setTimeout(() => setPasteHint(""), 2000);
              return;
            }
          }
          if (item.types.includes("text/plain")) {
            const blob = await item.getType("text/plain");
            const text = await blob.text();
            if (text) {
              insertText(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n"));
              setPasteHint("已粘贴");
              setTimeout(() => setPasteHint(""), 2000);
              return;
            }
          }
        }
      }
      // 降级到 readText()
      const text = await navigator.clipboard.readText();
      if (text) {
        insertText(text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n"));
        setPasteHint("已粘贴");
        setTimeout(() => setPasteHint(""), 2000);
      }
    } catch {
      setPasteHint("请长按输入框手动粘贴");
      setTimeout(() => setPasteHint(""), 3000);
    }
  }, [htmlToText, insertText]);

  // onChange 处理手动输入
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let v = e.target.value;
    v = v.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
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
          <div className="flex items-center justify-between mb-1 pl-1">
            <label className="label-caps text-on-surface-variant/60">
              把聊天记录贴进来
            </label>
            <button
              type="button"
              className="label-caps text-primary/70 hover:text-primary transition-colors active:scale-95"
              onClick={handlePasteButton}
            >
              {pasteHint || "粘贴聊天记录"}
            </button>
          </div>
          <div className="glass-surface rounded-2xl p-4 flex flex-col min-h-[260px] input-glow transition-all">
            <textarea
              ref={textareaRef}
              className="w-full flex-grow bg-transparent border-none p-0 text-body-md font-light text-on-surface resize-none leading-relaxed focus:ring-0 focus:outline-none"
              placeholder={"把你反复看的那几句粘进来就够了\n不用整理格式，不用解释背景。"}
              value={chatLog}
              onChange={handleChange}
              onPaste={handlePaste}
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
