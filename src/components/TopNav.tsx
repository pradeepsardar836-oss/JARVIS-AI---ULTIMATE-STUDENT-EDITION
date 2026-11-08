import React, { useState, useEffect } from 'react';
import { ActiveTab, JarvisState } from '../types/jarvis';
import { 
  Bot, Box, GraduationCap, Laptop, Download, 
  Activity, Clock, Volume2, VolumeX, Shield, Wifi, 
  Minus, Square, X, Settings
} from 'lucide-react';
import { jarvisAudio } from '../utils/audioEngine';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  state: JarvisState;
  onOpenDesktopModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  state,
  onOpenDesktopModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Subtle realistic CPU telemetry simulation
    const cpuInterval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 12) + (state === 'thinking' ? 45 : 12));
    }, 3000);
    return () => clearInterval(cpuInterval);
  }, [state]);

  const handleOpenVoiceSettings = () => {
    setAvailableVoices(jarvisAudio.getAvailableVoices());
    setShowVoiceSettings(!showVoiceSettings);
  };

  const handleSelectVoice = (v: SpeechSynthesisVoice) => {
    jarvisAudio.setVoice(v);
    jarvisAudio.speak("नमस्कार! मैंने नई आवाज़ सक्रिय कर ली है।");
    setShowVoiceSettings(false);
  };

  return (
    <header className="w-full flex flex-col border-b border-cyan-500/30 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md select-none">
      {/* Windows 11 Styled Window Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 border-b border-cyan-900/60 text-[11px] font-chakra text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
          <span className="font-orbitron font-bold text-cyan-200 tracking-wider">
            STARK OS // JARVIS AI – ULTIMATE STUDENT EDITION
          </span>
          <span className="hidden sm:inline text-cyan-500/60 font-mono">
            [WIN11-x64-DESKTOP]
          </span>
        </div>

        {/* Telemetry info */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex items-center gap-1.5 text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>CPU: {cpuUsage}%</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
            <span>QUANTUM LINK: ACTIVE</span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr || '12:00:00 PM'}</span>
          </div>

          {/* Windows Window Controls */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Minimize">
              <Minus className="w-3 h-3" />
            </button>
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="Maximize">
              <Square className="w-3 h-3" />
            </button>
            <button className="p-1 hover:bg-rose-900/80 rounded text-slate-400 hover:text-rose-200" title="Close">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'assistant', label: 'JARVIS Voice HUD', icon: Bot },
            { id: 'workspace3d', label: '3D Model Lab', icon: Box },
            { id: 'student', label: 'Student Mode (NCERT)', icon: GraduationCap },
            { id: 'computer', label: 'Computer Academy', icon: Laptop },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ActiveTab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-chakra font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-cyan-300 hover:bg-cyan-950/70 border border-transparent hover:border-cyan-500/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 relative">
          {/* Voice Selector Settings */}
          <button
            onClick={handleOpenVoiceSettings}
            className="p-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 hover:text-white transition-colors"
            title="Configure JARVIS Voice & Audio Output"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Voice Settings Dropdown */}
          {showVoiceSettings && (
            <div className="absolute top-11 right-0 w-72 bg-slate-950 border border-cyan-500/50 rounded-xl p-3 shadow-2xl z-50 space-y-2">
              <div className="text-xs font-bold font-orbitron text-cyan-300 border-b border-cyan-500/30 pb-1">
                आवाज़ चयन (Voice Selector)
              </div>
              <p className="text-[11px] text-slate-400">
                JARVIS हिंदी और भारतीय अंग्रेजी लहजे का उपयोग करता है:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {availableVoices.length > 0 ? (
                  availableVoices.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectVoice(v)}
                      className="w-full text-left p-1.5 text-xs rounded hover:bg-cyan-950 text-cyan-200 truncate flex items-center justify-between"
                    >
                      <span className="truncate">{v.name}</span>
                      <span className="text-[9px] text-slate-500 ml-1">{v.lang}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">सिस्टम आवाज़ें लोड हो रही हैं...</p>
                )}
              </div>
            </div>
          )}

          {/* Download Windows EXE Package Button */}
          <button
            onClick={onOpenDesktopModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-chakra font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Windows App (.EXE)</span>
            <span className="sm:hidden">EXE</span>
          </button>
        </div>
      </div>
    </header>
  );
};
