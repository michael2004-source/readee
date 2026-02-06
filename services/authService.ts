
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
    User
} from "firebase/auth";
import { app } from "./firebase.ts";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
        .catch((error) => {
            console.error("Authentication error:", error);
            // Handle specific errors if needed
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Could not sign in: ${errorMessage} (${errorCode})`);
        });
};

export const signOutUser = () => {
    signOut(auth);
};

export { onAuthStateChanged, type User };
