
import { SavedWord, UserDocument } from '../types';

const getDocsKey = (userEmail: string) => `docs_${userEmail}`;
const getWordBankKey = (userEmail: string) => `wordbank_${userEmail}`;

// Document Functions
export const getDocuments = (userEmail: string): UserDocument[] => {
    try {
        const key = getDocsKey(userEmail);
        const docsJson = localStorage.getItem(key);
        return docsJson ? JSON.parse(docsJson) : [];
    } catch (error) {
        console.error("Failed to get documents:", error);
        return [];
    }
};

export const saveDocument = (userEmail: string, doc: Omit<UserDocument, 'id' | 'lastOpened'>): UserDocument => {
    const docs = getDocuments(userEmail);
    const newDoc: UserDocument = {
        ...doc,
        id: crypto.randomUUID(),
        lastOpened: Date.now()
    };
    const updatedDocs = [newDoc, ...docs];
    localStorage.setItem(getDocsKey(userEmail), JSON.stringify(updatedDocs));
    return newDoc;
};

export const updateDocumentProgress = (userEmail: string, docId: string, scrollPosition: number) => {
    const docs = getDocuments(userEmail);
    const updatedDocs = docs.map(d => 
        d.id === docId ? { ...d, scrollPosition, lastOpened: Date.now() } : d
    );
    localStorage.setItem(getDocsKey(userEmail), JSON.stringify(updatedDocs));
};

export const deleteDocument = (userEmail: string, docId: string) => {
    const docs = getDocuments(userEmail);
    const updatedDocs = docs.filter(d => d.id !== docId);
    localStorage.setItem(getDocsKey(userEmail), JSON.stringify(updatedDocs));
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

export const saveWordToBank = (userEmail: string, word: Omit<SavedWord, 'timestamp'>): SavedWord[] => {
    const currentBank = getWordBank(userEmail);
    const isDuplicate = currentBank.some(w => 
        w.text.toLowerCase() === word.text.toLowerCase() && 
        w.targetLang === word.targetLang
    );
    
    if (!isDuplicate) {
        const newWord = { ...word, timestamp: Date.now() };
        const updatedBank = [newWord, ...currentBank];
        localStorage.setItem(getWordBankKey(userEmail), JSON.stringify(updatedBank));
        return updatedBank;
    }
    return currentBank;
};

export const removeWordFromBank = (userEmail: string, text: string, targetLang: string): SavedWord[] => {
    const currentBank = getWordBank(userEmail);
    const updatedBank = currentBank.filter(w => 
        !(w.text.toLowerCase() === text.toLowerCase() && w.targetLang === targetLang)
    );
    localStorage.setItem(getWordBankKey(userEmail), JSON.stringify(updatedBank));
    return updatedBank;
};
