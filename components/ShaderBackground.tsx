"use client";

import { useEffect, useRef } from "react";

/**
 * WebGL shader 背景 - 深紫色底 + 慢速移动光晕球
 * 三个页面共用同一个 shader
 */
export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas!.clientWidth || 1280;
      const h = canvas!.clientHeight || 720;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
    }

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;
    uv.x *= ratio;

    vec3 color = vec3(0.05, 0.05, 0.1);

    float t = u_time * 0.2;

    float d1 = length(uv - vec2(0.3 + 0.2 * sin(t), 0.7 + 0.1 * cos(t * 0.8)));
    color += vec3(0.1, 0.05, 0.2) * (1.0 - smoothstep(0.0, 0.8, d1));

    float d2 = length(uv - vec2(0.8 + 0.1 * cos(t * 1.2), 0.3 + 0.2 * sin(t * 0.5)));
    color += vec3(0.15, 0.05, 0.1) * (1.0 - smoothstep(0.0, 1.0, d2));

    float d3 = length(uv - vec2(0.5 + 0.3 * sin(t * 0.7), 0.5 + 0.3 * cos(t * 1.1)));
    color += vec3(0.05, 0.05, 0.15) * (1.0 - smoothstep(0.0, 1.2, d3));

    gl_FragColor = vec4(color, 1.0);
}`;

    function cs(type: number, src: string) {
      const s = (gl as WebGLRenderingContext).createShader(type);
      (gl as WebGLRenderingContext).shaderSource(s!, src);
      (gl as WebGLRenderingContext).compileShader(s!);
      return s;
    }

    const glCtx = gl as WebGLRenderingContext;
    const prog = glCtx.createProgram()!;
    glCtx.attachShader(prog, cs(glCtx.VERTEX_SHADER, vs)!);
    glCtx.attachShader(prog, cs(glCtx.FRAGMENT_SHADER, fs)!);
    glCtx.linkProgram(prog);
    glCtx.useProgram(prog);

    const buf = glCtx.createBuffer()!;
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buf);
    glCtx.bufferData(
      glCtx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      glCtx.STATIC_DRAW
    );

    const pos = glCtx.getAttribLocation(prog, "a_position");
    glCtx.enableVertexAttribArray(pos);
    glCtx.vertexAttribPointer(pos, 2, glCtx.FLOAT, false, 0, 0);

    const uTime = glCtx.getUniformLocation(prog, "u_time");
    const uRes = glCtx.getUniformLocation(prog, "u_resolution");

    let animId: number;
    function render(t: number) {
      syncSize();
      glCtx.viewport(0, 0, canvas!.width, canvas!.height);
      if (uTime) glCtx.uniform1f(uTime, t * 0.001);
      if (uRes) glCtx.uniform2f(uRes, canvas!.width, canvas!.height);
      glCtx.drawArrays(glCtx.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
}
