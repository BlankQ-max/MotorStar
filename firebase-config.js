// ===== PASTE YOUR FIREBASE CONFIG HERE =====
const firebaseConfig = {
    apiKey: "AIzaSyA99RHna9KfTEJ39OuCcFMYpaJxrdxLSgM",
    authDomain: "motorstar-inventory.firebaseapp.com",
    projectId: "motorstar-inventory",
    storageBucket: "motorstar-inventory.firebasestorage.app",
    messagingSenderId: "551484672732",
    appId: "1:551484672732:web:c3467cb117c52be8d4c219",
    measurementId: "G-4PJSN9QPXN"
};
// ===========================================

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
const app = initializeApp(firebaseConfig);

// Export services for use in other files
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

export const auth = getAuth(app);
export const db = getFirestore(app);