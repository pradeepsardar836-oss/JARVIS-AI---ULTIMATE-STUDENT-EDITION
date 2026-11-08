import React, { useState } from 'react';
import { QuizData, QuizQuestion } from '../types/jarvis';
import { 
  GraduationCap, BookOpen, Calculator, Award, 
  Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Lightbulb, FileText, HelpCircle, ShieldCheck
} from 'lucide-react';

interface StudentModeProps {
  onAskJarvis: (query: string, studentClass: string, subject: string) => void;
  isLoading?: boolean;
}

export const StudentMode: React.FC<StudentModeProps> = ({ onAskJarvis, isLoading = false }) => {
  const [selectedClass, setSelectedClass] = useState<string>('10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Science (विज्ञान)');
  const [activeSubTab, setActiveSubTab] = useState<'solver' | 'quiz' | 'formulas' | 'notes'>('solver');
  const [problemInput, setProblemInput] = useState<string>('');

  // Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Pre-loaded high-yield NCERT formula cheat sheets
  const formulaSheets: Record<string, { topic: string; formulas: { name: string; formula: string; explanation: string }[] }> = {
    'Science (विज्ञान)': {
      topic: 'Class 10 & 11 Physics & Chemistry Key Formulas',
      formulas: [
        { name: 'Ohm’s Law (ओम का नियम)', formula: 'V = I × R', explanation: 'विभवान्तर (V) धारा (I) और प्रतिरोध (R) के गुणनफल के बराबर होता है।' },
        { name: 'Mirror Formula (दर्पण सूत्र)', formula: '1/f = 1/v + 1/u', explanation: 'f = फोकस दूरी, v = प्रतिबिम्ब दूरी, u = वस्तु दूरी।' },
        { name: 'Lens Power (लेंस की क्षमता)', formula: 'P = 1/f (in meters)', explanation: 'लेंस की क्षमता डायोप्टर (D) में मापी जाती है।' },
        { name: 'Kinetic Energy (गतिज ऊर्जा)', formula: 'K.E = ½ m v²', explanation: 'm = द्रव्यमान, v = वेग।' },
        { name: 'Newton’s 2nd Law (गति का दूसरा नियम)', formula: 'F = m × a', explanation: 'बल = द्रव्यमान × त्वरण।' },
        { name: 'Universal Gravitation (गुरुत्वाकर्षण)', formula: 'F = G (m₁ m₂) / r²', explanation: 'G = सार्वत्रिक गुरुत्वाकर्षण नियतांक।' },
      ],
    },
    'Mathematics (गणित)': {
      topic: 'Essential Algebra & Geometry Formulas',
      formulas: [
        { name: 'Quadratic Formula (द्विघात सूत्र)', formula: 'x = [-b ± √(b² - 4ac)] / 2a', explanation: 'द्विघात समीकरण ax² + bx + c = 0 के मूल ज्ञात करने का सूत्र।' },
        { name: 'Trigonometry Identity 1', formula: 'sin²θ + cos²θ = 1', explanation: 'त्रिकोणमिति की मूलभूत सर्वसमिका।' },
        { name: 'Distance Formula (दूरी सूत्र)', formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]', explanation: 'कार्तीय तल पर दो बिंदुओं के बीच की दूरी।' },
        { name: 'Arithmetic Progression (समांतर श्रेणी)', formula: 'aₙ = a + (n - 1)d', explanation: 'n-वाँ पद ज्ञात करने का सूत्र। d = सार्व अंतर।' },
        { name: 'Circle Area & Circumference', formula: 'A = πr², C = 2πr', explanation: 'वृत्त का क्षेत्रफल एवं परिधि।' },
      ],
    },
    'Social Science (सामाजिक विज्ञान)': {
      topic: 'Key Historical Timelines & Constitutional Facts',
      formulas: [
        { name: '1857 का प्रथम स्वतंत्रता संग्राम', formula: 'मेरठ से आरंभ', explanation: 'मंगल पांडे का बलिदान, 1857 की क्रांति का बीज।' },
        { name: 'भारतीय संविधान लागू', formula: '26 जनवरी 1950', explanation: 'डॉ. बी. आर. अम्बेडकर की अध्यक्षता में प्रारूप तैयार हुआ।' },
        { name: 'जलियांवाला बाग हत्याकांड', formula: '13 अप्रैल 1919', explanation: 'अमृतसर में जनरल डायर द्वारा निहत्थे लोगों पर गोलीबारी।' },
        { name: 'दांडी मार्च (नमक सत्याग्रह)', formula: '12 मार्च 1930', explanation: 'महात्मा गांधी जी द्वारा साबरमती से दांडी तक यात्रा।' },
      ],
    },
  };

  const handleStartQuiz = async () => {
    setIsQuizLoading(true);
    setQuizFinished(false);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);

    try {
      const res = await fetch('/api/jarvis/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentClass: selectedClass,
          subject: selectedSubject,
          topic: `${selectedSubject} for Class ${selectedClass}`,
        }),
      });
      const data = await res.json();
      setQuizData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (index: number) => {
    if (selectedAnswer !== null || !quizData) return;
    setSelectedAnswer(index);

    const currentQ = quizData.questions[currentQIndex];
    if (index === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!quizData) return;
    if (currentQIndex + 1 < quizData.questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowHint(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemInput.trim()) return;
    onAskJarvis(
      `Class ${selectedClass} ${selectedSubject} प्रश्न: ${problemInput}. कृपया इसे चरण-दर-चरण (Step-by-Step) आसान हिंदी में हल करें और महत्वपूर्ण सूत्र बताएं।`,
      selectedClass,
      selectedSubject
    );
  };

  return (
    <div className="w-full bg-slate-950/80 rounded-xl border border-cyan-500/30 p-5 shadow-2xl backdrop-blur-md flex flex-col space-y-5">
      {/* Header and Class Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/50 shadow-inner">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-lg text-cyan-200 tracking-wide flex items-center gap-2">
              STUDENT MODE – NCERT & EXAM LAB
            </h2>
            <p className="text-xs text-slate-400 font-chakra">
              Class 6 to 12 CBSE & State Board Learning Companion in Hindi
            </p>
          </div>
        </div>

        {/* Class Selection Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-cyan-500/40">
          <span className="text-xs text-cyan-400/80 font-chakra px-2">कक्षा (Class):</span>
          {['6', '7', '8', '9', '10', '11', '12'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`w-7 h-7 text-xs rounded font-orbitron font-bold transition-all ${
                selectedClass === cls
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-cyan-300 hover:bg-cyan-950'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Selector & Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['Science (विज्ञान)', 'Mathematics (गणित)', 'Social Science (सामाजिक विज्ञान)', 'English Language', 'Hindi Literature'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-md text-xs font-chakra font-medium transition-colors ${
                selectedSubject === sub
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-200 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-300 bg-slate-900/50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Feature Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-cyan-500/30">
          <button
            onClick={() => setActiveSubTab('solver')}
            className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-all ${
              activeSubTab === 'solver' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Step-by-Step Solver
          </button>
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-all ${
              activeSubTab === 'quiz' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Interactive Quiz
          </button>
          <button
            onClick={() => setActiveSubTab('formulas')}
            className={`px-3 py-1 text-xs rounded flex items-center gap-1.5 transition-all ${
              activeSubTab === 'formulas' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Formula Bank
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Step-by-Step Solver */}
      {activeSubTab === 'solver' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
            <h3 className="text-sm font-orbitron font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              गणित व विज्ञान समस्या समाधान (Step-by-Step Solver)
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              कोई भी समीकरण, प्रश्न या सिद्धांत लिखें। JARVIS आपको सिर्फ उत्तर नहीं देगा, बल्कि <strong>"कदम-दर-कदम (Step-by-Step)"</strong> हल और याद रखने का तरीका सिखाएगा।
            </p>

            <form onSubmit={handleProblemSubmit} className="flex gap-2">
              <input
                type="text"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="उदा: '2x² + 5x - 3 = 0 के मूल ज्ञात करें' या 'प्रकाश का परावर्तन समझाएं'..."
                className="flex-1 bg-slate-900 border border-cyan-500/40 rounded-lg px-4 py-2.5 text-xs text-cyan-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-md shadow-cyan-500/30 shrink-0"
              >
                <span>हल करें (Solve)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Problem Prompt Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: 'द्विघात समीकरण हल',
                desc: 'x² - 7x + 12 = 0 के गुणनखंड व सूत्र विधि',
                q: 'Class 10 गणित: x² - 7x + 12 = 0 को दोनों विधियों (गुणनखंड और द्विघात सूत्र) से हल करें।',
              },
              {
                title: 'ओम का नियम व सत्यापन',
                desc: 'V = IR प्रयोग, परिपथ आरेख एवं गणना',
                q: 'Class 10 विज्ञान: ओम का नियम क्या है? इसका सत्यापन और संख्यात्मक उदाहरण चरणबद्ध बताएं।',
              },
              {
                title: 'त्रिकोणमिति सर्वसमिकाएं',
                desc: 'sin, cos, tan के मान और सिद्ध करने वाले सवाल',
                q: 'Class 10 त्रिकोणमिति: सिद्ध करें (sin θ / (1 + cos θ)) + ((1 + cos θ) / sin θ) = 2 cosec θ',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => onAskJarvis(item.q, selectedClass, selectedSubject)}
                className="p-3 rounded-lg bg-slate-900/60 border border-cyan-900/50 hover:border-cyan-400/60 cursor-pointer transition-all hover:bg-cyan-950/30 group"
              >
                <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 mb-1">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Interactive Quiz Arena */}
      {activeSubTab === 'quiz' && (
        <div className="p-4 rounded-lg bg-slate-900/80 border border-cyan-500/30 min-h-[300px] flex flex-col justify-center">
          {!quizData ? (
            <div className="text-center py-8 space-y-4">
              <Award className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
              <h3 className="font-orbitron text-base font-bold text-cyan-200">
                CLASS {selectedClass} {selectedSubject.toUpperCase()} QUIZ ARENA
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                अपनी परीक्षा की तैयारी परखें। JARVIS आपके लिए NCERT आधारित 5 महत्वपूर्ण प्रश्न तैयार करेगा।
              </p>
              <button
                onClick={handleStartQuiz}
                disabled={isQuizLoading}
                className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/30"
              >
                {isQuizLoading ? 'क्विज़ तैयार हो रहा है...' : 'Start 5-Question Quiz'}
              </button>
            </div>
          ) : quizFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-block p-4 rounded-full bg-cyan-950 border border-cyan-400">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-cyan-100">QUIZ COMPLETED!</h3>
              <p className="text-sm text-cyan-300">
                आपका स्कोर: <span className="text-emerald-400 font-bold text-xl">{score}</span> / {quizData.questions.length}
              </p>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                {score === quizData.questions.length
                  ? 'अद्भुत प्रदर्शन! आपने सभी प्रश्नों के सही उत्तर दिए हैं। JARVIS आपको शाबाशी देता है!'
                  : 'अच्छा प्रयास! स्पष्टीकरण को ध्यान से पढ़ें और दोबारा अभ्यास करें।'}
              </p>
              <button
                onClick={handleStartQuiz}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" /> दोबारा क्विज़ लें (Restart)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quiz Header & Progress */}
              <div className="flex items-center justify-between text-xs text-cyan-400 border-b border-cyan-500/20 pb-2">
                <span className="font-orbitron font-semibold">
                  प्रश्न {currentQIndex + 1} / {quizData.questions.length}
                </span>
                <span className="font-mono">स्कोर: {score}</span>
              </div>

              {/* Question Text */}
              <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-500/30">
                <h4 className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {quizData.questions[currentQIndex].question}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {quizData.questions[currentQIndex].options.map((opt, oIdx) => {
                  const isSelected = selectedAnswer === oIdx;
                  const isCorrect = oIdx === quizData.questions[currentQIndex].correctIndex;
                  const answered = selectedAnswer !== null;

                  let btnStyle = 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-cyan-500/60';
                  if (answered) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'border-rose-500 bg-rose-950/70 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={answered}
                      onClick={() => handleSelectQuizOption(oIdx)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Hint & Explanation */}
              {selectedAnswer !== null && (
                <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40 text-xs text-slate-200 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    विस्तृत स्पष्टीकरण (Step-by-Step Explanation):
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {quizData.questions[currentQIndex].explanation}
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-between items-center pt-2">
                {quizData.questions[currentQIndex].hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> {showHint ? quizData.questions[currentQIndex].hint : 'संकेत देखें (Hint)'}
                  </button>
                )}

                {selectedAnswer !== null && (
                  <button
                    onClick={handleNextQuizQuestion}
                    className="ml-auto px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/30"
                  >
                    <span>अगला प्रश्न (Next)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: Formula & Concept Bank */}
      {activeSubTab === 'formulas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-xs font-bold text-cyan-300">
              {formulaSheets[selectedSubject]?.topic || `${selectedSubject} - मुख्य सूत्र और सिद्धांत`}
            </h3>
            <span className="text-[11px] text-slate-400">NCERT Class {selectedClass} Aligned</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(formulaSheets[selectedSubject]?.formulas || formulaSheets['Science (विज्ञान)'].formulas).map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-cyan-200">{f.name}</span>
                  <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40">
                    {f.formula}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{f.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
