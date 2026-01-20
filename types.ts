
export interface PopoverState {
  word: string | null;
  definition: string | null;
  isLoading: boolean;
  position: {
    top: number;
    left: number;
  } | null;
}
