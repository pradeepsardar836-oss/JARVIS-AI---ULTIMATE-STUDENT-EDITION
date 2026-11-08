import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, JarvisState } from '../types/jarvis';
import { ArcReactor } from './ArcReactor';
import { AudioWaveform } from './AudioWaveform';
import { 
  Mic, MicOff, Send, Volume2, Sparkles, Radio,
  BookOpen, Box, Compass, RefreshCw
} from 'lucide-react';

interface VoiceAssistantHUDProps {
  state: JarvisState;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onToggleListening: () => void;
  isListening: boolean;
  continuousMode: boolean;
  onToggleContinuous: () => void;
  onSelectTopic: (topic: string) => void;
  onPlayMessageAudio: (text: string) => void;
  onInterrupt: () => void;
}

export const VoiceAssistantHUD: React.FC<VoiceAssistantHUDProps> = ({
  state,
  messages,
  onSendMessage,
  onToggleListening,
  isListening,
  continuousMode,
  onToggleContinuous,
  onSelectTopic,
  onPlayMessageAudio,
  onInterrupt,
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const sampleVoicePrompts = [
    { label: 'हेलो जार्विस!', prompt: 'हेलो जार्विस! आज हम क्या सीखेंगे?' },
    { label: 'प्रकाश का अपवर्तन', prompt: 'Class 10 Physics: प्रकाश का अपवर्तन (Refraction) और स्नेल का नियम उदाहरण सहित हिंदी में समझाएं।' },
    { label: 'Python For Loop', prompt: 'Python में for loop और while loop कैसे काम करता है? CCC परीक्षा के लिए समझाइए।' },
    { label: '3D सौरमंडल बनाओ', prompt: 'JARVIS, मेरे लिए एक 3D Solar System (सौरमंडल) मॉडल तैयार करें।' },
    { label: 'Newton’s Laws of Motion', prompt: 'न्यूटन के गति के तीनों नियम और उनके व्यावहारिक उदाहरण बताएं।' },
    { label: 'DNA क्या है?', prompt: 'DNA की संरचना और आनुवंशिकी में इसकी भूमिका सरल भाषा में समझाइए।' },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Central Holographic HUD Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column: Arc Reactor Core & Voice Controller */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/70 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          {/* Subtle Cyber Matrix background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_75%)] pointer-events-none" />

          {/* Central Arc Reactor */}
          <ArcReactor
            state={state}
            onActivate={onToggleListening}
            size="md"
          />

          {/* Audio Waveform Meter */}
          <div className="w-full mt-3">
            <AudioWaveform state={state} />
          </div>

          {/* Voice Mode Toggles & Telemetry */}
          <div className="w-full flex items-center justify-between gap-2 mt-2 px-2">
            <button
              onClick={onToggleContinuous}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-chakra font-bold flex items-center justify-center gap-2 border transition-all ${
                continuousMode
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900/90 text-cyan-300 border-cyan-800 hover:border-cyan-500/50'
              }`}
              title="Continuous Audio-to-Audio hands-free conversation with Wake Word 'Hey JARVIS'"
            >
              <Radio className={`w-3.5 h-3.5 ${continuousMode ? 'animate-pulse' : ''}`} />
              <span>Wake Word Mode: {continuousMode ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={onToggleListening}
              className={`py-2 px-4 rounded-lg text-xs font-chakra font-bold flex items-center gap-1.5 border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-md shadow-rose-600/30'
                  : 'bg-cyan-950 border-cyan-500/60 text-cyan-200 hover:bg-cyan-900'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? 'Stop Mic' : 'Push to Talk'}</span>
            </button>
          </div>

          <div className="text-[10px] text-cyan-400/60 font-mono mt-2 tracking-wider">
            Wake Word: &quot;Hey JARVIS&quot; | &quot;जार्विस&quot; | &quot;Hello JARVIS&quot;
          </div>
        </div>

        {/* Right Column: Intelligent Conversation Feed & Voice Log */}
        <div className="lg:col-span-7 h-[460px] flex flex-col rounded-2xl bg-slate-950/80 border border-cyan-500/30 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-cyan-500/30 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-orbitron font-bold text-xs text-cyan-200 tracking-wider">
                REAL-TIME VOICE & KNOWLEDGE CONSOLE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                AI STUDENT ENGINE 3.8
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-chakra text-slate-400">
                  <span>{msg.sender === 'user' ? 'Student (आप)' : 'JARVIS AI'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-xl max-w-[90%] text-xs leading-relaxed select-text shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-900/70 to-cyan-900/70 border border-sky-400/50 text-cyan-50 font-medium'
                      : 'hud-panel text-slate-200 font-normal border-cyan-500/30'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Play audio button on JARVIS message */}
                  {msg.sender === 'jarvis' && (
                    <div className="mt-2.5 pt-2 border-t border-cyan-900/40 flex items-center justify-between">
                      <button
                        onClick={() => onPlayMessageAudio(msg.text)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-200 font-semibold flex items-center gap-1"
                        title="Replay speech in Hindi"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> सुनें (Listen in Hindi)
                      </button>
                      <span className="text-[10px] font-mono text-cyan-600">STARK-VOCAL-MK85</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Voice Prompt Shortcuts */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-cyan-950 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <span className="text-[10px] font-mono text-cyan-500 uppercase shrink-0">Quick Topics:</span>
            {sampleVoicePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(p.prompt)}
                className="px-2 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-[10px] text-cyan-300 font-chakra shrink-0 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Text/Speech Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-slate-950 border-t border-cyan-500/30 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="हिंदी, English या Hinglish में बोलें या टाइप करें (उदा: 'प्रकाश संश्लेषण समझाइए')..."
              className="flex-1 bg-slate-900 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-cyan-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || state === 'thinking'}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/30 shrink-0"
              title="Send Command to JARVIS"
            >
              {state === 'thinking' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
