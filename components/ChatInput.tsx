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
    // 强制聚焦并设置光标位置
    const textarea = textareaRef.current;
    if (textarea) {
      // 先确保获得焦点
      textarea.focus({ preventScroll: true });
      // 设置光标在文本末尾
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.value.length;
          textarea.selectionEnd = textarea.value.length;
        }
      }, 0);
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

  // 初始化时确保光标在正确位置
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* 输入区域 - 包含提示 */}
      <div className="flex flex-col">
        {/* 提示信息 - 放在输入框上方/内部 */}
        <div className="text-xs text-primary/70 mb-2 leading-relaxed">
          {placeholder}
        </div>

        {/* 粘贴小技巧 - 放在提示下面 */}
        {showHint && value.length === 0 && (
          <div className="mb-2 p-2 bg-primary/5 border border-primary/10 rounded-lg text-xs leading-relaxed">
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

        {/* 实际的输入框 */}
        <textarea
          ref={textareaRef}
          className={`
            w-full min-h-[140px] bg-transparent border-none p-0
            text-body-md font-light text-on-surface resize-none
            leading-relaxed focus:ring-0 focus:outline-none
            placeholder:text-[rgba(225,190,194,0.3)]
          `}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          rows={6}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{ caretColor: 'inherit' }}
        />
      </div>
    </div>
  );
}