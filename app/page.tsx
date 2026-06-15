"use client";

import { useState, useCallback, useRef } from "react";
import InputScreen from "@/components/InputScreen";
import LoadingScreen from "@/components/LoadingScreen";
import ResultScreen from "@/components/ResultScreen";
import ShaderBackground from "@/components/ShaderBackground";
import type { DetectResult } from "@/lib/constants";

type Screen = "input" | "loading" | "result";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("input");
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<DetectResult | null>(null);
  const loadingDoneRef = useRef(false);

  const handleDetect = useCallback(
    async (me: string, her: string, chatLog: string) => {
      setError(null);
      setScreen("loading");
      resultRef.current = null;
      loadingDoneRef.current = false;

      try {
        const res = await fetch("/api/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ me, her, chatLog }),
        });

        const data = await res.json();

        if (!data.ok) {
          throw new Error(data.error || "检测失败");
        }

        resultRef.current = data.result;
        // API 返回后检查 loading 动画是否也完成了
        if (loadingDoneRef.current) {
          setResult(data.result);
          setScreen("result");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "网络错误，请重试";
        setError(msg);
        setScreen("input");
      }
    },
    []
  );

  const handleLoadingDone = useCallback(() => {
    loadingDoneRef.current = true;
    // Loading 动画完成后检查 API 是否也返回了
    if (resultRef.current) {
      setResult(resultRef.current);
      setScreen("result");
    }
  }, []);

  const handleRetry = useCallback(() => {
    setResult(null);
    setError(null);
    resultRef.current = null;
    loadingDoneRef.current = false;
    setScreen("input");
  }, []);

  return (
    <>
      <ShaderBackground />
      <main className="relative z-10 w-full max-w-container-max mx-auto min-h-screen">
        {/* Error */}
        {error && (
          <div className="mx-edge-margin mt-20 p-4 glass-card rounded-xl text-primary-container text-sm text-center">
            {error}
          </div>
        )}

        {/* Screens */}
        {screen === "input" && <InputScreen onDetect={handleDetect} />}
        {screen === "loading" && (
          <LoadingScreen onDone={handleLoadingDone} />
        )}
        {screen === "result" && result && (
          <ResultScreen result={result} onRetry={handleRetry} />
        )}
      </main>
    </>
  );
}
