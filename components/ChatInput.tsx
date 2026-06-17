'use client';

import { useRef, useEffect } from 'react';

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
  const divRef = useRef<HTMLDivElement>(null);

  // 同步外部 value 到 DOM
  useEffect(() => {
    if (divRef.current && divRef.current.innerText !== value) {
      divRef.current.innerText = value;
    }
  }, [value]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    let text = '';

    // 尝试1：text/plain
    text = e.clipboardData.getData('text/plain');

    // 尝试2：如果 text/plain 被截断，试 text
    if (!text) {
      text = e.clipboardData.getData('text');
    }

    // 尝试3：从 HTML 里剥文字
    if (!text) {
      const html = e.clipboardData.getData('text/html');
      if (html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        text = tmp.innerText || tmp.textContent || '';
      }
    }

    if (!text) return;

    // 标准化换行符
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    text = text.replace(/\n{3,}/g, '\n\n');

    // 插入到光标位置
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (divRef.current) {
      divRef.current.innerText += text;
    }

    // 触发 onChange
    const newVal = (divRef.current?.innerText || '').slice(0, maxLength);
    onChange(newVal);
  };

  const handleInput = () => {
    const currentText = divRef.current?.innerText || '';
    // 标准化换行符
    let normalized = currentText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    normalized = normalized.replace(/\n{3,}/g, '\n\n');
    const newVal = normalized.slice(0, maxLength);
    onChange(newVal);
    // 防止超出 maxLength 时继续输入
    if (divRef.current && divRef.current.innerText.length > maxLength) {
      divRef.current.innerText = newVal;
      // 光标移到末尾
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(divRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onInput={handleInput}
        className={`
          w-full min-h-[200px] outline-none
          bg-transparent text-body-md font-light text-on-surface
          whitespace-pre-wrap break-words leading-relaxed
        `}
        data-placeholder={placeholder}
        style={{ WebkitUserModify: 'read-write-plaintext-only' }}
      />
      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgba(225, 190, 194, 0.3);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}