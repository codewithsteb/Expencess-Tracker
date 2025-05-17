import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADKFPZQcaD_gvU0Z3uLrzNY7DnuoDdoLg",
  authDomain: "expensetracker-90bf7.firebaseapp.com",
  projectId: "expensetracker-90bf7",
  storageBucket: "expensetracker-90bf7.firebasestorage.app",
  messagingSenderId: "384479125596",
  appId: "1:384479125596:web:e7a3cfea9d3cd580960699",
  measurementId: "G-PMY3BTYX16"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);  // <-- explicitly pass app here
