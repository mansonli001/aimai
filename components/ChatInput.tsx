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
    // 确保光标在文本末尾
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.selectionStart = textarea.value.length;
      textarea.selectionEnd = textarea.value.length;
    }
  };

  const handleBlur = () => {
    // 延迟隐藏，让按钮可点击
    setTimeout(() => setShowHint(false), 200);
  };

  // 尝试从选区获取粘贴内容（备用方案）
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
    <div className="relative w-full flex flex-col">
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
      />

      {/* 粘贴帮助提示 - 在输入框下方显示 */}
      {showHint && value.length === 0 && (
        <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-lg text-xs leading-relaxed">
          <p className="text-primary font-medium mb-2">粘贴小技巧：</p>
          
          {/* 方法一：备忘录中转 */}
          <p className="text-on-surface-variant/70 mb-2">
            <span className="text-primary">方法一：</span>
            微信多选复制 → 备忘录粘贴 → 全选复制 → 回到这里粘贴
          </p>

          {/* 方法二：单条粘贴 */}
          <p className="text-on-surface-variant/70 mb-2">
            <span className="text-primary">方法二：</span>
            逐条复制你想分析的消息，一条一条粘贴
          </p>

          {/* 推荐截图上传 */}
          <div className="mt-2 pt-2 border-t border-primary/10">
            <p className="text-primary/80">
              💡 嫌麻烦？直接点击上方「上传截图」按钮，自动识别聊天内容
            </p>
          </div>

          {/* 尝试粘贴按钮 */}
          <button
            onClick={tryPasteFromSelection}
            className="mt-2 w-full py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary text-xs font-medium transition-colors"
          >
            尝试粘贴
          </button>
        </div>
      )}
    </div>
  );
}