'use client';

import { useState, useRef, useCallback } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function ChatInput({
  value,
  onChange,
  placeholder,
  maxLength = 800
}: ChatInputProps) {
  const [showHint, setShowHint] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 不拦截 paste，让浏览器原生处理
  // 微信 WKWebView 中，原生粘贴可能比 clipboardData.getData() 获取更多内容
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let v = e.target.value;
    // 标准化换行符
    v = v.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // 压缩多余空行
    v = v.replace(/\n{3,}/g, '\n\n');
    onChange(v.slice(0, maxLength));
  }, [onChange, maxLength]);

  const handleFocus = () => {
    setShowHint(true);
  };

  const handleBlur = () => {
    // 延迟隐藏，让按钮可点击
    setTimeout(() => setShowHint(false), 200);
  };

  // 尝试从选区获取粘贴内容（备用方案）
  const tryPasteFromSelection = useCallback(() => {
    // 创建一个临时的 input 来触发粘贴
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();

    // 使用 setTimeout 确保 input 获得焦点后再粘贴
    setTimeout(() => {
      document.execCommand('paste', false);

      const pastedText = input.value;
      if (pastedText) {
        // 将粘贴内容追加到当前文本
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const current = value;
          const newValue = (current.slice(0, start) + pastedText + current.slice(end)).slice(0, maxLength);
          onChange(newValue);
        }
      }

      document.body.removeChild(input);
      textareaRef.current?.focus();
    }, 100);
  }, [value, onChange, maxLength]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        className={`
          w-full min-h-[200px] bg-transparent border-none p-0
          text-body-md font-light text-on-surface resize-none
          leading-relaxed focus:ring-0 focus:outline-none
          placeholder:text-[rgba(225,190,194,0.3)]
        `}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={maxLength}
        rows={8}
      />

      {/* 粘贴帮助提示 */}
      {showHint && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[rgba(0,0,0,0.85)] rounded-xl text-xs text-white/90 leading-relaxed z-10">
          <p className="font-medium mb-2">粘贴多条消息的小技巧：</p>
          <ol className="list-decimal list-inside space-y-1 text-white/70">
            <li>在微信中长按选中消息 → 多选 → 全选 → 复制</li>
            <li>点击下方输入框，长按粘贴（或点击右上角粘贴按钮）</li>
            <li>如果还是只能粘贴一条，试试先复制到备忘录再粘贴</li>
          </ol>
          <button
            onClick={tryPasteFromSelection}
            className="mt-2 w-full py-2 bg-primary/80 hover:bg-primary rounded-lg text-white font-medium transition-colors"
          >
            尝试粘贴
          </button>
        </div>
      )}
    </div>
  );
}