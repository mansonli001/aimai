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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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

  // 处理单张图片识别
  const processSingleImage = useCallback(async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    
    const result = await Tesseract.recognize(compressed, 'eng+chi_sim', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    let text = result.data.text;

    // 清理识别结果 - 多层过滤
    text = text
      // 1. 移除不可见字符（零宽空格、BOM等）
      .replace(/[\u200B\u200C\u200D\uFEFF\u2028\u2029]/g, '')
      // 2. 移除特殊图形符号（保留常见表情符号）
      .replace(/[✓✔✕✗●○■□▲▼◆◇★☆✦✧✩✪✫✬✭✮✯✰]/g, '')
      // 3. 移除多余空白（保留单个空格和换行）
      .replace(/[ \t]+/g, ' ')
      // 4. 标准化换行（最多保留两个连续换行）
      .replace(/\n{3,}/g, '\n\n')
      // 5. 移除单独的数字行（时间戳）
      .split('\n').filter(line => {
        // 过滤纯数字行（如 "12:30"、"2024/1/1"）
        if (/^\s*\d{1,2}[:/]\d{1,2}(:\d{2})?\s*$/.test(line)) return false;
        // 过滤太短的无意义行
        if (line.trim().length < 2) return false;
        return true;
      }).join('\n')
      // 6. 移除行首行尾空白
      .split('\n').map(line => line.trim()).join('\n')
      // 7. 清理首尾空白
      .trim();

    return text;
  }, [compressImage]);

  // 处理图片上传（支持多张）
  const handleImageUpload = useCallback(async (files: File[]) => {
    // 验证文件数量（最多 5 张）
    if (files.length > 5) {
      setError('最多支持上传 5 张图片');
      return;
    }

    // 验证所有文件
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('请上传图片文件');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('单张图片大小不能超过 10MB');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setTotalImages(files.length);
    setCurrentImageIndex(1);

    const results: string[] = [];
    const previews: string[] = [];

    try {
      // 依次处理每张图片
      for (let i = 0; i < files.length; i++) {
        setCurrentImageIndex(i + 1);
        setProgress(0);

        const compressed = await compressImage(files[i]);
        previews.push(compressed);
        setPreviewUrls([...previews]);

        const text = await processSingleImage(files[i]);
        if (text.length >= 5) {
          results.push(text);
        }
      }

      // 合并所有识别结果
      const combinedText = results.join('\n\n');

      if (!combinedText || combinedText.length < 5) {
        setError('未能识别到聊天内容，请确保截图清晰');
        setIsProcessing(false);
        return;
      }

      onTextExtracted(combinedText);
    } catch (err) {
      console.error('OCR error:', err);
      setError('识别失败，请重试或换张图片');
    } finally {
      setIsProcessing(false);
    }
  }, [compressImage, processSingleImage, onTextExtracted]);

  // 处理文件选择
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      handleImageUpload(fileArray);
    }
  }, [handleImageUpload]);

  // 重新选择图片
  const handleReset = () => {
    setPreviewUrls([]);
    setError(null);
    setProgress(0);
    setCurrentImageIndex(0);
    setTotalImages(0);
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
        multiple  // 支持多图上传
        className="hidden"
        onChange={handleFileChange}
      />

      {previewUrls.length === 0 ? (
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
            支持从相册选择，可多选最多5张
          </span>
        </label>
      ) : (
        // 预览和处理区域
        <div className="flex flex-col gap-3">
          {/* 图片预览网格 */}
          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-black/20"
              >
                <img
                  src={url}
                  alt={`预览 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* 处理状态 */}
          {isProcessing && (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-on-surface-variant/60">
                小暧正在识别截图... ({currentImageIndex}/{totalImages})
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