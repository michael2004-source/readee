
import { GoogleGenAI } from "@google/genai";

export const getTranslation = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
  
  const prompt = `Translate the following word or phrase from ${sourceLang} to ${targetLang}. 
  Provide only the translation or a very brief definition if it's an idiom.
  
  Text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.1, // Keep it precise
      }
    });

    return response.text || "No translation found.";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return "Error fetching translation.";
  }
};
