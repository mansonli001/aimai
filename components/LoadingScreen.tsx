"use client";

import { useEffect, useState, useRef } from "react";
import { LOADING_STEPS } from "@/lib/constants";

interface LoadingScreenProps {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let stepIdx = 0;
    let doneCalled = false;

    const stepInterval = setInterval(() => {
      if (stepIdx < LOADING_STEPS.length) {
        setActiveStep(stepIdx);
        stepIdx++;
      }
      if (stepIdx >= LOADING_STEPS.length && !doneCalled) {
        doneCalled = true;
        // 最后一步完成后等一小会再通知
        setTimeout(() => {
          onDoneRef.current();
        }, 500);
      }
    }, 750);

    return () => {
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-edge-margin py-16">
      {/* Header */}
      <header className="fixed top-0 w-full max-w-container-max flex justify-center items-center h-16 z-50">
        <h1 className="text-headline-lg text-primary tracking-widest opacity-40 font-light">
          暧昧检测局
        </h1>
      </header>

      {/* Central Detector Dial */}
      <div className="relative flex items-center justify-center mb-section-gap mt-16">
        <div className="pulse-ring" />
        <div className="absolute inset-0 border-[0.5px] border-primary/20 rounded-full" />
        {/* Detector Core */}
        <div className="z-20 flex flex-col items-center justify-center bg-surface/30 backdrop-blur-md rounded-full w-[160px] h-[160px] border border-white/10 relative overflow-hidden">
          <svg
            className="w-12 h-12 text-primary mb-2 animate-flicker"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <p className="label-caps text-primary/80 tracking-[0.2em]">
            CALCULATING
          </p>
          <div className="scan-line" />
        </div>
      </div>

      {/* Task Sequence List */}
      <div className="w-full space-y-stack-gap">
        {LOADING_STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center space-x-4 glass-card p-4 rounded-xl transition-all duration-500 ${
              i < activeStep
                ? "opacity-80"
                : i === activeStep
                ? "opacity-100"
                : "opacity-30"
            }`}
            style={{
              animation:
                i <= activeStep
                  ? "fadeInUp 0.5s ease-out forwards"
                  : "none",
            }}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                i < activeStep
                  ? "bg-primary shadow-[0_0_8px_#ff4d7e]"
                  : i === activeStep
                  ? "bg-primary/40 animate-pulse"
                  : "bg-white/10"
              }`}
            />
            <span
              className={`text-body-md font-light flex-grow ${
                i <= activeStep ? "text-on-surface/80" : "text-on-surface/40"
              }`}
            >
              「{step}」
            </span>
            {i < activeStep && (
              <svg
                className="w-4 h-4 text-primary/60"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
            {i === activeStep && (
              <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Quote */}
      <footer className="mt-section-gap flex flex-col items-center text-center">
        <p className="label-caps text-primary/40 mb-2">小暧提示</p>
        <p className="font-serif text-body-quote text-on-surface-variant/60 italic max-w-[280px] leading-relaxed">
          内容是什么不重要。
          <br />
          她为什么找你说这个，才是重点。
        </p>
        <div className="mt-8 flex space-x-1">
          <div
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-1 h-1 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </footer>
    </div>
  );
}
