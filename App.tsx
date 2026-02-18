import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  Brain,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

// --- ВНУТРЕННИЕ КОМПОНЕНТЫ ---

const LoadingIndicator: React.FC = () => {
  const messages = [
    "Настраиваем внутренний фокус...",
    "Ищем саногенные паттерны...",
    "Снижаем уровень напряжения...",
    "Консультируемся с теорией Орлова...",
    "Трансформируем реакцию в осознание..."
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 animate-in fade-in duration-500">
      <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin shadow-[0_0_15px_rgba(20,184,166,0.3)]"></div>
      <p className="mt-8 text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse text-center">
        {messages[idx]}
      </p>
    </div>
  );
};

// --- ГЛАВНОЕ ПРИЛОЖЕНИЕ ---

enum AppState { IDLE, LOADING, SUCCESS, ERROR }
enum AppTab { ANALYSIS = 'РАЗБОР', JOURNAL = 'ЭМОЦИИ', METAPHOR = 'ПРИТЧА' }

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ANALYSIS);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);

  const apiKey = process.env.API_KEY;
  const isKeyReady = apiKey && apiKey !== "undefined" && apiKey.length > 10;

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isKeyReady) {
      setAppState(AppState.ERROR);
      setError("Критическая ошибка: API_KEY не найден. Проверьте настройки Environment Variables.");
      return;
    }

    setAppState(AppState.LOADING);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const promptMapping = {
        [AppTab.ANALYSIS]: `Ты эксперт по саногенному мышлению Орлова. Проведи глубокий разбор мысли: "${input}". Выяви патогенные циклы и дай технику "саногенного щита". Ответ строго в JSON.`,
        [AppTab.JOURNAL]: `Дай саногенный совет по угашению эмоции или ситуации: "${input}". Ответ строго в JSON.`,
        [AppTab.METAPHOR]: `Создай терапевтическую притчу для осознания ситуации: "${input}". Ответ строго в JSON.`
      };

      const schemaMapping = {
        [AppTab.ANALYSIS]: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            shield: { type: Type.STRING },
            newThought: { type: Type.STRING }
          },
          required: ["analysis", "shield", "newThought"]
        },
        [AppTab.JOURNAL]: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            reflection: { type: Type.STRING }
          },
          required: ["advice", "reflection"]
        },
        [AppTab.METAPHOR]: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING },
            title: { type: Type.STRING }
          },
          required: ["story", "title"]
        }
      };

      const response = await ai.models.generateContent({
        // Используем СТАБИЛЬНУЮ модель gemini-flash-latest вместо Preview
        model: 'gemini-flash-latest',
        contents: promptMapping[activeTab],
        config: {
          responseMimeType: "application/json",
          responseSchema: schemaMapping[activeTab]
        }
      });

      const textOutput = response.text;
      if (!textOutput) throw new Error("Модель вернула пустой ответ.");
      
      setResult(JSON.parse(textOutput));
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setAppState(AppState.ERROR);
      
      const errorMsg = err.message || "";
      if (errorMsg.includes('location is not supported')) {
        setError("Ваш регион временно не поддерживается API Google Gemini. Попробуйте использовать VPN или сменить локацию.");
      } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setError("Превышен лимит запросов. Пожалуйста, подождите 1-2 минуты.");
      } else {
        setError(errorMsg || "Ошибка соединения с нейросетью.");
      }
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-teal-500/30 font-sans tracking-tight">
      <header className="py-8 px-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={reset}>
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Sanogenic Lab</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${isKeyReady ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`} />
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 {isKeyReady ? 'Flash Stable Module' : 'System Offline'}
               </p>
            </div>
          </div>
        </div>
        
        <nav className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
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

      <main className="max-w-4xl mx-auto px-6 py-16">
        {appState === AppState.IDLE && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.9]">
                {activeTab === AppTab.ANALYSIS && 'Чистый разум'}
                {activeTab === AppTab.JOURNAL && 'Мир в душе'}
                {activeTab === AppTab.METAPHOR && 'Свет истины'}
              </h2>
              <p className="text-slate-500 font-medium uppercase tracking-[0.4em] text-[10px]">Метод Юрия Михайловича Орлова</p>
            </div>
            
            <form onSubmit={handleRun} className="bg-slate-900/30 border border-white/5 p-10 rounded-[3rem] shadow-3xl backdrop-blur-2xl space-y-8">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTab === AppTab.ANALYSIS ? "Какая мысль причиняет вам боль?" : "Опишите ситуацию или чувство..."}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8 text-xl text-white outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[180px] transition-all placeholder:text-slate-700"
              />
              <button 
                type="submit" 
                className="w-full py-8 bg-white text-slate-950 font-black rounded-[2.5rem] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm shadow-2xl group"
              >
                Создать {activeTab === AppTab.METAPHOR ? 'притчу' : 'разбор'} <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        )}

        {appState === AppState.LOADING && <LoadingIndicator />}

        {appState === AppState.SUCCESS && result && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-teal-500" />
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Анализ завершен</h3>
               </div>
               <button onClick={reset} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                 <RefreshCw className="w-4 h-4" /> Новый цикл
               </button>
             </div>

             {activeTab === AppTab.ANALYSIS ? (
               <div className="grid gap-6 text-left">
                 <div className="bg-slate-900/60 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
                    <h4 className="text-[10px] font-black text-teal-500 uppercase mb-8 tracking-[0.4em]">Деконструкция патогенности</h4>
                    <p className="text-2xl text-slate-200 font-serif leading-relaxed italic">{result.analysis}</p>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                      <Zap className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
                      <h4 className="text-[10px] font-black uppercase mb-4 tracking-widest opacity-80">Саногенный щит</h4>
                      <p className="text-lg font-medium leading-relaxed">{result.shield}</p>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[3rem] border border-teal-500/30 shadow-xl">
                      <h4 className="text-[10px] font-black text-teal-500 uppercase mb-4 tracking-widest">Новая установка</h4>
                      <p className="text-xl font-black text-white leading-tight">«{result.newThought}»</p>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="bg-slate-900/60 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl max-w-3xl mx-auto text-center">
                 {result.title && <h3 className="text-teal-500 font-black uppercase tracking-widest mb-6">{result.title}</h3>}
                 <p className="text-2xl text-slate-200 font-serif leading-relaxed italic whitespace-pre-line">
                   {result.advice || result.story || result.reflection || "Нет данных."}
                 </p>
               </div>
             )}
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-[3rem] text-center space-y-6 animate-in shake duration-500">
             {error?.includes('регион') ? <Globe className="w-16 h-16 text-red-500 mx-auto opacity-50" /> : <AlertCircle className="w-16 h-16 text-red-500 mx-auto opacity-50" />}
             <div className="space-y-2">
                <h3 className="text-white font-black uppercase tracking-widest">Проблема доступа</h3>
                <p className="text-red-400 text-sm font-medium leading-relaxed max-w-md mx-auto">{error}</p>
             </div>
             <button onClick={reset} className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-transform">Вернуться назад</button>
          </div>
        )}
      </main>

      <footer className="py-12 text-center text-slate-600">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Sanogenic Lab © 2025</p>
      </footer>
    </div>
  );
};

export default App;
