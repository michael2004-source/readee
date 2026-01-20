
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getDefinition = async (word: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Define the word "${word}" in a clear and concise way for someone learning new vocabulary.`,
        });

        if (response.text) {
            return response.text;
        } else {
            return "No definition found.";
        }
    } catch (error) {
        console.error("Error fetching definition from Gemini API:", error);
        throw new Error("Could not fetch definition. Please check your API key and connection.");
    }
};
