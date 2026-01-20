
// Manages saving and loading user-specific data to localStorage.

export interface UserProgress {
    fileName: string;
    fileContent: string;
    scrollPosition: number;
}

const getProgressKey = (userEmail: string) => `progress_${userEmail}`;

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
