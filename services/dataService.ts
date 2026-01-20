
// Manages saving and loading user-specific data to localStorage.
import { SavedWord } from '../types';

export interface UserProgress {
    fileName: string;
    fileContent: string;
    scrollPosition: number;
}

const getProgressKey = (userEmail: string) => `progress_${userEmail}`;
const getWordBankKey = (userEmail: string) => `wordbank_${userEmail}`;

export const saveProgress = (userEmail: string, progress: UserProgress) => {
    try {
        const key = getProgressKey(userEmail);
        localStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
        console.error("Failed to save progress:", error);
    }
};

export const loadProgress = (userEmail: string): UserProgress | null => {
    try {
        const key = getProgressKey(userEmail);
        const progressJson = localStorage.getItem(key);
        if (progressJson) {
            return JSON.parse(progressJson) as UserProgress;
        }
        return null;
    } catch (error) {
        console.error("Failed to load progress:", error);
        return null;
    }
};

export const clearProgress = (userEmail: string) => {
    try {
        const key = getProgressKey(userEmail);
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Failed to clear progress:", error);
    }
};

// Word Bank Functions
export const getWordBank = (userEmail: string): SavedWord[] => {
    try {
        const key = getWordBankKey(userEmail);
        const bankJson = localStorage.getItem(key);
        return bankJson ? JSON.parse(bankJson) : [];
    } catch (error) {
        console.error("Failed to get word bank:", error);
        return [];
    }
};

export const saveWordToBank = (userEmail: string, word: SavedWord): SavedWord[] => {
    try {
        const currentBank = getWordBank(userEmail);
        const isDuplicate = currentBank.some(w => w.text.toLowerCase() === word.text.toLowerCase());
        
        if (!isDuplicate) {
            const updatedBank = [...currentBank, word];
            const key = getWordBankKey(userEmail);
            localStorage.setItem(key, JSON.stringify(updatedBank));
            return updatedBank;
        }
        return currentBank;
    } catch (error) {
        console.error("Failed to save word to bank:", error);
        return getWordBank(userEmail);
    }
};

export const removeWordFromBank = (userEmail: string, text: string): SavedWord[] => {
     try {
        const currentBank = getWordBank(userEmail);
        const updatedBank = currentBank.filter(w => w.text.toLowerCase() !== text.toLowerCase());
        const key = getWordBankKey(userEmail);
        localStorage.setItem(key, JSON.stringify(updatedBank));
        return updatedBank;
    } catch (error) {
        console.error("Failed to remove word from bank:", error);
        return getWordBank(userEmail);
    }
};
