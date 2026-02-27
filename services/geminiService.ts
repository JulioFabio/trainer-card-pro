
import { GoogleGenAI } from "@google/genai";

// Always use named parameter for apiKey and rely on process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

import { Stats } from '../types';

export const generateConceptSuggestion = async (stats: Stats): Promise<string> => {
  try {
    const prompt = `Based on these RPG stats (Health: ${stats.saude}, Attack: ${stats.ataque}, Defense: ${stats.defesa}, Sp. Attack: ${stats.atqEspecial}, Sp. Def: ${stats.defEspecial}, Speed: ${stats.velocidade}), suggest a unique character concept for a Pokemon-style trainer in Portuguese. Respond only with the concept name and a very short description (max 15 words). Example: "Domador de Dragões: Especialista em criaturas de escamas e fogo."`;
    
    // Always use ai.models.generateContent directly with model name and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access the .text property directly, do not call as a method
    return response.text || "Treinador Novato: Em busca de sua primeira aventura.";
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "Mestre de Ginásio: Um desafiante nato.";
  }
};
