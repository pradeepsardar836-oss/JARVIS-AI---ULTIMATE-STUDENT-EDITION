import React, { useEffect, useRef } from 'react';
import { JarvisState } from '../types/jarvis';

interface AudioWaveformProps {
  state: JarvisState;
  audioLevels?: number[];
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.08;
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine colors and amplitude based on state
      let color = 'rgba(6, 182, 212, 0.7)'; // Cyan
      let amp = 8;

      if (state === 'listening') {
        color = 'rgba(56, 189, 248, 0.95)'; // Sky
        amp = 26;
      } else if (state === 'speaking') {
        color = 'rgba(16, 185, 129, 0.95)'; // Emerald
        amp = 32;
      } else if (state === 'thinking') {
        color = 'rgba(168, 85, 247, 0.9)'; // Purple
        amp = 18;
      }

      // Draw cyber frequency bars across bottom
      const barCount = 32;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.abs(Math.sin(phase * 1.5 + i * 0.4)) * amp + 4;
        ctx.fillStyle = color;
        ctx.fillRect(i * barWidth + 2, midY - barHeight / 2, barWidth - 4, barHeight);
      }

      // Draw primary sinusoidal HUD wave
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      for (let x = 0; x < width; x += 3) {
        const y = midY + Math.sin(x * 0.03 + phase) * amp * 0.8 + Math.cos(x * 0.015 - phase * 0.7) * (amp * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw secondary ethereal harmonic wave
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 4) {
        const y = midY + Math.sin(x * 0.05 - phase * 1.2) * (amp * 0.45);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 select-none">
      <div className="relative w-full max-w-xl h-14 rounded-lg bg-slate-950/60 border border-cyan-500/25 p-1 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Subtle grid lines background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40f_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40f_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <canvas
          ref={canvasRef}
          width={560}
          height={50}
          className="relative z-10 w-full h-full"
        />

        {/* Ambient side gauges */}
        <div className="absolute left-2 text-[9px] font-mono text-cyan-400/50">CH-L</div>
        <div className="absolute right-2 text-[9px] font-mono text-cyan-400/50">CH-R</div>
      </div>
    </div>
  );
};
