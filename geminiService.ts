import { GoogleGenAI, Type } from '@google/genai';
import { PsychologicalInsight, EmotionEntry, MetaphorResult } from '../types';

/**
 * Инициализация ИИ. 
 * Используем process.env.API_KEY, который Vercel автоматически подставляет из настроек.
 */
const getAi = () => {
  const rawKey = process.env.API_KEY;
  if (!rawKey) {
    throw new Error("API_KEY_MISSING");
  }
  // Очищаем ключ от случайных пробелов или переносов строк
  const apiKey = rawKey.trim();
  return new GoogleGenAI({ apiKey });
};

export const analyzeSanogenic = async (thought: string): Promise<PsychologicalInsight> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Ты — эксперт по Саногенному Мышлению (школа Ю.М. Орлова). 
    Проведи глубокий разбор мысли. Выяви патогенные циклы (обида, вина, стыд). 
    Обязательно добавь раздел "Саногенный Щит" — конкретную технику ментальной защиты (угашения) от этой эмоции.
    
    Мысль пользователя: "${thought}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalThought: { type: Type.STRING },
          distortions: { type: Type.ARRAY, items: { type: Type.STRING } },
          analysis: { type: Type.STRING, description: "Разбор механизма эмоции" },
          reframedThought: { type: Type.STRING, description: "Саногенная установка" },
          suggestedAction: { type: Type.STRING, description: "Упражнение" },
          shieldTechnique: { type: Type.STRING, description: "Психологическая защита" }
        },
        required: ["originalThought", "distortions", "analysis", "reframedThought", "suggestedAction", "shieldTechnique"]
      }
    }
  });
  
  if (!response.text) throw new Error("EMPTY_RESPONSE");
  return JSON.parse(response.text);
};

export const generateEmotionAdvice = async (emotion: string, intensity: number, context: string): Promise<EmotionEntry> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Пользователь проживает эмоцию: ${emotion} (${intensity}/10). Ситуация: ${context}. 
    Дай краткий саногенный совет по угашению этой эмоции в стиле Ю.М. Орлова.`,
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
  if (!response.text) throw new Error("EMPTY_RESPONSE");
  return JSON.parse(response.text);
};

export const generateMetaphor = async (problem: string): Promise<MetaphorResult> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Сочини терапевтическую притчу для человека с проблемой: "${problem}". 
    Метафора должна способствовать инсайту и принятию реальности.`,
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
  if (!response.text) throw new Error("EMPTY_RESPONSE");
  return JSON.parse(response.text);
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Expand and improve this psychological thought for analysis: "${prompt}"`,
  });
  return response.text || prompt;
};
