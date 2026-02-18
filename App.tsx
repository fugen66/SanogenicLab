
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  ArrowPathIcon 
} from './components/icons';
import LoadingIndicator from './components/LoadingIndicator';
import { analyzeSanogenic, generateEmotionAdvice, generateMetaphor } from './services/geminiService';
import { AppState, AppTab, PsychologicalInsight, EmotionEntry, MetaphorResult } from './types';

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
    let currentInput = '';
    if (activeTab === AppTab.ANALYSIS) currentInput = thoughtInput;
    if (activeTab === AppTab.JOURNAL) currentInput = emotionInput;
    if (activeTab === AppTab.METAPHOR) currentInput = metaphorInput;

    if (!currentInput.trim()) {
      setError('Пожалуйста, заполните поле ввода.');
      return;
    }

    setAppState(AppState.LOADING);
    setError(null);
    try {
      if (activeTab === AppTab.ANALYSIS) {
        const res = await analyzeSanogenic(currentInput);
        setInsight(res);
      } else if (activeTab === AppTab.JOURNAL) {
        const res = await generateEmotionAdvice(currentInput, intensity, context);
        setEmotionResult(res);
      } else if (activeTab === AppTab.METAPHOR) {
        const res = await generateMetaphor(currentInput);
        setMetaphorResult(res);
      }
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error("Ошибка при вызове ИИ:", err);
      if (err.message === "API_KEY_MISSING") {
        setError('Критическая ошибка: API_KEY не найден в настройках Vercel. Убедитесь, что вы создали переменную API_KEY и сделали Redeploy.');
      } else {
        setError('Не удалось связаться с ИИ. Проверьте правильность ключа (должен начинаться на AIza) и наличие лимитов в Google AI Studio.');
      }
      setAppState(AppState.ERROR);
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
      <header className="py-6 px-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <SparklesIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none text-left">Sanogenic Lab</h1>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-[0.3em] mt-1 text-left">Основано на трудах Ю.М. Орлова</p>
          </div>
        </div>
        
        <nav className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          {Object.values(AppTab).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); reset(); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${activeTab === tab ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === AppTab.ANALYSIS ? 'Анализ' : tab === AppTab.JOURNAL ? 'Дневник' : 'Метафора'}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 py-12">
        {appState === AppState.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter max-w-4xl mx-auto leading-[1.1]">
                {activeTab === AppTab.ANALYSIS && 'Освободите свой ум от патогенных мыслей'}
                {activeTab === AppTab.JOURNAL && 'Встретьтесь со своими чувствами прямо сейчас'}
                {activeTab === AppTab.METAPHOR && 'Позвольте подсознанию найти решение'}
              </h2>
              <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
                Персональный ассистент по умственной гигиене и саногенному мышлению.
              </p>
            </div>

            <form onSubmit={handleRun} className="bg-slate-900/30 border border-white/5 p-10 rounded-[3.5rem] shadow-3xl space-y-10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] -z-10" />
              
              <div className="space-y-4">
                <label className="text-xs font-black text-teal-500 uppercase tracking-[0.3em] ml-2 block text-left">
                  {activeTab === AppTab.ANALYSIS && 'Опишите мысль, которая вызывает обиду или вину'}
                  {activeTab === AppTab.JOURNAL && 'Что вы чувствуете?'}
                  {activeTab === AppTab.METAPHOR && 'Опишите вашу проблему или ситуацию'}
                </label>
                
                {activeTab === AppTab.ANALYSIS && (
                  <textarea value={thoughtInput} onChange={(e) => setThoughtInput(e.target.value)} placeholder="Напр. «Я обижен на сына, потому что он забыл про мой праздник...»" className="w-full bg-slate-950/40 border border-slate-800 rounded-[2rem] p-8 text-2xl text-white focus:ring-4 focus:ring-teal-500/20 transition-all min-h-[220px] outline-none placeholder:text-slate-800" />
                )}
                
                {activeTab === AppTab.JOURNAL && (
                  <div className="space-y-8">
                    <input value={emotionInput} onChange={(e) => setEmotionInput(e.target.value)} placeholder="Название эмоции..." className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-2xl text-white outline-none focus:ring-2 focus:ring-teal-500/20" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between mb-4 tracking-widest">Интенсивность <span>{intensity}/10</span></label>
                        <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                      </div>
                      <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="Что вызвало это чувство?" className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl p-6 text-white outline-none" />
                    </div>
                  </div>
                )}

                {activeTab === AppTab.METAPHOR && (
                  <textarea value={metaphorInput} onChange={(e) => setMetaphorInput(e.target.value)} placeholder="Опишите ситуацию..." className="w-full bg-slate-950/40 border border-slate-800 rounded-[2rem] p-8 text-2xl text-white min-h-[220px] outline-none" />
                )}
              </div>

              <button type="submit" className="w-full py-8 bg-white text-slate-950 font-black rounded-[2rem] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm shadow-2xl">
                Запустить процесс осознания <ArrowRightIcon className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="py-24">
            <LoadingIndicator />
          </div>
        )}

        {appState === AppState.SUCCESS && (
          <div className="animate-in fade-in zoom-in-95 duration-700 space-y-10">
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
               <h3 className="text-xl font-black text-white uppercase tracking-wider">Результат анализа</h3>
               <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-teal-500 hover:text-white transition-colors uppercase"><ArrowPathIcon className="w-4 h-4" /> Новый запрос</button>
            </div>

            {insight && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl text-left">
                    <h4 className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-8">Саногенный разбор</h4>
                    <p className="text-slate-200 leading-relaxed text-2xl font-serif italic whitespace-pre-line">{insight.analysis}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-12 rounded-[3rem] shadow-2xl text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Саногенный Щит (Защита)</h4>
                    <p className="text-xl font-medium leading-relaxed">{insight.shieldTechnique}</p>
                  </div>
                </div>
                <div className="space-y-8 text-left">
                   <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Переформулировка</h4>
                      <p className="text-xl font-black text-teal-400 leading-tight">«{insight.reframedThought}»</p>
                   </div>
                   <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Вирусы мышления</h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.distortions.map(d => <span key={d} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase">{d}</span>)}
                      </div>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-teal-500 uppercase mb-4 tracking-widest">Практика</h4>
                      <p className="text-sm text-slate-400">{insight.suggestedAction}</p>
                   </div>
                </div>
              </div>
            )}

            {emotionResult && (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl max-w-3xl mx-auto text-left">
                <h4 className="text-4xl font-black text-white uppercase mb-6">{emotionResult.emotion}</h4>
                <p className="text-2xl text-slate-300 italic font-serif leading-relaxed mb-8">"{emotionResult.reflection}"</p>
                <div className="p-8 bg-slate-950 rounded-2xl border border-teal-500/20">
                   <h5 className="text-[10px] font-black text-teal-500 uppercase mb-2">Саногенный совет:</h5>
                   <p className="text-slate-300">{emotionResult.advice}</p>
                </div>
              </div>
            )}

            {metaphorResult && (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl max-w-2xl mx-auto text-left">
                <h4 className="text-3xl font-black text-white mb-6 text-center tracking-tighter uppercase">{metaphorResult.title}</h4>
                <div className="text-lg text-slate-300 font-serif leading-relaxed italic mb-8 space-y-4">
                  {metaphorResult.story.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <p className="text-center font-bold text-teal-500 text-xl">«{metaphorResult.moral}»</p>
              </div>
            )}
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="text-center py-20 bg-red-500/5 border border-red-500/20 rounded-[3rem] p-10">
             <div className="text-red-500 mb-6 font-bold text-xl">{error}</div>
             <div className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
               Если это не помогло, попробуйте удалить переменную API_KEY в Vercel и создать её заново, внимательно проверив имя.
             </div>
             <button onClick={reset} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold uppercase text-xs transition-all">Вернуться назад</button>
          </div>
        )}
      </main>

      <footer className="py-16 text-center border-t border-slate-800/50 mt-12 bg-slate-950/50">
         <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.8em] mb-4">Mind Hygiene Protocol v2.1</p>
         <p className="text-slate-700 text-[10px] max-w-sm mx-auto font-medium leading-relaxed">
            Инструмент для самостоятельного размышления на основе принципов Ю.М. Орлова.
         </p>
      </footer>
    </div>
  );
};

export default App;
