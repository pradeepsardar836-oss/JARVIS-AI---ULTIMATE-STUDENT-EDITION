export type JarvisState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';

export type ActiveTab = 'assistant' | 'workspace3d' | 'student' | 'computer' | 'desktop_build';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  hindiText?: string;
  timestamp: string;
  category?: 'general' | 'math' | 'science' | 'computer' | '3d';
}

export interface ModelPartSpec {
  name: string;
  colorHex: string;
  geometryType: 'sphere' | 'cylinder' | 'box' | 'torus' | 'cone';
  relativeScale: [number, number, number];
  relativePosition: [number, number, number];
  description?: string;
}

export interface Model3DSpec {
  title: string;
  description: string;
  parts: ModelPartSpec[];
  blenderPythonScript: string;
  educationalNotes: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface QuizData {
  topic: string;
  class: string;
  subject: string;
  questions: QuizQuestion[];
}

export interface ComputerCourseLesson {
  id: string;
  course: 'CCC' | 'DCA' | 'ADCA' | 'PYTHON' | 'WEB' | 'SQL' | 'CYBER' | 'CPP';
  title: string;
  hindiTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  codeSnippet?: string;
  shortcuts?: { key: string; description: string }[];
  exerciseQuestion?: string;
}
