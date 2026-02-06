import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDLRcyfUZX9opbQf7g3nYfdOQUkKcjj8lk",
    authDomain: "adaptive-social-network.firebaseapp.com",
    projectId: "adaptive-social-network",
    storageBucket: "adaptive-social-network.firebasestorage.app",
    messagingSenderId: "656155214745",
    appId: "1:656155214745:web:68a024df2b1b1ddcba8908"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
