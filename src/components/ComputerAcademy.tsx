import React, { useState } from 'react';
import { ComputerCourseLesson } from '../types/jarvis';
import { 
  Laptop, Code, Terminal, FileSpreadsheet, ShieldAlert, 
  Cpu, Database, Sparkles, Play, Check, Copy, BookOpen, ExternalLink
} from 'lucide-react';

interface ComputerAcademyProps {
  onAskJarvis: (query: string, subject: string) => void;
}

export const ComputerAcademy: React.FC<ComputerAcademyProps> = ({ onAskJarvis }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('CCC');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('ccc_1');
  const [copied, setCopied] = useState<boolean>(false);
  const [sandboxCode, setSandboxCode] = useState<string>(
    `# Python Program: Student Grade Calculator\nmarks = [85, 92, 78, 90, 88]\naverage = sum(marks) / len(marks)\nprint(f"Total Marks: {sum(marks)}/500")\nprint(f"Percentage: {average:.2f}%")\nif average >= 80:\n    print("Grade: A+ (Outstanding!)")\nelse:\n    print("Grade: B (Good Job!)")`
  );
  const [outputConsole, setOutputConsole] = useState<string>('');

  const courses = [
    { id: 'CCC', name: 'CCC Course', subtitle: 'Course on Computer Concepts (NIELIT)', icon: Laptop },
    { id: 'DCA', name: 'DCA & ADCA', subtitle: 'MS Word, Excel, PowerPoint, Access', icon: FileSpreadsheet },
    { id: 'PYTHON', name: 'Python Programming', subtitle: 'Beginner to Advanced & AI/Data', icon: Terminal },
    { id: 'WEB', name: 'Web Dev (HTML/CSS/JS)', subtitle: 'Frontend & Full-stack Architecture', icon: Code },
    { id: 'CPP', name: 'C & C++ Mastery', subtitle: 'Pointers, Memory & Data Structures', icon: Cpu },
    { id: 'SQL', name: 'Database & SQL', subtitle: 'Queries, Relational DBMS & Joins', icon: Database },
    { id: 'CYBER', name: 'Cyber Security & AI', subtitle: 'Ethical Hacking, Networking & ML', icon: ShieldAlert },
  ];

  const lessons: Record<string, ComputerCourseLesson[]> = {
    CCC: [
      {
        id: 'ccc_1',
        course: 'CCC',
        title: 'Introduction to Computer & GUI Based OS',
        hindiTitle: 'कंप्यूटर परिचय एवं ऑपरेटिंग सिस्टम (Windows/Linux)',
        difficulty: 'Beginner',
        summary: 'कंप्यूटर के प्रमुख 4 अंग: Input (Keyboard/Mouse), Processing (CPU - ALU & CU), Memory (RAM/ROM) और Output (Monitor/Printer)। Windows में फ़ाइल डायरेक्टरी, पाथ और GUI नेविगेशन।',
        shortcuts: [
          { key: 'Ctrl + C / Ctrl + V', description: 'कॉपी और पेस्ट (Copy & Paste)' },
          { key: 'Win + E', description: 'Windows File Explorer खोलना' },
          { key: 'Win + R', description: 'Run Command डायलॉग खोलना' },
          { key: 'Alt + Tab', description: 'सक्रिय ऐप्स के बीच स्विच करना' },
        ],
        exerciseQuestion: 'RAM और ROM में क्या अंतर है? वोलेटाइल मेमोरी किसे कहते हैं?',
      },
      {
        id: 'ccc_2',
        course: 'CCC',
        title: 'LibreOffice Writer / MS Word Fundamentals',
        hindiTitle: 'वर्ड प्रोसेसिंग एवं डॉक्यूमेंट फॉर्मेटिंग',
        difficulty: 'Beginner',
        summary: 'मार्जिन, ओरिएंटेशन (Portrait/Landscape), हेडर/फूटर, मेल मर्ज (Mail Merge) और टेबल निर्माण की संपूर्ण विधि।',
        shortcuts: [
          { key: 'Ctrl + B / I / U', description: 'Bold, Italic, Underline' },
          { key: 'Ctrl + F / H', description: 'Find & Replace (खोजें और बदलें)' },
          { key: 'Ctrl + K', description: 'Hyperlink जोड़ना' },
          { key: 'F7', description: 'Spelling & Grammar Check' },
        ],
        exerciseQuestion: 'Mail Merge का मुख्य उद्देश्य क्या है? इसे किन परिस्थितियों में उपयोग करते हैं?',
      },
    ],
    DCA: [
      {
        id: 'dca_1',
        course: 'DCA',
        title: 'Advanced MS Excel Formulas & Data Analysis',
        hindiTitle: 'माइक्रोसॉफ्ट एक्सेल: VLOOKUP, SUMIFS और पिवट टेबल',
        difficulty: 'Intermediate',
        summary: 'एक्सेल में डेटा विश्लेषण के लिए सबसे अधिक पूछे जाने वाले सूत्र: VLOOKUP, XLOOKUP, IF-ELSE, INDEX-MATCH और कंडीशनल फॉर्मेटिंग।',
        codeSnippet: `=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])\n=SUMIFS(sum_range, criteria_range1, criteria1)\n=IF(B2>=33, "PASS", "FAIL")`,
        shortcuts: [
          { key: 'Alt + =', description: 'AutoSum (स्वतः योग करना)' },
          { key: 'Ctrl + Shift + L', description: 'Filter लगाना/हटाना' },
          { key: 'F4', description: 'Cell Reference को Lock ($A$1) करना' },
        ],
        exerciseQuestion: 'VLOOKUP और HLOOKUP में क्या अंतर है? VLOOKUP की 4 मुख्य आवश्यकताएं क्या हैं?',
      },
    ],
    PYTHON: [
      {
        id: 'py_1',
        course: 'PYTHON',
        title: 'Python Core: Variables, Loops & Functions',
        hindiTitle: 'पायथन बेसिक्स: डेटा टाइप्स, लूप और फंक्शन्स',
        difficulty: 'Beginner',
        summary: 'Python एक उच्च-स्तरीय, इंटरप्रिटेड भाषा है। इसमें डायनामिक टाइपिंग, आसान सिंटैक्स और समृद्ध लाइब्रेरी इकोसिस्टम (NumPy, Pandas, PyTorch) है।',
        codeSnippet: `def calculate_bmi(weight_kg, height_m):\n    bmi = weight_kg / (height_m ** 2)\n    if bmi < 18.5:\n        return "Underweight"\n    elif bmi < 25:\n        return "Normal Weight"\n    else:\n        return "Overweight"\n\nprint("Health Status:", calculate_bmi(65, 1.72))`,
        exerciseQuestion: 'List और Tuple में म्यूटेबिलिटी (Mutability) का क्या अंतर है?',
      },
    ],
    WEB: [
      {
        id: 'web_1',
        course: 'WEB',
        title: 'HTML5 Semantic Tags & CSS3 Modern Flexbox',
        hindiTitle: 'वेब डेवलपमेंट: एचटीएमएल5 और सीएसएस3',
        difficulty: 'Beginner',
        summary: 'आधुनिक वेबसाइटों का ढांचा: <header>, <nav>, <main>, <section>, <article>, <footer>। CSS Flexbox (display: flex; justify-content: center; align-items: center;) द्वारा रिस्पॉन्सिव लेआउट।',
        codeSnippet: `<div class="card">\n  <h2>JARVIS AI</h2>\n  <p>Learn Technology with Ease</p>\n</div>\n\n<style>\n  .card {\n    display: flex;\n    flex-direction: column;\n    padding: 20px;\n    border-radius: 12px;\n    background: #0f172a;\n    color: #38bdf8;\n  }\n</style>`,
        exerciseQuestion: 'Inline, Block और Inline-Block एलिमेंट्स में क्या अंतर होता है?',
      },
    ],
    CPP: [
      {
        id: 'cpp_1',
        course: 'CPP',
        title: 'C & C++: Pointers, Memory & Structs',
        hindiTitle: 'सी एवं सी++: पॉइंटर्स, मेमोरी एलोकेशन एवं स्ट्रक्चर',
        difficulty: 'Intermediate',
        summary: 'पॉइंटर एक वेरिएबल है जो किसी अन्य वेरिएबल का मेमोरी एड्रेस स्टोर करता है। dynamic memory allocation (malloc/free अथवा new/delete) का सही प्रबंधन सिस्टम प्रोग्रामिंग की रीढ़ है।',
        codeSnippet: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 100;\n    int* ptr = &a;\n    cout << "Value of a: " << *ptr << endl;\n    cout << "Address: " << ptr << endl;\n    return 0;\n}`,
        exerciseQuestion: 'पॉइंटर और रेफरेंस (Reference) में क्या तकनीकी अंतर होता है?',
      },
    ],
    SQL: [
      {
        id: 'sql_1',
        course: 'SQL',
        title: 'Relational Database Queries & Joins',
        hindiTitle: 'डेटाबेस मैनेजमेंट: SELECT, INNER JOIN व GROUP BY',
        difficulty: 'Intermediate',
        summary: 'RDBMS (Relational Database Management System) में तालिकाओं (Tables) के बीच संबंध स्थापित करने के लिए PRIMARY KEY और FOREIGN KEY का प्रयोग होता है।',
        codeSnippet: `SELECT students.name, courses.course_name, marks.score\nFROM students\nINNER JOIN marks ON students.id = marks.student_id\nINNER JOIN courses ON marks.course_id = courses.id\nWHERE marks.score >= 75\nORDER BY marks.score DESC;`,
        exerciseQuestion: 'INNER JOIN और LEFT JOIN में क्या अंतर होता है?',
      },
    ],
    CYBER: [
      {
        id: 'cyber_1',
        course: 'CYBER',
        title: 'Cyber Security Fundamentals & Ethical Hacking',
        hindiTitle: 'साइबर सुरक्षा: पासवर्ड सुरक्षा, फ़िशिंग व एन्क्रिप्शन',
        difficulty: 'Advanced',
        summary: 'CIA Triad (Confidentiality, Integrity, Availability)। सममित (Symmetric) और असममित (Asymmetric RSA/AES) एन्क्रिप्शन। Two-Factor Authentication (2FA) और डिजिटल सिग्नेचर का महत्व।',
        codeSnippet: `# Simulating basic Caesar Cipher Encryption in Python\ndef encrypt_caesar(text, shift=3):\n    result = ""\n    for char in text:\n        if char.isalpha():\n            ascii_offset = 65 if char.isupper() else 97\n            result += chr((ord(char) - ascii_offset + shift) % 26 + ascii_offset)\n        else:\n            result += char\n    return result\n\nprint("Encrypted:", encrypt_caesar("JARVIS_SECRET", 3))`,
        exerciseQuestion: 'Phishing हमला क्या होता है और इससे बचने के 3 मुख्य उपाय क्या हैं?',
      },
    ],
  };

  const currentLessons = lessons[selectedCourse] || lessons.CCC;
  const currentLesson = currentLessons.find((l) => l.id === selectedLessonId) || currentLessons[0];

  const handleRunCode = () => {
    // Interactive client-side simulation
    try {
      if (selectedCourse === 'PYTHON') {
        setOutputConsole(`[Python 3.11 Runtime Simulation]\nTotal Marks: 433/500\nPercentage: 86.60%\nGrade: A+ (Outstanding!)\n>>> Process finished with exit code 0.`);
      } else if (selectedCourse === 'SQL') {
        setOutputConsole(`[SQL Query Executed Successfully]\n+--------------+------------------+-------+\n| name         | course_name      | score |\n+--------------+------------------+-------+\n| Rahul Sharma | Python AI Lab    |    94 |\n| Priya Verma  | Web Architecture |    89 |\n| Amit Patel   | Data Science     |    82 |\n+--------------+------------------+-------+\n3 rows in set (0.002 sec)`);
      } else {
        setOutputConsole(`[Execution Output]\nCompilation: Success\nOutput: Code executed safely in JARVIS sandbox environment.`);
      }
    } catch (e: any) {
      setOutputConsole(`Error: ${e.message}`);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-950/80 rounded-xl border border-cyan-500/30 p-5 shadow-2xl backdrop-blur-md flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/50">
            <Laptop className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-lg text-cyan-200 tracking-wide">
              COMPUTER COURSES EXPERT ACADEMY
            </h2>
            <p className="text-xs text-slate-400 font-chakra">
              CCC, DCA, ADCA, Python, Web Dev, C++, SQL & Cyber Security in Hindi
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            onAskJarvis(
              `मुझे ${selectedCourse} कोर्स का पूरा रोडमैप और शुरुआत से सीखने का तरीका हिंदी में बताएं।`,
              'Computer Courses'
            )
          }
          className="px-3.5 py-1.5 rounded-lg bg-cyan-600/40 hover:bg-cyan-600 border border-cyan-400 text-cyan-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" /> Ask JARVIS to Teach This Course
        </button>
      </div>

      {/* Course Selection Horizontal Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {courses.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedCourse === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCourse(c.id);
                const available = lessons[c.id];
                if (available && available.length > 0) {
                  setSelectedLessonId(available[0].id);
                  if (available[0].codeSnippet) {
                    setSandboxCode(available[0].codeSnippet);
                  }
                }
              }}
              className={`p-2.5 rounded-lg border text-left flex flex-col items-start gap-1 transition-all ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-cyan-100' : 'text-slate-300'}`}>
                {c.name}
              </span>
              <span className="text-[10px] text-slate-500 line-clamp-1">{c.subtitle}</span>
            </button>
          );
        })}
      </div>

      {/* Main Lesson Content & Code Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Lesson Explanations & Shortcuts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-lg bg-slate-900/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                {currentLesson.course} – {currentLesson.difficulty}
              </span>
              <button
                onClick={() =>
                  onAskJarvis(
                    `कृपया "${currentLesson.hindiTitle}" को और गहराई से उदाहरण देकर हिंदी में समझाएं।`,
                    currentLesson.course
                  )
                }
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" /> Explain in Voice
              </button>
            </div>

            <h3 className="font-orbitron font-bold text-base text-cyan-200">
              {currentLesson.title}
            </h3>
            <h4 className="text-xs font-medium text-amber-300">
              {currentLesson.hindiTitle}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentLesson.summary}
            </p>

            {/* Keyboard Shortcuts if available */}
            {currentLesson.shortcuts && (
              <div className="mt-3 pt-3 border-t border-cyan-900/60">
                <h5 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  महत्वपूर्ण शॉर्टकट कुंजियां (Essential Keyboard Shortcuts):
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentLesson.shortcuts.map((sc, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[11px]">
                      <code className="text-cyan-300 font-bold px-1 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {sc.key}
                      </code>
                      <span className="text-slate-300 text-[10px] text-right">{sc.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Exercise */}
            {currentLesson.exerciseQuestion && (
              <div className="p-3 rounded bg-cyan-950/30 border border-cyan-600/40 text-xs text-slate-200 mt-2">
                <div className="font-bold text-cyan-300 mb-1">अभ्यास प्रश्न (Practice Challenge):</div>
                <p className="text-slate-300">{currentLesson.exerciseQuestion}</p>
                <button
                  onClick={() => onAskJarvis(`उत्तर दें: ${currentLesson.exerciseQuestion}`, currentLesson.course)}
                  className="mt-2 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  JARVIS से उत्तर और व्याख्या पूछें &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Code Sandbox */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="p-4 rounded-lg bg-slate-900/90 border border-cyan-500/30 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="font-orbitron font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> CODE SANDBOX & PRACTICE
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyCode(sandboxCode)}
                  className="p-1 text-slate-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleRunCode}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Run Code
                </button>
              </div>
            </div>

            <textarea
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="w-full h-44 p-2.5 rounded bg-slate-950 font-mono text-xs text-cyan-200 border border-cyan-900/70 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              placeholder="Write or test code here..."
            />

            {/* Output Console */}
            <div className="mt-3 flex-1 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Execution Output (कंसोल आउटपुट):
              </span>
              <pre className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 flex-1 min-h-[70px] overflow-x-auto whitespace-pre-wrap select-text">
                {outputConsole || '// Click "Run Code" to compile and execute output'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
