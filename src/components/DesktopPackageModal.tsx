import React, { useState, useEffect } from 'react';
import { 
  Download, Terminal, Monitor, Shield, Check, Copy, 
  FileCode, Play, AlertTriangle, Cpu, HardDrive
} from 'lucide-react';
import { triggerDownload } from '../utils/objExporter';

interface DesktopPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopPackageModal: React.FC<DesktopPackageModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'app' | 'requirements' | 'builder' | 'security'>('app');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [desktopData, setDesktopData] = useState<{ pythonApp: string; requirements: string; buildInstructions: string } | null>(null);

  useEffect(() => {
    fetch('/api/jarvis/desktop-code')
      .then((res) => res.json())
      .then((data) => setDesktopData(data))
      .catch((err) => console.error(err));
  }, []);

  if (!isOpen) return null;

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadAllFiles = () => {
    if (!desktopData) return;
    triggerDownload(desktopData.pythonApp, 'jarvis_desktop.py', 'text/x-python');
    setTimeout(() => triggerDownload(desktopData.requirements, 'requirements.txt', 'text/plain'), 300);
    setTimeout(() => {
      const batContent = `@echo off
echo ========================================================
echo JARVIS AI - Ultimate Student Edition Windows EXE Builder
echo ========================================================
echo Installing dependencies...
pip install -r requirements.txt
echo Building Standalone Windows Executable (.exe)...
pyinstaller --noconfirm --onedir --windowed --name "JARVIS_Student_AI" jarvis_desktop.py
echo.
echo Build completed! You can find JARVIS_Student_AI.exe in the 'dist' folder.
pause
`;
      triggerDownload(batContent, 'build_exe.bat', 'application/x-bat');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="font-orbitron font-bold text-base text-cyan-200">
                WINDOWS 10 & 11 DESKTOP STANDALONE PACKAGE (.EXE)
              </h2>
              <p className="text-xs text-slate-400 font-chakra">
                PySide6 Desktop Application with Offline Voice, PyInstaller & Blender Automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-mono px-3"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-900/60 bg-slate-950">
          <div className="flex items-center gap-2">
            {[
              { id: 'app', label: 'jarvis_desktop.py', icon: FileCode },
              { id: 'requirements', label: 'requirements.txt', icon: Terminal },
              { id: 'builder', label: '1-Click EXE Build Guide', icon: Play },
              { id: 'security', label: 'Windows Security & Permissions', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-chakra font-medium flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={downloadAllFiles}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
          >
            <Download className="w-4 h-4" /> Download All Files
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {activeTab === 'app' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Full standalone PySide6 GUI desktop source code for Windows 10 & 11:
                </span>
                <button
                  onClick={() => handleCopy(desktopData?.pythonApp || '', 'app')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'app' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'app' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-900 border border-cyan-900 font-mono text-xs text-cyan-200 overflow-x-auto max-h-[380px] leading-relaxed select-text">
                {desktopData?.pythonApp || '// Loading desktop python script...'}
              </pre>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Python Dependencies (pip requirements):</span>
                <button
                  onClick={() => handleCopy(desktopData?.requirements || '', 'req')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'req' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-900 border border-cyan-900 font-mono text-xs text-emerald-400 overflow-x-auto select-text">
                {desktopData?.requirements || 'PySide6\nSpeechRecognition\npyttsx3\ngoogle-genai\npyinstaller'}
              </pre>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="space-y-4 text-xs text-slate-200">
              <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <h4 className="font-orbitron font-bold text-sm text-cyan-300">
                  चरणबद्ध Windows EXE निर्माण विधि (Step-by-Step Build Guide):
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>अपने कंप्यूटर में <strong>Python 3.10 या 3.11</strong> स्थापित करें (इंस्टॉलेशन के समय <code>Add Python to PATH</code> अवश्य चुनें)।</li>
                  <li>ऊपर दिए गए <strong>"Download All Files"</strong> बटन पर क्लिक करके फ़ाइलें डाउनलोड करें।</li>
                  <li>डाउनलोड किए गए फोल्डर में Command Prompt (cmd) खोलें और चलाएं:
                    <div className="p-2 my-1 rounded bg-slate-900 font-mono text-cyan-400 text-[11px]">
                      pip install -r requirements.txt
                    </div>
                  </li>
                  <li>एप्लीकेशन को टेस्ट करने के लिए:
                    <div className="p-2 my-1 rounded bg-slate-900 font-mono text-cyan-400 text-[11px]">
                      python jarvis_desktop.py
                    </div>
                  </li>
                  <li>एकल विंडोज़ .EXE फ़ाइल बनाने के लिए:
                    <div className="p-2 my-1 rounded bg-slate-900 font-mono text-emerald-400 text-[11px]">
                      pyinstaller --noconfirm --onedir --windowed --name "JARVIS_Student_AI" jarvis_desktop.py
                    </div>
                  </li>
                  <li><code>dist/JARVIS_Student_AI</code> फ़ोल्डर में <strong>JARVIS_Student_AI.exe</strong> निष्पादन योग्य फ़ाइल तैयार हो जाएगी!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-4 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 font-orbitron font-bold text-sm text-amber-300">
                  <Shield className="w-5 h-5 text-amber-400" />
                  JARVIS सुरक्षा प्रोटोकॉल एवं Windows अनुमतियां (Security & Permissions)
                </div>
                <p>
                  JARVIS AI छात्रों की सुरक्षा को सर्वोच्च प्राथमिकता देता है:
                </p>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  <li><strong>फ़ाइल सुरक्षा (Zero Deletion):</strong> JARVIS उपयोगकर्ता की अनुमति के बिना किसी भी निजी फ़ाइल को न तो मिटाएगा और न ही संशोधित करेगा।</li>
                  <li><strong>API की सुरक्षा (Secret Protection):</strong> आपकी API कुंजियाँ क्लाउड सीक्रेट्स में एन्क्रिप्टेड रहती हैं और कभी भी असुरक्षित उजागर नहीं होतीं।</li>
                  <li><strong>सुरक्षित इंटरनेट ब्राउज़िंग (Safe Browsing):</strong> इंटरनेट खोज केवल शैक्षणिक और तकनीकी ज्ञान तक सीमित है ताकि छात्रों को सुरक्षित वातावरण मिले।</li>
                  <li><strong>Windows विशेषाधिकार (Least Privilege):</strong> एप्लिकेशन केवल आवश्यक ऑडियो इनपुट और GUI अनुमतियों के साथ सामान्य उपयोगकर्ता मोड में चलता है।</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
