import { protectPage, logoutUser } from './auth.js';

protectPage();

// Sidebar & Logout
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  logoutUser();
};

// Display logged-in user email
document.getElementById('userEmail').textContent = localStorage.getItem('userEmail') || '';

document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
  }
};