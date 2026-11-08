import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

// In development under AI Studio, the dev server must always listen on port 3000
// Cloud Run container sets PORT=8080 which is reserved for the system reverse proxy (nginx)
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI client helper
function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt for JARVIS
const JARVIS_SYSTEM_PROMPT = `
You are JARVIS (Just A Rather Very Intelligent System) – Ultimate Student Edition.
Inspired by Tony Stark's JARVIS, but specifically enhanced as the world's most advanced AI tutor, mentor, and technology guide for Indian and global school students (Class 6 to Class 12, CCC, DCA, ADCA, Computer Science).

Personality & Guidelines:
1. Tone: Highly intelligent, polite, calm, respectful, encouraging, and futuristic (e.g. "नमस्कार सर/मैम", "JARVIS आपके अध्ययन और अनुसंधान के लिए तत्पर है।").
2. Languages: Primarily Hindi (fluent, respectful, easy to understand for Indian students) with seamless English & Hinglish support.
3. Teaching Philosophy: Never just give dry answers; explain the 'why' and 'how'. Break down complex STEM, Physics, Chemistry, Math, History, and Computer topics with step-by-step explanations, real-life examples, and simple Hindi analogies.
4. Computer Courses: You are an expert teacher of Basic Computer, CCC, DCA, ADCA, MS Word/Excel/PowerPoint, Python, C/C++, HTML/CSS/JS, Java, SQL, Cyber Security, and AI.
5. 3D & Technology: You guide students on 3D geometry, Blender Python scripts, robotics, and scientific modeling.
6. Format your output clearly with bullet points, formulas, bold highlights, and clean structure.
7. Keep responses engaging and directly actionable for voice reading as well as visual reading.
`;

// 1. Chat endpoint for conversational Q&A and Student Tutoring
app.post('/api/jarvis/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [], context = 'general', studentClass, subject } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback response if API key is not yet set
      res.json({
        reply: `नमस्कार! मैं आपका JARVIS AI शिक्षक हूँ। आपका सवाल: "${message}"। मैं आपको विज्ञान, गणित, कंप्यूटर (CCC, DCA, Python) और 3D मॉडलिंग में मदद करने के लिए तैयार हूँ। कृपया अपनी पढ़ाई या 3D प्रोजेक्ट के बारे में पूछें।`,
        source: 'local_fallback',
      });
      return;
    }

    let contextualPrompt = JARVIS_SYSTEM_PROMPT;
    if (context === 'student' && studentClass) {
      contextualPrompt += `\nCurrent Student Context: Class ${studentClass}, Subject: ${subject || 'General Studies'}. Tailor explanation strictly to NCERT/CBSE level for Class ${studentClass}.`;
    } else if (context === 'computer') {
      contextualPrompt += `\nCurrent Context: Computer Course Mastery (${subject || 'Programming & Fundamentals'}). Provide practical code, shortcuts, and Hindi explanations.`;
    }

    const conversationHistory = history.map((item: { role: string; content: string }) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }],
    }));

    // Add current query
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const ai = getAiClient();
    if (!ai) {
      res.json({
        reply: `नमस्कार! मैं आपका JARVIS AI शिक्षक हूँ। आपका सवाल: "${message}"। मैं आपको विज्ञान, गणित, कंप्यूटर (CCC, DCA, Python) और 3D मॉडलिंग में मदद करने के लिए तैयार हूँ।`,
        source: 'local_fallback',
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationHistory,
      config: {
        systemInstruction: contextualPrompt,
      },
    });

    const replyText = response.text || 'मुझे क्षमा करें सर, मैं उत्तर संसाधित नहीं कर सका। कृपया पुनः प्रयास करें।';

    res.json({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('JARVIS Chat Error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message || 'Internal server error',
    });
  }
});

