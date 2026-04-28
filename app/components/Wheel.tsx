"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  items: string[];
  disabled?: boolean;
  onFinish?: (winner: string) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Wheel({ items, disabled, onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [spinning, setSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0); // 当前累计旋转角度（deg）
  const [size, setSize] = useState(360);

  // Apple-ish 的柔和配色（按 index 循环）
  const palette = useMemo(
    () => [
      "#0A84FF",
      "#30D158",
      "#FFD60A",
      "#FF9F0A",
      "#FF375F",
      "#BF5AF2",
      "#64D2FF",
      "#AC8E68",
      "#FF453A",
      "#5E5CE6",
    ],
    []
  );

  // 根据容器宽度自适应 canvas
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setSize(clamp(Math.floor(w), 260, 420));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 绘制转盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    // 外圈阴影
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();
    ctx.restore();

    // 扇区
    const n = Math.max(1, items.length);
    const step = (Math.PI * 2) / n;
    const startOffset = -Math.PI / 2; // 让 0 度从正上方开始

    for (let i = 0; i < n; i++) {
      const a0 = startOffset + i * step;
      const a1 = a0 + step;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r - 6, a0, a1);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();

      // 扇区分割线
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 文本
      const mid = (a0 + a1) / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "600 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";

      const text = items[i] ?? "";
      ctx.fillText(text, r - 18, 0);
      ctx.restore();
    }

    // 中心圆
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.font = "700 14px ui-sans-serif, system-ui, -apple-system";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);
    ctx.restore();
  }, [items, palette, size]);

  // 计算当前 rotationDeg 对应的中奖项
  const getWinnerByRotation = (deg: number) => {
    const n = Math.max(1, items.length);
    const step = 360 / n;

    // 指针在正上方，转盘旋转 deg；等价于指针命中的扇区角
    // 让角度归一化到 [0,360)
    const normalized = ((deg % 360) + 360) % 360;

    // 我们的扇区从正上方开始（-90°），这里用 +90 把上方变成 0 基准
    const angleFromTop = (normalized + 90) % 360;

    // 转盘是顺时针增加；指针固定在上方，实际命中是反向 (这段是因为箭头在下面朝上指，新改动是箭头在上面朝下指，所以这个就不需要了)
    // const hit = (360 - angleFromTop) % 360;
    const hit = angleFromTop

    const idx = Math.floor(hit / step);
    return items[idx] ?? items[0];
  };

  const spin = () => {
    if (disabled || spinning || items.length < 2) return;

    setSpinning(true);

    // 基础随机角 + 多圈（圈数做大一点更有“抽奖感”）
    const extraTurns = 6 + Math.floor(Math.random() * 5); // 6~10圈
    const randomAngle = Math.random() * 360;

    const target = rotationDeg + extraTurns * 360 + randomAngle;

    // 更新角度（触发 CSS transition）
    setRotationDeg(target);
  };

  const handleTransitionEnd = () => {
    if (!spinning) return;
    setSpinning(false);

    const w = getWinnerByRotation(rotationDeg);
    onFinish?.(w);
  };

  return (
    <div className="wheelWrap" ref={wrapRef}>
      <div className="pointer" aria-hidden="true" />
      <div
        className={`wheelStage ${spinning ? "spinning" : ""}`}
        style={{ transform: `rotate(${rotationDeg}deg)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        <canvas ref={canvasRef} />
      </div>

      <button className="spinBtn" onClick={spin} disabled={disabled || spinning}>
        {spinning ? "旋转中…" : "Spin"}
      </button>
    </div>
  );
}
