'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let v = e.target.value;
    v = v.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    v = v.replace(/\n{3,}/g, '\n\n');
    onChange(v.slice(0, maxLength));
  }, [onChange, maxLength]);

  const handleFocus = () => {
    setShowHint(true);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (textarea) {
          textarea.selectionStart = textarea.value.length;
          textarea.selectionEnd = textarea.value.length;
        }
      });
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowHint(false), 200);
  };

  const tryPasteFromSelection = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();

    setTimeout(() => {
      document.execCommand('paste', false);
      const pastedText = input.value;
      if (pastedText) {
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    }
  }, []);

  return (
    <div className="relative w-full flex flex-col">
      {/* 实际的输入框 */}
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
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{ caretColor: 'inherit' }}
      />

      {/* 粘贴小技巧 - 放在输入框下方 */}
      {showHint && value.length === 0 && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg text-xs leading-relaxed">
          <p className="text-primary font-medium mb-1">粘贴小技巧：</p>
          <p className="text-on-surface-variant/70">
            <span className="text-primary">1.</span> 微信多选→备忘录粘贴→全选复制→回到这里粘贴
          </p>
          <p className="text-on-surface-variant/70 mt-1">
            <span className="text-primary">2.</span> 逐条复制消息，一条一条粘贴
          </p>
          <p className="text-primary/80 mt-2">
            💡 嫌麻烦？直接点击上方「上传截图」按钮
          </p>
        </div>
      )}
    </div>
  );
}