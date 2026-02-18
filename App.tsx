import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  KeyRound,
  Brain,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2
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

const LoadingIndicator: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = ["Настраиваем фокус...", "Ищем паттерны...", "Снижаем напряжение...", "Разбираем когнитивные узлы..."];
  useEffect(() => {
    const id = setInterval(() => setMsgIdx(p => (p + 1) % messages.length), 2000);
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
  const [showDiag, setShowDiag] = useState(false);

  const [thoughtInput, setThoughtInput] = useState('');
  const [emotionInput, setEmotionInput] = useState('');
  const [metaphorInput, setMetaphorInput] = useState('');
  const [intensity, setIntensity] = useState(5);

  const [insight, setInsight] = useState<PsychologicalInsight | null>(null);
  const [emotionResult, setEmotionResult] = useState<any | null>(null);
  const [metaphorResult, setMetaphorResult] = useState<any | null>(null);

  // Пытаемся найти ключ везде, где он может быть в Vite/Vercel
  const getApiKey = () => {
    // @ts-ignore
    const env = import.meta.env || {};
    return (process.env.API_KEY || env.VITE_API_KEY || "").trim();
  };

  const rawKey = getApiKey();

  const getMaskedKey = () => {
    if (!rawKey) return "КЛЮЧ ПУСТОЙ";
    if (rawKey === "PLACEHOLDER_KEY") return "PLACEHOLDER (ЗАГЛУШКА)";
    if (rawKey.length < 8) return rawKey;
    return `${rawKey.substring(0, 4)}...${rawKey.substring(rawKey.length - 4)}`;
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rawKey || rawKey === "undefined" || rawKey === "PLACEHOLDER_KEY") {
      setAppState(AppState.ERROR);
      setError(rawKey === "PLACEHOLDER_KEY" 
        ? "Обнаружена заглушка! Удалите файл .env из GitHub репозитория." 
        : "Критическая ошибка: Ключ API_KEY не обнаружен в системе.");
      return;
    }

    let currentInput = '';
    if (activeTab === AppTab.ANALYSIS) currentInput = thoughtInput;
    if (activeTab === AppTab.JOURNAL) currentInput = emotionInput;
    if (activeTab === AppTab.METAPHOR) currentInput = metaphorInput;

    if (!currentInput.trim()) return;

    setAppState(AppState.LOADING);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: rawKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: activeTab === AppTab.ANALYSIS 
          ? `Разбери ситуацию по Орлову. Мысль: "${currentInput}"`
          : activeTab === AppTab.JOURNAL
          ? `Эмоция: ${emotionInput} (${intensity}/10). Совет по угашению.`
          : `Притча для: "${currentInput}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: activeTab === AppTab.ANALYSIS ? {
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
          } : undefined
        }
      });

      const data = JSON.parse(response.text);
      if (activeTab === AppTab.ANALYSIS) setInsight(data);
      else if (activeTab === AppTab.JOURNAL) setEmotionResult(data);
      else setMetaphorResult(data);
      
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setError(`Ошибка API: ${err.message || 'Сбой соединения'}`);
    }
  };

  const reset = () => { setAppState(AppState.IDLE); setError(null); };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <header className="py-6 px-8 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800/50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={reset}>
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Brain className="w-7 h-7 text-white" /></div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase leading-none">Sanogenic Lab</h1>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">Орлов / Саногенное мышление</p>
          </div>
        </div>
        <nav className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          {Object.values(AppTab).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); reset(); }} className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase ${activeTab === tab ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {appState === AppState.IDLE && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-5xl md:text-7xl font-black text-white text-center italic tracking-tighter">
              {activeTab === AppTab.ANALYSIS && 'Трансформация обиды'}
              {activeTab === AppTab.JOURNAL && 'Дневник чувств'}
              {activeTab === AppTab.METAPHOR && 'Поиск смысла'}
            </h2>
            <form onSubmit={handleRun} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-8 backdrop-blur-xl">
              <textarea 
                value={activeTab === AppTab.ANALYSIS ? thoughtInput : activeTab === AppTab.JOURNAL ? emotionInput : metaphorInput}
                onChange={(e) => activeTab === AppTab.ANALYSIS ? setThoughtInput(e.target.value) : activeTab === AppTab.JOURNAL ? setEmotionInput(e.target.value) : setMetaphorInput(e.target.value)}
                placeholder="Опишите ваши мысли или чувства..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-6 text-xl text-white outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[150px]"
              />
              <button type="submit" className="w-full py-6 bg-white text-slate-950 font-black rounded-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl">
                Начать анализ <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {appState === AppState.LOADING && <LoadingIndicator />}

        {appState === AppState.SUCCESS && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <div className="flex justify-between items-center border-b border-slate-800 pb-4">
               <h3 className="text-sm font-black text-teal-500 uppercase tracking-widest">Результат готов</h3>
               <button onClick={reset} className="text-xs font-bold text-slate-500 hover:text-white uppercase flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Новый запрос</button>
             </div>
             {insight && (
               <div className="space-y-6">
                 <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest">Разбор ситуации</h4>
                    <p className="text-2xl text-slate-200 font-serif leading-relaxed italic">{insight.analysis}</p>
                 </div>
                 <div className="bg-teal-600 p-10 rounded-[2.5rem] text-white">
                    <h4 className="text-[10px] font-black uppercase mb-4 tracking-widest opacity-80">Саногенный Щит (Техника угашения)</h4>
                    <p className="text-xl font-medium leading-relaxed">{insight.shieldTechnique}</p>
                 </div>
                 <div className="p-8 bg-slate-950 border border-teal-500/30 rounded-3xl text-center">
                    <h4 className="text-[10px] font-black text-teal-500 uppercase mb-2">Новая установка</h4>
                    <p className="text-2xl font-black text-white">«{insight.reframedThought}»</p>
                 </div>
               </div>
             )}
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="bg-slate-900/80 border border-red-500/30 p-10 rounded-[2.5rem] space-y-8 text-center animate-in zoom-in-95">
             <AlertCircle className="w-12 h-12 text-red-500 mx-auto opacity-50" />
             <div className="text-white font-bold text-lg leading-relaxed">{error}</div>
             
             <div className="pt-6 space-y-6">
                <button onClick={() => setShowDiag(!showDiag)} className="text-[10px] font-black text-slate-500 hover:text-teal-400 uppercase tracking-widest flex items-center gap-2 mx-auto">
                   {showDiag ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   {showDiag ? 'Скрыть инструкцию' : 'Как это исправить? (Инструкция)'}
                </button>
                
                {showDiag && (
                  <div className="bg-black/60 p-8 rounded-3xl text-left font-sans space-y-6 border border-white/5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Статус ключа:</span>
                      <span className={`text-xs font-black uppercase ${rawKey ? 'text-teal-500' : 'text-red-500'}`}>{getMaskedKey()}</span>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-white font-black text-xs uppercase flex items-center gap-2 tracking-widest"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Шаг 1: Настройки Vercel</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Зайди в Vercel -> <b>Settings</b> -> <b>Environment Variables</b>. 
                        Убедись, что у тебя добавлены ДВЕ переменные с одинаковым ключом Gemini:
                        <br/><code className="text-teal-400 bg-teal-400/10 px-1">API_KEY</code> и <code className="text-teal-400 bg-teal-400/10 px-1">VITE_API_KEY</code>.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-white font-black text-xs uppercase flex items-center gap-2 tracking-widest"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Шаг 2: Пересборка</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        После сохранения переменных в Vercel, перейди во вкладку <b>Deployments</b>, 
                        нажми на три точки <code className="bg-slate-800 px-1">...</code> у последнего деплоя и выбери <b>Redeploy</b>. 
                        Без этого новые ключи не попадут в код!
                      </p>
                    </div>
                    
                    {rawKey === "PLACEHOLDER_KEY" && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-500 text-[10px] font-black uppercase mb-1 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Удалить файл .env</p>
                        <p className="text-[10px] text-slate-300">В твоем GitHub лежит файл .env, который мешает Vercel увидеть правильный ключ. Удали его из репозитория!</p>
                      </div>
                    )}
                  </div>
                )}
             </div>

             <button onClick={reset} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs hover:scale-[1.02] transition-transform shadow-xl">Попробовать еще раз</button>
          </div>
        )}
      </main>
    </div>
  );
};
export default App;
