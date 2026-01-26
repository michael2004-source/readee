
interface MyMemoryResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
  responseDetails?: string;
}

/**
 * Fetches translation from MyMemory API.
 * This service does not require an API key for basic public usage.
 */
export const getTranslation = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch translation. Status: ${response.status}`);
    }

    const data: MyMemoryResponse = await response.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else {
      const errorDetails = data.responseDetails || "Unknown error";
      if (errorDetails.includes("INVALID LANGUAGE PAIR")) {
        return `Translation from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()} is not supported by this provider.`;
      }
      return "Translation not found.";
    }
  } catch (error) {
    console.error("MyMemory Translation Error:", error);
    return "Error fetching translation. Please try again later.";
  }
};
