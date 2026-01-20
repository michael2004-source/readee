
interface DictionaryAPIResponse {
    word: string;
    phonetic?: string;
    phonetics: {
        text: string;
        audio?: string;
    }[];
    origin?: string;
    meanings: {
        partOfSpeech: string;
        definitions: {
            definition: string;
            example?: string;
            synonyms: string[];
            antonyms: string[];
        }[];
    }[];
}

export const getDefinition = async (word: string, language: string): Promise<string> => {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`);

        if (!response.ok) {
            if (response.status === 404) {
                return `No definition found for "${word}" in the selected language.`;
            }
            throw new Error(`Failed to fetch definition. Status: ${response.status}`);
        }

        const data: DictionaryAPIResponse[] = await response.json();

        if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
            const firstMeaning = data[0].meanings[0];
            if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                return `(${firstMeaning.partOfSpeech}) ${firstMeaning.definitions[0].definition}`;
            }
        }

        return `No definition found for "${word}" in the selected language.`;

    } catch (error) {
        console.error("Error fetching definition from Dictionary API:", error);
        throw new Error("Could not fetch definition. Please check your connection.");
    }
};
