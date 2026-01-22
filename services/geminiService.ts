
import { GoogleGenAI } from "@google/genai";

export async function enhancePrompt(prompt: string, details: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a world-class marketing copywriter. 
  Enhance the following AI image generation prompt to be more vivid, professional, and effective for a business advertisement. 
  Keep the context of the business details provided.`;
  
  const userPrompt = `
  Original Prompt: ${prompt}
  Business Details: ${JSON.stringify(details)}
  Enhanced Version:`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });
    return response.text || prompt;
  } catch (error) {
    console.error("Gemini Error:", error);
    return prompt;
  }
}
