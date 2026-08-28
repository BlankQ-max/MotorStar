import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Login function
export async function loginUser(email, password) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('userEmail', userCred.user.email);
    window.location.href = 'dashboard.html';
    return { success: true };
  } catch (err) {
    let msg = "Login failed";
    if (err.code === 'auth/user-not-found') msg = "Account not found";
    else if (err.code === 'auth/wrong-password') msg = "Incorrect password";
    else if (err.code === 'auth/invalid-email') msg = "Invalid email format";
    return { success: false, message: msg };
  }
}

// Logout
export function logoutUser() {
  signOut(auth).then(() => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
}

// Route protection — call on EVERY protected page
export function protectPage() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'index.html'; // redirect if not logged in
    }
  });
}