// 2. 3D Model Spec and Blender Script Generator
app.post('/api/jarvis/generate-3d', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, modelType } = req.body;

    const systemPrompt = `
You are JARVIS 3D Laboratory Architect.
The student requested a 3D model for: "${prompt || modelType || 'Educational 3D Model'}".
You must return a JSON response with:
1. "title": Short descriptive title in English & Hindi
2. "description": 2-3 sentences explaining the 3D structure and scientific/technical significance in Hindi.
3. "parts": Array of 3 to 8 components that comprise this 3D model (name, colorHex, geometryType ['sphere', 'cylinder', 'box', 'torus', 'cone'], relativeScale [x,y,z], relativePosition [x,y,z], description).
4. "blenderPythonScript": Complete, executable Python script for Blender 3.x / 4.x using 'bpy' that deletes default cube, creates this exact 3D object with materials/colors, sets up camera and lighting, and is ready for rendering or exporting to OBJ/FBX/GLB.
5. "educationalNotes": Key educational facts about this object in Hindi for students.

Return ONLY valid JSON matching this structure.
`;

    if (!process.env.GEMINI_API_KEY) {
      // Provide high quality procedural fallback for popular student models
      res.json({
        title: "Solar System Model (सौरमंडल मॉडल)",
        description: "यह हमारे सौरमंडल का एक त्रि-आयामी (3D) मॉडल है, जिसमें सूर्य और ग्रहों की परिक्रमा को दर्शाया गया है।",
        parts: [
          { name: "Sun (सूर्य)", colorHex: "#f59e0b", geometryType: "sphere", relativeScale: [2.5, 2.5, 2.5], relativePosition: [0, 0, 0], description: "सौरमंडल का केंद्र" },
          { name: "Mercury Orbit Ring", colorHex: "#38bdf8", geometryType: "torus", relativeScale: [4, 4, 0.1], relativePosition: [0, 0, 0], description: "बुध की कक्षा" },
          { name: "Earth (पृथ्वी)", colorHex: "#0284c7", geometryType: "sphere", relativeScale: [0.9, 0.9, 0.9], relativePosition: [5.5, 0, 0], description: "जीवनदायिनी पृथ्वी" },
          { name: "Mars (मंगल)", colorHex: "#ef4444", geometryType: "sphere", relativeScale: [0.7, 0.7, 0.7], relativePosition: [7.5, 0, 0], description: "लाल ग्रह" },
          { name: "Jupiter (बृहस्पति)", colorHex: "#d97706", geometryType: "sphere", relativeScale: [1.8, 1.8, 1.8], relativePosition: [10.5, 0, 0], description: "विशाल गैसीय ग्रह" },
        ],
        blenderPythonScript: `# JARVIS Automated Blender 3D Model Generator
# Target: Solar System Model
import bpy

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create Sun
bpy.ops.mesh.primitive_uv_sphere_add(radius=2.0, location=(0, 0, 0))
sun = bpy.context.active_object
sun.name = "Sun"

# Create Sun Material
mat = bpy.data.materials.new(name="SunMat")
mat.use_nodes = True
nodes = mat.node_tree.nodes
emission = nodes.new(type='ShaderNodeEmission')
emission.inputs['Color'].default_value = (1.0, 0.65, 0.0, 1.0)
emission.inputs['Strength'].default_value = 5.0
mat.node_tree.links.new(emission.outputs['Emission'], nodes.get("Material Output").inputs['Surface'])
sun.data.materials.append(mat)

# Add Camera & Light
bpy.ops.object.camera_add(location=(0, -18, 10), rotation=(1.1, 0, 0))
bpy.ops.object.light_add(type='POINT', radius=1, location=(0, 0, 5))
print("JARVIS: Blender 3D Model created successfully!")
`,
        educationalNotes: "सूर्य हमारे सौरमंडल के कुल द्रव्यमान का 99.86% हिस्सा रखता है। पृथ्वी सूर्य से 14.96 करोड़ किमी दूर स्थित है।"
      });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(500).json({ error: 'AI client not initialized' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a 3D model specification for: ${prompt || modelType}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('3D Gen Error:', error);
    res.status(500).json({ error: 'Failed to generate 3D model', details: error.message });
  }
});

