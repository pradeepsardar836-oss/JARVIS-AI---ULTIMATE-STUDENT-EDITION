import React, { useEffect, useState } from 'react';
import { JarvisState } from '../types/jarvis';
import { Zap, Volume2, Mic, Activity } from 'lucide-react';

interface ArcReactorProps {
  state: JarvisState;
  onActivate: () => void;
  audioLevels?: number[];
  size?: 'sm' | 'md' | 'lg';
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  state,
  onActivate,
  audioLevels = [],
  size = 'md',
}) => {
  const [rotationA, setRotationA] = useState(0);
  const [rotationB, setRotationB] = useState(0);

  useEffect(() => {
    let animId: number;
    let prev = performance.now();

    const loop = (time: number) => {
      const dt = (time - prev) / 1000;
      prev = time;

      const speedMult = state === 'speaking' ? 3.0 : state === 'listening' ? 2.0 : 0.8;
      setRotationA((prevRot) => (prevRot + 15 * speedMult * dt) % 360);
      setRotationB((prevRot) => (prevRot - 22 * speedMult * dt + 360) % 360);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [state]);

  const stateColors = {
    idle: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)', text: 'STANDBY' },
    listening: { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.85)', text: 'LISTENING...' },
    thinking: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)', text: 'PROCESSING...' },
    speaking: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.9)', text: 'SPEAKING...' },
    interrupted: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.85)', text: 'HALTED' },
  };

  const currentTheme = stateColors[state] || stateColors.idle;
  const avgLevel = audioLevels.length > 0 ? audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length : 15;
  const scaleEffect = 1 + Math.min(avgLevel / 120, 0.15);

  const dimensionClasses = {
    sm: 'w-44 h-44',
    md: 'w-64 h-64 md:w-72 md:h-72',
    lg: 'w-80 h-80 md:w-96 md:h-96',
  }[size];

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      {/* Outer Holographic Glow Field */}
      <div
        className="absolute rounded-full transition-all duration-300 blur-2xl pointer-events-none"
        style={{
          width: '110%',
          height: '110%',
          background: `radial-gradient(circle, ${currentTheme.glow} 0%, transparent 70%)`,
          transform: `scale(${scaleEffect})`,
        }}
      />

      {/* Main Reactor Body Container */}
      <div
        onClick={onActivate}
        className={`relative ${dimensionClasses} rounded-full cursor-pointer transition-transform duration-200 flex items-center justify-center p-2`}
        style={{ transform: `scale(${scaleEffect})` }}
        title="JARVIS ARC REACTOR – Click to speak or toggle voice"
      >
        {/* Layer 1: Outer Telemetry Ring with Degree Ticks */}
        <div
          className="absolute inset-0 rounded-full border border-cyan-500/30"
          style={{ transform: `rotate(${rotationA}deg)` }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-full h-[1px] -translate-y-1/2 pointer-events-none"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className="w-2.5 h-[2px] bg-cyan-400/80 float-left" />
              <div className="w-2.5 h-[2px] bg-cyan-400/80 float-right" />
            </div>
          ))}
        </div>

        {/* Layer 2: Segmented Arc Ring (Rotates in reverse) */}
        <div
          className="absolute inset-3 rounded-full border-2 border-dashed border-cyan-400/50"
          style={{
            transform: `rotate(${rotationB}deg)`,
            borderColor: currentTheme.primary,
          }}
        />

        {/* Layer 3: Tech Ring with Copper Solenoids (Iron Man Reactor Coils) */}
        <div className="absolute inset-7 rounded-full border border-sky-400/40 bg-slate-950/80 flex items-center justify-center overflow-hidden shadow-inner">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="absolute w-3 h-7 rounded-sm border border-amber-500/60 bg-gradient-to-b from-amber-600/70 to-amber-900/90 shadow-sm"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${idx * 36}deg) translate(0, -68px) translate(-50%, -50%)`,
              }}
            />
          ))}

          {/* Layer 4: Glass Core Ring */}
          <div className="absolute inset-5 rounded-full border-2 border-cyan-300/70 bg-gradient-to-tr from-cyan-950/60 via-sky-900/30 to-cyan-500/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            {/* Center Core Triangular / Hexagonal Light */}
            <div
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-center p-2 transition-all duration-300"
              style={{
                boxShadow: `0 0 35px ${currentTheme.primary}, inset 0 0 20px ${currentTheme.primary}`,
                backgroundColor: 'rgba(3, 15, 30, 0.95)',
                borderColor: currentTheme.primary,
                borderWidth: '2px',
              }}
            >
              {state === 'listening' ? (
                <Mic className="w-8 h-8 text-sky-300 animate-bounce" />
              ) : state === 'speaking' ? (
                <Volume2 className="w-8 h-8 text-emerald-400" />
              ) : state === 'thinking' ? (
                <Activity className="w-8 h-8 text-purple-400 animate-spin" />
              ) : (
                <Zap className="w-8 h-8 text-cyan-400" />
              )}

              <span className="text-[10px] tracking-widest font-orbitron font-bold mt-1 text-cyan-200">
                JARVIS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* State & Core Diagnostics Pill */}
      <div className="mt-4 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 shadow-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentTheme.primary }}
          />
          <span className="text-xs font-orbitron tracking-wider text-cyan-300 font-semibold">
            {currentTheme.text}
          </span>
          <span className="text-[10px] text-cyan-500/80 font-mono">| 100% MK-85</span>
        </div>
        <p className="text-[11px] text-cyan-400/60 font-chakra mt-1 tracking-wider">
          Click Reactor or Press <kbd className="px-1 py-0.5 bg-cyan-900/40 rounded border border-cyan-700/50 text-[10px] text-cyan-200">Space</kbd> to Voice Chat
        </p>
      </div>
    </div>
  );
};
