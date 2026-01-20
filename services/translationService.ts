
interface MyMemoryResponse {
    responseData: {
        translatedText: string;
    };
    responseStatus: number;
    responseDetails?: string;
}

export const getTranslation = async (text: string, sourceLang: string, targetLang:string): Promise<string> => {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch translation. Status: ${response.status}`);
        }

        const data: MyMemoryResponse = await response.json();

        if (data.responseStatus === 200 && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            const errorDetails = data.responseDetails || "Unknown error";
            if (errorDetails.includes("INVALID LANGUAGE PAIR")) {
                return `Translation from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()} is not supported.`;
            }
            return "Translation not found.";
        }

    } catch (error) {
        console.error("Error fetching translation:", error);
        throw new Error("Could not fetch translation. Please check your connection.");
    }
};