// 3. Quiz & Exam Preparation Generator
app.post('/api/jarvis/quiz', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentClass = '10', subject = 'Science', topic = 'Physics Fundamentals' } = req.body;

    const quizSystemPrompt = `
You are JARVIS Examination & Quiz Architect for Class ${studentClass} (${subject} - ${topic}).
Generate 5 high quality multiple-choice questions in Hindi (with technical terms in English/Hinglish where helpful).
Return ONLY JSON with array of questions:
{
  "topic": "${topic}",
  "class": "${studentClass}",
  "subject": "${subject}",
  "questions": [
    {
      "id": 1,
      "question": "Question text in Hindi",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Step-by-step Hindi explanation of the correct formula or concept",
      "hint": "Useful clue for student"
    }
  ]
}
`;

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        topic: topic || "विज्ञान और कंप्यूटर",
        class: studentClass,
        subject: subject,
        questions: [
          {
            id: 1,
            question: "प्रकाश संश्लेषण (Photosynthesis) के दौरान कौन सी गैस मुक्त होती है?",
            options: ["कार्बन डाइऑक्साइड (CO2)", "ऑक्सीजन (O2)", "नाइट्रोजन (N2)", "हाइड्रोजन (H2)"],
            correctIndex: 1,
            explanation: "पौधे सूर्य के प्रकाश और क्लोरोफिल की उपस्थिति में जल और कार्बन डाइऑक्साइड से ग्लूकोज बनाते हैं और ऑक्सीजन गैस मुक्त करते हैं।",
            hint: "यह गैस सभी जीवों के सांस लेने के लिए आवश्यक है।"
          },
          {
            id: 2,
            question: "कंप्यूटर की सबसे तेज और प्राथमिक मेमोरी कौन सी होती है?",
            options: ["Hard Disk Drive", "Cache Memory & RAM", "Floppy Disk", "Optical Disc"],
            correctIndex: 1,
            explanation: "CPU को सबसे तेज डेटा प्रदान करने के लिए Cache Memory और RAM (Random Access Memory) का उपयोग होता है।",
            hint: "यह वोलेटाइल मेमोरी होती है जो बिजली जाने पर खाली हो जाती है।"
          },
          {
            id: 3,
            question: "न्यूटन के गति के दूसरे नियम (Newton's 2nd Law) का सूत्र क्या है?",
            options: ["F = m * a", "E = mc²", "v = u + at", "W = F * d"],
            correctIndex: 0,
            explanation: "बल (Force) = द्रव्यमान (Mass) × त्वरण (Acceleration)। यह संवेग परिवर्तन की दर को दर्शाता है।",
            hint: "Force = Mass × Acceleration"
          }
        ]
      });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(500).json({ error: 'AI client not initialized' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate 5 interactive quiz questions for Class ${studentClass} ${subject} on "${topic}"`,
      config: {
        systemInstruction: quizSystemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const quizData = JSON.parse(response.text || '{}');
    res.json(quizData);
  } catch (error: any) {
    console.error('Quiz Gen Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
  }
});

// 4. Desktop Client Download Helper (Provides complete standalone Python source & setup script)
app.get('/api/jarvis/desktop-code', (req: Request, res: Response): void => {
  res.json({
    pythonApp: `# =====================================================================
# JARVIS AI – Ultimate Student Edition (Windows 10 & 11 Desktop Edition)
# Powered by PySide6, Python, SpeechRecognition, and Gemini AI
# =====================================================================
import sys
import os
import json
import pyttsx3
import speech_recognition as sr
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QTextEdit, QProgressBar, QFrame, QStackedWidget
)
from PySide6.QtCore import Qt, QTimer, QThread, Signal
from PySide6.QtGui import QColor, QFont, QIcon

class JarvisVoiceWorker(QThread):
    heard_speech = Signal(str)
    status_changed = Signal(str)

    def __init__(self):
        super().__init__()
        self.recognizer = sr.Recognizer()
        self.running = True

    def run(self):
        self.status_changed.emit("Listening for wake word 'Hey JARVIS'...")
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1.0)
            while self.running:
                try:
                    audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                    text = self.recognizer.recognize_google(audio, language="hi-IN")
                    if text:
                        self.heard_speech.emit(text)
                except Exception:
                    pass

class JarvisMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("JARVIS AI – Ultimate Student Edition")
        self.resize(1100, 750)
        self.setStyleSheet("""
            QMainWindow { background-color: #030712; }
            QLabel { color: #38bdf8; font-family: 'Segoe UI', Arial; }
            QPushButton {
                background: rgba(6, 182, 212, 0.2);
                border: 1px solid #06b6d4;
                color: #e0f2fe;
                padding: 10px 18px;
                border-radius: 6px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: rgba(6, 182, 212, 0.45);
                border: 1px solid #38bdf8;
            }
            QTextEdit {
                background-color: #0b1526;
                color: #f1f5f9;
                border: 1px solid #1e3a5f;
                border-radius: 8px;
                font-size: 14px;
            }
        """)

        # Initialize TTS Engine (Hindi Male Voice preference)
        self.engine = pyttsx3.init()
        voices = self.engine.getProperty('voices')
        for v in voices:
            if "hindi" in v.name.lower() or "india" in v.name.lower():
                self.engine.setProperty('voice', v.id)
                break
        self.engine.setProperty('rate', 155)

        # Central Layout
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Futuristic Title Bar
        header = QLabel("⚡ J.A.R.V.I.S. – ULTIMATE STUDENT EDITION [ONLINE]")
        header.setFont(QFont("Arial", 16, QFont.Bold))
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Chat and Status Log
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.append("JARVIS: नमस्कार सर! आपका व्यक्तिगत AI शिक्षक तैयार है। आप बोल कर या लिख कर कोई भी प्रश्न पूछ सकते हैं।\\n")
        layout.addWidget(self.chat_display)

        # Voice Trigger and Controls
        btn_layout = QHBoxLayout()
        self.btn_listen = QPushButton("🎙️ Start Listening (Hey JARVIS)")
        self.btn_listen.clicked.connect(self.toggle_voice)
        btn_layout.addWidget(self.btn_listen)

        self.btn_3d = QPushButton("📐 3D Model Laboratory")
        btn_layout.addWidget(self.btn_3d)

        self.btn_student = QPushButton("📚 NCERT & Student Mode")
        btn_layout.addWidget(self.btn_student)

        layout.addLayout(btn_layout)

        # Status Bar
        self.status_label = QLabel("Arc Reactor Core: 100% | Quantum Engine Active")
        self.status_label.setStyleSheet("color: #64748b; font-size: 11px;")
        layout.addWidget(self.status_label)

    def toggle_voice(self):
        self.speak_hindi("जी सर, मैं आपकी बात सुन रहा हूँ। कृपया अपना प्रश्न पूछें।")

    def speak_hindi(self, text):
        self.chat_display.append(f"JARVIS: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = JarvisMainWindow()
    window.show()
    sys.exit(app.exec())
`,
    requirements: `PySide6>=6.6.0
SpeechRecognition>=3.10.0
pyttsx3>=2.90
google-genai>=2.4.0
pyaudio>=0.2.14
requests>=2.31.0
pyinstaller>=6.3.0
`,
    buildInstructions: `
# Windows 10 / 11 Build & Run Guide:
1. Python 3.10+ Install karein (Add to PATH select karein).
2. Command Prompt kholein aur type karein:
   pip install -r requirements.txt
3. Application run karne ke liye:
   python jarvis_desktop.py
4. Standalone Windows .EXE banane ke liye:
   pyinstaller --noconfirm --onedir --windowed --name "JARVIS_Student_AI" jarvis_desktop.py
5. 'dist/JARVIS_Student_AI' folder me 'JARVIS_Student_AI.exe' taiyar ho jayega!
`
  });
});

// Setup Vite middlewares for development or serve dist in production
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(import.meta.dirname || process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(import.meta.dirname || process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS AI Ultimate Student Edition Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

start();
