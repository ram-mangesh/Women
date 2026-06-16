import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0MoswnhDMb8c_VdA7bLrdcunELR09kxU",
  authDomain: "women-safety-3842b.firebaseapp.com",
  projectId: "women-safety-3842b",
  storageBucket: "women-safety-3842b.firebasestorage.app",
  messagingSenderId: "192245461189",
  appId: "1:192245461189:web:0baa69764b964a018140ac",
  measurementId: "G-9Z10TCPT46"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
