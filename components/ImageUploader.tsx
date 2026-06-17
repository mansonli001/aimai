'use client';

import { useState, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
  onCancel: () => void;
}

export default function ImageUploader({ onTextExtracted, onCancel }: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 压缩图片到指定宽度
  const compressImage = useCallback((file: File, maxWidth: number = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        if (!ctx) {
          reject(new Error('无法获取 canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback(async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // 压缩图片
      const compressed = await compressImage(file);
      setPreviewUrl(compressed);

      // 使用 Tesseract OCR
      const result = await Tesseract.recognize(compressed, 'eng+chi_sim', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      let text = result.data.text;

      // 清理识别结果
      text = text
        // 移除多余空白
        .replace(/\s+/g, ' ')
        // 标准化换行
        .replace(/\n{3,}/g, '\n\n')
        // 清理首尾空白
        .trim();

      if (text.length < 5) {
        setError('未能识别到聊天内容，请确保截图清晰');
        setIsProcessing(false);
        return;
      }

      onTextExtracted(text);
    } catch (err) {
      console.error('OCR error:', err);
      setError('识别失败，请重试或换张图片');
    } finally {
      setIsProcessing(false);
    }
  }, [compressImage, onTextExtracted]);

  // 处理文件选择
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  // 重新选择图片
  const handleReset = () => {
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col min-h-[200px]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        // 上传区域
        <label
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex-1 flex flex-col items-center justify-center gap-3
            rounded-2xl border-2 border-dashed border-white/20
            cursor-pointer active:bg-white/5 transition-all
            min-h-[180px]
          `}
        >
          <span className="text-3xl opacity-40">📷</span>
          <span className="text-sm text-on-surface-variant/60 tracking-wider">
            点击上传聊天截图
          </span>
          <span className="text-[10px] text-on-surface-variant/30">
            支持微信聊天截图，自动识别聊天内容
          </span>
        </label>
      ) : (
        // 预览和处理区域
        <div className="flex flex-col gap-3">
          {/* 图片预览 */}
          <div className="relative rounded-xl overflow-hidden bg-black/20">
            <img
              src={previewUrl}
              alt="预览"
              className="w-full max-h-[200px] object-contain"
            />

            {/* 重新选择按钮 */}
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 处理状态 */}
          {isProcessing && (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-on-surface-variant/60">
                小暧正在识别截图...
              </span>
              {/* 进度条 */}
              <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-on-surface-variant/40">{progress}%</span>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex flex-col items-center gap-2 py-3">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-primary border border-primary/40 rounded-lg hover:bg-primary/10 transition-colors"
              >
                重新上传
              </button>
            </div>
          )}
        </div>
      )}

      {/* 取消按钮 */}
      <button
        onClick={onCancel}
        className="mt-3 py-2 text-sm text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
      >
        取消
      </button>
    </div>
  );
}