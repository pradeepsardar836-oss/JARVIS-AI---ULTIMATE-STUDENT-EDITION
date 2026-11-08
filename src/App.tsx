/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, ChatMessage, JarvisState, Model3DSpec } from './types/jarvis';
import { jarvisAudio } from './utils/audioEngine';
import { TopNav } from './components/TopNav';
import { SubtitlesOverlay } from './components/SubtitlesOverlay';
import { VoiceAssistantHUD } from './components/VoiceAssistantHUD';
import { ThreeWorkspace } from './components/ThreeWorkspace';
import { StudentMode } from './components/StudentMode';
import { ComputerAcademy } from './components/ComputerAcademy';
import { DesktopPackageModal } from './components/DesktopPackageModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('assistant');
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [continuousMode, setContinuousMode] = useState<boolean>(false);
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState<boolean>(false);
  const [currentModelSpec, setCurrentModelSpec] = useState<Model3DSpec | null>(null);
  const [is3DLoading, setIs3DLoading] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Initial welcome greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'jarvis',
      text: 'नमस्कार! मैं JARVIS हूँ – आपका व्यक्तिगत AI शिक्षक एवं मार्गदर्शक। आज हम क्या सीखेंगे? आप विज्ञान, गणित, कंप्यूटर कोर्सेज (CCC, DCA, Python) या 3D मॉडलिंग के बारे में सीधे बोल कर पूछ सकते हैं।',
      timestamp: 'Just now',
      category: 'general',
    },
  ]);

  // Voice playback with live subtitle updates
  const speakJarvisResponse = useCallback((text: string) => {
    setJarvisState('speaking');
    setSubtitleText(text);

    jarvisAudio.speak(
      text,
      () => {
        setJarvisState('speaking');
      },
      () => {
        setJarvisState('idle');
      }
    );
  }, []);

  // Voice interruption
  const handleInterrupt = useCallback(() => {
    jarvisAudio.stopSpeaking();
    setJarvisState('interrupted');
    setTimeout(() => {
      setJarvisState('idle');
    }, 1200);
  }, []);

  // Send message to backend Gemini AI
  const handleSendMessage = useCallback(
    async (
      text: string,
      context: 'general' | 'student' | 'computer' = 'general',
      studentClass?: string,
      subject?: string
    ) => {
      if (!text.trim()) return;

      // Stop any current speech
      jarvisAudio.stopSpeaking();

      // Check if user is asking for 3D model generation via voice
      const lowerText = text.toLowerCase();
      if (
        lowerText.includes('3d model') ||
        lowerText.includes('3d बनाओ') ||
        lowerText.includes('मॉडल बनाओ') ||
        lowerText.includes('solar system') ||
        lowerText.includes('dna') ||
        lowerText.includes('robotic arm')
      ) {
        handleGenerate3D(text);
      }

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setJarvisState('thinking');
      setIsAiLoading(true);
      setTranscriptText('');

      try {
        const response = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-6).map((m) => ({ role: m.sender, content: m.text })),
            context,
            studentClass,
            subject,
          }),
        });

        const data = await response.json();
        const replyText =
          data.reply ||
          'नमस्कार सर! मुझे आपका प्रश्न प्राप्त हुआ। मैं इस विषय पर आपको विस्तार से मार्गदर्शन करूँगा।';

        const jarvisMsg: ChatMessage = {
          id: `jarvis_${Date.now()}`,
          sender: 'jarvis',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, jarvisMsg]);
        speakJarvisResponse(replyText);
      } catch (error) {
        console.error('Chat API Error:', error);
        const fallbackText =
          'सर, नेटवर्क में क्षणिक व्यवधान है। किंतु मैं आपके प्रश्न को ऑफलाइन ज्ञानकोश से संसाधित कर रहा हूँ।';
        setMessages((prev) => [
          ...prev,
          {
            id: `jarvis_err_${Date.now()}`,
            sender: 'jarvis',
            text: fallbackText,
            timestamp: 'Just now',
          },
        ]);
        speakJarvisResponse(fallbackText);
      } finally {
        setIsAiLoading(false);
      }
    },
    [messages, speakJarvisResponse]
  );

  // Generate 3D Model from prompt
  const handleGenerate3D = async (prompt: string) => {
    setIs3DLoading(true);
    setJarvisState('thinking');
    setActiveTab('workspace3d');

    try {
      const res = await fetch('/api/jarvis/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data: Model3DSpec = await res.json();
      setCurrentModelSpec(data);

      const notifyText = `सर, मैंने आपके लिए 3D मॉडल "${data.title}" तैयार कर लिया है। आप इसे 3D वर्कस्पेस में घुमाकर देख सकते हैं और ब्लेंडर स्क्रिप्ट भी कॉपी कर सकते हैं।`;
      speakJarvisResponse(notifyText);
    } catch (e) {
      console.error('3D Gen Error:', e);
    } finally {
      setIs3DLoading(false);
    }
  };

  // Setup Speech Recognition
  useEffect(() => {
    const recognition = jarvisAudio.initSpeechRecognition(
      (transcript, isFinal) => {
        setTranscriptText(transcript);

        if (isFinal) {
          const lower = transcript.toLowerCase();

          // Wake Word Detection
          if (
            continuousMode &&
            (lower.includes('jarvis') ||
              lower.includes('जार्विस') ||
              lower.includes('hey jarvis') ||
              lower.includes('hello jarvis') ||
              lower.includes('सुनो'))
          ) {
            handleSendMessage(transcript);
          } else if (!continuousMode) {
            handleSendMessage(transcript);
          }
        }
      },
      (error) => {
        console.warn('Recognition notice:', error);
      },
      (listening) => {
        setIsListening(listening);
        if (listening) {
          setJarvisState('listening');
        } else if (jarvisState === 'listening') {
          setJarvisState('idle');
        }
      }
    );

    // Boot audio chime
    const timer = setTimeout(() => {
      jarvisAudio.playBootSound();
    }, 800);

    return () => clearTimeout(timer);
  }, [continuousMode, handleSendMessage, jarvisState]);

  // Spacebar shortcut to interrupt or talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (jarvisAudio.isSpeaking()) {
          handleInterrupt();
        } else {
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInterrupt]);

  const toggleListening = () => {
    if (isListening) {
      jarvisAudio.stopListening();
      setIsListening(false);
      setJarvisState('idle');
    } else {
      jarvisAudio.stopSpeaking();
      jarvisAudio.startListening(continuousMode);
      setIsListening(true);
      setJarvisState('listening');
    }
  };

  const toggleContinuousMode = () => {
    const next = !continuousMode;
    setContinuousMode(next);
    if (next) {
      jarvisAudio.startListening(true);
      setIsListening(true);
      setJarvisState('listening');
      jarvisAudio.playChime('success');
    } else {
      jarvisAudio.stopListening();
      setIsListening(false);
      setJarvisState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-rajdhani selection:bg-cyan-500 selection:text-slate-950">
      {/* Windows 11 Desktop Taskbar Header */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        state={jarvisState}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-4">
        {/* Live Subtitles HUD Overlay */}
        <SubtitlesOverlay
          state={jarvisState}
          subtitleText={subtitleText}
          transcriptText={transcriptText}
          onInterrupt={handleInterrupt}
        />

        {/* Tab 1: Assistant Voice HUD (Arc Reactor & Realtime AI Chat) */}
        {activeTab === 'assistant' && (
          <VoiceAssistantHUD
            state={jarvisState}
            messages={messages}
            onSendMessage={(txt) => handleSendMessage(txt, 'general')}
            onToggleListening={toggleListening}
            isListening={isListening}
            continuousMode={continuousMode}
            onToggleContinuous={toggleContinuousMode}
            onSelectTopic={(topic) => handleSendMessage(`मुझे ${topic} के बारे में समझाएं`)}
            onPlayMessageAudio={(text) => speakJarvisResponse(text)}
            onInterrupt={handleInterrupt}
          />
        )}

        {/* Tab 2: 3D Model Creation & Three.js Lab */}
        {activeTab === 'workspace3d' && (
          <ThreeWorkspace
            currentModel={currentModelSpec}
            onGenerateCustom={handleGenerate3D}
            isLoading={is3DLoading}
          />
        )}

        {/* Tab 3: Student Mode (NCERT, Math Solver, Quizzes) */}
        {activeTab === 'student' && (
          <StudentMode
            onAskJarvis={(query, cls, sub) => {
              setActiveTab('assistant');
              handleSendMessage(query, 'student', cls, sub);
            }}
            isLoading={isAiLoading}
          />
        )}

        {/* Tab 4: Computer Academy (CCC, DCA, Python, Web, SQL) */}
        {activeTab === 'computer' && (
          <ComputerAcademy
            onAskJarvis={(query, sub) => {
              setActiveTab('assistant');
              handleSendMessage(query, 'computer', undefined, sub);
            }}
          />
        )}
      </main>

      {/* Standalone Windows Desktop App (.EXE) Modal */}
      <DesktopPackageModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      {/* Futuristic Footer Telemetry */}
      <footer className="w-full border-t border-cyan-950/80 bg-slate-950/90 py-2.5 px-4 text-center text-[11px] text-cyan-500/70 font-chakra flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>JARVIS AI CORE: ONLINE // STARK INDUSTRIES KNOWLEDGE BASE</span>
        </div>
        <div className="font-mono text-slate-500">
          Indian Hindi Voice Engine • 3D WebGL Three.js • NCERT Class 6-12 • CCC/DCA Certified
        </div>
      </footer>
    </div>
  );
}
