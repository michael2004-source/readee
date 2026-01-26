
export interface PopoverState {
  text: string | null;
  translation: string | null;
  isLoading: boolean;
  position: {
    top: number;
    left: number;
  } | null;
}

export interface SavedWord {
  text: string;
  translation: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

export interface UserDocument {
  id: string;
  fileName: string;
  fileContent: string;
  scrollPosition: number;
  lastOpened: number;
  targetLanguage: string;
}

export type AppSection = 'reader' | 'wordbank' | 'trainer' | 'settings';
