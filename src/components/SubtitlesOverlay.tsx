import React from 'react';
import { JarvisState } from '../types/jarvis';
import { Volume2, Mic, Activity, Square } from 'lucide-react';

interface SubtitlesOverlayProps {
  state: JarvisState;
  subtitleText: string;
  transcriptText: string;
  onInterrupt: () => void;
}

export const SubtitlesOverlay: React.FC<SubtitlesOverlayProps> = ({
  state,
  subtitleText,
  transcriptText,
  onInterrupt,
}) => {
  if (state === 'idle' && !subtitleText && !transcriptText) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-2 px-4 select-none">
      <div className="relative rounded-xl p-3 bg-slate-950/85 border border-cyan-500/40 shadow-xl backdrop-blur-md flex flex-col space-y-2">
        {/* Top Status & Interruption Row */}
        <div className="flex items-center justify-between text-xs border-b border-cyan-500/20 pb-1.5">
          <div className="flex items-center gap-2">
            {state === 'speaking' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-orbitron text-[11px]">
                <Volume2 className="w-3.5 h-3.5" /> JARVIS SPEAKING (बोल रहा है)
              </span>
            )}
            {state === 'listening' && (
              <span className="flex items-center gap-1.5 text-sky-400 font-bold font-orbitron text-[11px]">
                <Mic className="w-3.5 h-3.5 animate-bounce" /> LISTENING TO YOU (सुन रहा है)
              </span>
            )}
            {state === 'thinking' && (
              <span className="flex items-center gap-1.5 text-purple-400 font-bold font-orbitron text-[11px]">
                <Activity className="w-3.5 h-3.5 animate-spin" /> QUANTUM PROCESSING (विचार कर रहा है)
              </span>
            )}
            {state === 'interrupted' && (
              <span className="text-amber-400 font-bold font-orbitron text-[11px]">
                VOICE INTERRUPTED (आवाज रोकी गई)
              </span>
            )}
          </div>

          {/* Interruption Button */}
          {state === 'speaking' && (
            <button
              onClick={onInterrupt}
              className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900 text-[11px] font-chakra font-bold flex items-center gap-1 transition-all shadow-sm"
              title="Click or press Space to interrupt JARVIS"
            >
              <Square className="w-3 h-3 fill-current" /> Interupt (बोलना रोकें)
            </button>
          )}
        </div>

        {/* Live Subtitle Content */}
        <div className="min-h-[42px] flex items-center justify-center text-center">
          {state === 'listening' && transcriptText ? (
            <p className="text-sm font-medium text-sky-300 font-chakra leading-relaxed">
              &ldquo;{transcriptText}&rdquo;
            </p>
          ) : subtitleText ? (
            <p className="text-sm font-medium text-cyan-100 font-chakra leading-relaxed">
              {subtitleText}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {state === 'listening' ? 'आवाज का पता लगा रहा है... बोलिए सर...' : 'जार्विस तत्पर है...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
