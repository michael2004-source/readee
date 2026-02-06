
import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp,
    orderBy,
    query,
    where
} from "firebase/firestore";
import { db } from "./firebase.ts";
import { SavedWord, UserDocument } from '../types.ts';

const getDocsCollection = (userId: string) => collection(db, 'users', userId, 'documents');
const getWordBankCollection = (userId: string) => collection(db, 'users', userId, 'wordbank');

// Document Functions
export const getDocuments = async (userId: string): Promise<UserDocument[]> => {
    try {
        const docsCollection = getDocsCollection(userId);
        const q = query(docsCollection, orderBy('lastOpened', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDocument));
    } catch (error) {
        console.error("Failed to get documents:", error);
        return [];
    }
};

export const saveDocument = async (userId: string, docData: Omit<UserDocument, 'id' | 'lastOpened'>): Promise<UserDocument> => {
    const newDocRef = doc(getDocsCollection(userId));
    const newDoc: Omit<UserDocument, 'id'> = {
        ...docData,
        lastOpened: Date.now()
    };
    await setDoc(newDocRef, newDoc);
    return { ...newDoc, id: newDocRef.id };
};

export const updateDocumentProgress = async (userId: string, docId: string, scrollPosition: number) => {
    const docRef = doc(getDocsCollection(userId), docId);
    await updateDoc(docRef, { scrollPosition, lastOpened: Date.now() });
};

export const deleteDocument = async (userId: string, docId: string) => {
    const docRef = doc(getDocsCollection(userId), docId);
    await deleteDoc(docRef);
};

// Word Bank Functions
export const getWordBank = async (userId: string): Promise<SavedWord[]> => {
    try {
        const wordBankCollection = getWordBankCollection(userId);
        const q = query(wordBankCollection, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as SavedWord);
    } catch (error) {
        console.error("Failed to get word bank:", error);
        return [];
    }
};

export const saveWordToBank = async (userId: string, word: Omit<SavedWord, 'timestamp'>): Promise<SavedWord[]> => {
    const wordBankCollection = getWordBankCollection(userId);
    // Use text and targetLang as a unique identifier for the word
    const docId = `${word.text.toLowerCase()}_${word.targetLang}`;
    const wordRef = doc(wordBankCollection, docId);

    const newWord = { ...word, timestamp: Date.now() };
    await setDoc(wordRef, newWord, { merge: true }); // Use set with merge to create or update
    
    return getWordBank(userId);
};

export const removeWordFromBank = async (userId: string, text: string, targetLang: string): Promise<SavedWord[]> => {
    const docId = `${text.toLowerCase()}_${targetLang}`;
    const wordRef = doc(getWordBankCollection(userId), docId);
    await deleteDoc(wordRef);
    return getWordBank(userId);
};
