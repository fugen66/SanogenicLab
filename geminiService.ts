
import { GoogleGenAI, Type } from '@google/genai';
import { PsychologicalInsight, EmotionEntry, MetaphorResult } from '../types';

export const enhancePrompt = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Улучши следующий запрос для генерации изображения: "${prompt}". Только текст.`,
  });
  return response.text || prompt;
};

export const analyzeSanogenic = async (thought: string): Promise<PsychologicalInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Разбери мысль по саногенному мышлению Орлова: "${thought}". JSON.`,
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
  return JSON.parse(response.text || '{}');
};

export const generateEmotionAdvice = async (emotion: string, intensity: number, context: string): Promise<EmotionEntry> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Саногенный совет для: ${emotion}. JSON.`,
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
  return JSON.parse(response.text || '{}');
};

export const generateMetaphor = async (problem: string): Promise<MetaphorResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Притча для: "${problem}". JSON.`,
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
  return JSON.parse(response.text || '{}');
};
