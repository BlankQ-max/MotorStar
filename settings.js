import { protectPage, logoutUser } from './auth.js';
import { auth } from './firebase-config.js';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

protectPage();

// Sidebar & Logout
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  logoutUser();
};

// Show logged-in email
const userEmail = localStorage.getItem('userEmail') || '';
document.getElementById('userEmail').textContent = userEmail;
document.getElementById('currentEmail').textContent = userEmail;

// Change Password Handler
document.getElementById('passwordForm').addEventListener('submit', async e => {
  e.preventDefault();
  const currentPass = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  const alertBox = document.getElementById('alertBox');

  // Clear previous messages
  alertBox.innerHTML = '';

  // Validation
  if (newPass.length < 6) {
    alertBox.innerHTML = `<div class="alert error">New password must be at least 6 characters</div>`;
    return;
  }
  if (newPass !== confirmPass) {
    alertBox.innerHTML = `<div class="alert error">New passwords do not match</div>`;
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    // Re-authenticate before changing password (required by Firebase)
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPass);

    alertBox.innerHTML = `<div class="alert success">✅ Password updated successfully!</div>`;
    document.getElementById('passwordForm').reset();

  } catch (err) {
    let msg = "Failed to update password";
    if (err.code === 'auth/wrong-password') msg = "❌ Current password is incorrect";
    else if (err.code === 'auth/weak-password') msg = "❌ Password must be at least 6 characters";
    else if (err.code === 'auth/requires-recent-login') msg = "❌ Please logout and login again before changing password";
    
    alertBox.innerHTML = `<div class="alert error">${msg}</div>`;
  }
});

document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
  }
};