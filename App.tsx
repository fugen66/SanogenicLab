import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  KeyRound,
  Brain,
  Info
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

// --- ТИПЫ ДАННЫХ ---
enum AppState { IDLE, LOADING, SUCCESS, ERROR }
enum AppTab { ANALYSIS = 'РАЗБОР', JOURNAL = 'ЭМОЦИИ', METAPHOR = 'ПРИТЧА' }

interface PsychologicalInsight {
  originalThought: string;
  distortions: string[];
  analysis: string;
  reframedThought: string;
  suggestedAction: string;
  shieldTechnique: string;
}

interface EmotionEntry {
  emotion: string;
  intensity: number;
  reflection: string;
  advice: string;
}

interface MetaphorResult {
  title: string;
  story: string;
  moral: string;
}

// --- КОМПОНЕНТЫ ИНТЕРФЕЙСА ---
const LoadingIndicator: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "Настраиваем внутренний фокус...",
    "Ищем саногенные паттерны...",
    "Снижаем патогенное напряжение...",
    "Разбираем когнитивные узлы...",
    "Трансформируем реакцию в осознание..."
  ];

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(p => (p + 1) % messages.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 animate-pulse text-center">
      <div className="relative w-16 h-16 mb-8 mx-auto">
        <div className="absolute inset-0 border-4 border-teal-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-teal-400 font-bold uppercase tracking-widest text-xs">{messages[msgIdx]}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ANALYSIS);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const [thoughtInput, setThoughtInput] = useState('');
  const [emotionInput, setEmotionInput] = useState('');
  const [metaphorInput, setMetaphorInput] = useState('');
  const [context, setContext] = useState('');
  const [intensity, setIntensity] = useState(5);

  const [insight, setInsight] = useState<PsychologicalInsight | null>(null);
  const [emotionResult, setEmotionResult] = useState<EmotionEntry | null>(null);
  const [metaphorResult, setMetaphorResult] = useState<MetaphorResult | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка наличия ключа перед запуском
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      setAppState(AppState.ERROR);
      setError('Ключ API_KEY не найден. Добавьте его в Environment Variables на Vercel и сделайте Redeploy.');
      return;
    }

    let currentInput = '';
    if (activeTab === AppTab.ANALYSIS) currentInput = thoughtInput;
    if (activeTab === AppTab.JOURNAL) currentInput = emotionInput;
    if (activeTab === AppTab.METAPHOR) currentInput = metaphorInput;

    if (!currentInput.trim()) {
      setError('Введите текст для разбора.');
      return;
    }

    setAppState(AppState.LOADING);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      if (activeTab === AppTab.ANALYSIS) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Ты — эксперт по Саногенному Мышлению. Проведи глубокий разбор мысли. Выяви патогенные циклы. Добавь "Саногенный Щит". JSON формат. Мысль: "${currentInput}"`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                originalThought: { type: Type.STRING },
                distortions: { type: Type.ARRAY, items: { type: Type.STRING } },
                analysis: { type: Type.STRING },
                reframedThought: { type: Type.STRING },
                suggestedAction: { type: Type.STRING },
                shieldTechnique: { type: Type.STRING }
              },
              required: ["originalThought", "distortions", "analysis", "reframedThought", "suggestedAction", "shieldTechnique"]
            }
          }
        });
        setInsight(JSON.parse(response.text));
      } else if (activeTab === AppTab.JOURNAL) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Эмоция: ${emotionInput} (${intensity}/10). Контекст: ${context}. Дай совет по угашению. JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                emotion: { type: Type.STRING },
                intensity: { type: Type.NUMBER },
                reflection: { type: Type.STRING },
                advice: { type: Type.STRING }
              },
              required: ["emotion", "intensity", "reflection", "advice"]
            }
          }
        });
        setEmotionResult(JSON.parse(response.text));
      } else if (activeTab === AppTab.METAPHOR) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Сочини терапевтическую притчу для проблемы: "${currentInput}". JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                story: { type: Type.STRING },
                moral: { type: Type.STRING }
              },
              required: ["title", "story", "moral"]
            }
          }
        });
        setMetaphorResult(JSON.parse(response.text));
      }
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error("AI Error:", err);
      setAppState(AppState.ERROR);
      // Вывод более детальной ошибки для пользователя
      const errorMsg = err.message || '';
      if (errorMsg.includes('403')) {
        setError('Доступ запрещен (403). Проверьте, разрешен ли доступ к Gemini в вашем регионе или не истек ли лимит ключа.');
      } else if (errorMsg.includes('401')) {
        setError('Неверный API ключ (401). Проверьте правильность ключа в настройках Vercel.');
      } else {
        setError(`Ошибка ИИ: ${errorMsg || 'Неизвестная ошибка сервера'}`);
      }
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setError(null);
    setInsight(null);
    setEmotionResult(null);
    setMetaphorResult(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
      {/* Header */}
      <header className="py-6 px-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800/50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">Sanogenic Lab</h1>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-[0.3em] mt-1">Психотехнологии Ю.М. Орлова</p>
          </div>
        </div>
        
        <nav className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          {Object.values(AppTab).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); reset(); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${activeTab === tab ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12">
        {appState === AppState.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
            <h2 className="text-4xl md:text-7xl font-black text-white text-center tracking-tighter max-w-4xl mx-auto leading-tight">
              {activeTab === AppTab.ANALYSIS && 'Освободите разум от груза обид'}
              {activeTab === AppTab.JOURNAL && 'Распознайте свои истинные чувства'}
              {activeTab === AppTab.METAPHOR && 'Получите ответ через мудрость притчи'}
            </h2>

            <form onSubmit={handleRun} className="bg-slate-900/30 border border-white/5 p-10 rounded-[3.5rem] shadow-3xl space-y-10 backdrop-blur-xl">
              <div className="space-y-4 text-left">
                <label className="text-xs font-black text-teal-500 uppercase tracking-[0.3em] block ml-2">
                  {activeTab === AppTab.ANALYSIS && 'Опишите ситуацию для анализа'}
                  {activeTab === AppTab.JOURNAL && 'Какую эмоцию вы проживаете?'}
                  {activeTab === AppTab.METAPHOR && 'На какой вопрос нужен ответ?'}
                </label>
                
                {activeTab === AppTab.ANALYSIS && (
                  <textarea value={thoughtInput} onChange={(e) => setThoughtInput(e.target.value)} placeholder="Пример: Я чувствую обиду на друга, потому что..." className="w-full bg-slate-950/40 border border-slate-800 rounded-[2rem] p-8 text-2xl text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[200px]" />
                )}
                
                {activeTab === AppTab.JOURNAL && (
                  <div className="space-y-8">
                    <input value={emotionInput} onChange={(e) => setEmotionInput(e.target.value)} placeholder="Гнев, зависть, тревога..." className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-2xl text-white outline-none" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between mb-4 tracking-widest">Сила <span>{intensity}/10</span></label>
                        <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-teal-500" />
                      </div>
                      <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="В чем причина?" className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-white outline-none" />
                    </div>
                  </div>
                )}

                {activeTab === AppTab.METAPHOR && (
                  <textarea value={metaphorInput} onChange={(e) => setMetaphorInput(e.target.value)} placeholder="Опишите проблему или дилемму..." className="w-full bg-slate-950/40 border border-slate-800 rounded-[2rem] p-8 text-2xl text-white outline-none min-h-[200px]" />
                )}
              </div>

              <button type="submit" className="w-full py-8 bg-white text-slate-950 font-black rounded-[2rem] hover:scale-[1.01] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm shadow-2xl">
                Начать разбор <ArrowRight className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}

        {appState === AppState.LOADING && <LoadingIndicator />}

        {appState === AppState.SUCCESS && (
          <div className="animate-in fade-in zoom-in-95 duration-700 space-y-10 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
               <h3 className="text-xl font-black text-white uppercase tracking-wider">Разбор завершен</h3>
               <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-teal-500 hover:text-white transition-colors uppercase"><RefreshCw className="w-4 h-4" /> Новый запрос</button>
            </div>

            {insight && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl">
                    <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-8">Психологический механизм</h4>
                    <p className="text-slate-200 leading-relaxed text-2xl font-serif italic whitespace-pre-line">{insight.analysis}</p>
                  </div>
                  <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-12 rounded-[3rem] shadow-2xl">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Саногенный Щит</h4>
                    <p className="text-xl font-medium leading-relaxed">{insight.shieldTechnique}</p>
                  </div>
                </div>
                <div className="space-y-8">
                   <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Новая установка</h4>
                      <p className="text-xl font-black text-teal-400">«{insight.reframedThought}»</p>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Патогенные циклы</h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.distortions.map(d => <span key={d} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase">{d}</span>)}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {emotionResult && (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl max-w-3xl mx-auto text-center">
                <h4 className="text-5xl font-black text-white uppercase mb-6">{emotionResult.emotion}</h4>
                <p className="text-2xl text-slate-300 italic font-serif leading-relaxed mb-10">"{emotionResult.reflection}"</p>
                <div className="p-10 bg-slate-950 rounded-[2.5rem] border border-teal-500/20 text-left">
                   <h5 className="text-[10px] font-black text-teal-500 uppercase mb-4">Путь к угашению:</h5>
                   <p className="text-slate-300 leading-relaxed">{emotionResult.advice}</p>
                </div>
              </div>
            )}

            {metaphorResult && (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl max-w-2xl mx-auto text-center">
                <h4 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">{metaphorResult.title}</h4>
                <div className="text-lg text-slate-300 font-serif leading-relaxed italic mb-10 text-left whitespace-pre-line">
                  {metaphorResult.story}
                </div>
                <div className="pt-8 border-t border-slate-800">
                  <p className="font-bold text-teal-400 text-2xl tracking-tight">«{metaphorResult.moral}»</p>
                </div>
              </div>
            )}
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="text-center py-20 bg-slate-900/50 border border-red-500/20 rounded-[3rem] p-10 max-w-2xl mx-auto">
             <KeyRound className="w-16 h-16 text-red-500 opacity-50 mx-auto mb-6" />
             <div className="text-white mb-8 font-bold text-xl">{error}</div>
             <button onClick={reset} className="px-12 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black uppercase text-xs transition-all shadow-xl">Попробовать снова</button>
          </div>
        )}
      </main>

      <footer className="py-12 text-center opacity-30">
         <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sanogenic Lab © 2025</p>
      </footer>
    </div>
  );
};

export default App;
