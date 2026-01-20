
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
}
