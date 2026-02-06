
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace this with your own Firebase configuration
// You can get this from your Firebase project settings
const firebaseConfig = {
  apiKey: process.env.API_KEY, // Standard variable for API keys
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
