import { GoogleGenAI, Type } from '@google/genai';
import { PsychologicalInsight, EmotionEntry, MetaphorResult } from '../types';

/**
 * Функция получения экземпляра AI.
 * Использует многоуровневый поиск ключа для совместимости с Vite/Vercel.
 */
const getAi = () => {
  // @ts-ignore
  const env = import.meta.env || {};
  
  // Приоритет отдается системному process.env.API_KEY, 
  // но также проверяется VITE_API_KEY как резервный канал для Vite
  const apiKey = process.env.API_KEY || env.VITE_API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "PLACEHOLDER_KEY") {
    throw new Error("API_KEY_MISSING_OR_INVALID");
  }
  
  return new GoogleGenAI({ apiKey });
};

// Проведение саногенного анализа мысли по методике Ю.М. Орлова
export const analyzeSanogenic = async (thought: string): Promise<PsychologicalInsight> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Ты — эксперт по Саногенному Мышлению (школа Ю.М. Орлова). 
    Проведи глубокий разбор мысли. Выяви патогенные циклы (обида, вина, стыд). 
    Обязательно добавь раздел "Саногенный Щит" — конкретную технику ментальной защиты (угашения) от этой эмоции.
    Верни ответ строго в формате JSON.
    
    Мысль пользователя: "${thought}"`,
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
  
  return JSON.parse(response.text);
};

// Генерация саногенного совета по конкретной эмоции
export const generateEmotionAdvice = async (emotion: string, intensity: number, context: string): Promise<EmotionEntry> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Пользователь проживает эмоцию: ${emotion} (${intensity}/10). Контекст: ${context}. 
    Дай краткий саногенный совет по угашению этой эмоции. Верни JSON.`,
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
  return JSON.parse(response.text);
};

// Создание терапевтической притчи для осознания проблемы
export const generateMetaphor = async (problem: string): Promise<MetaphorResult> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Сочини терапевтическую притчу для проблемы: "${problem}". Верни JSON.`,
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
  return JSON.parse(response.text);
};

// Улучшение промпта
export const enhancePrompt = async (prompt: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Enhance this prompt: ${prompt}`,
  });
  return response.text?.trim() || prompt;
};
