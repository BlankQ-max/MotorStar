import { protectPage, logoutUser } from './js/auth.js';
import { db } from './js/firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

protectPage(); // Block unauthenticated users

// Mobile menu toggle
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};
document.getElementById('logoutLink').onclick = (e) => {
  e.preventDefault();
  logoutUser();
};
document.getElementById('userEmail').textContent = localStorage.getItem('userEmail') || '';

// Load dashboard stats
async function loadStats() {
  const invSnap = await getDocs(collection(db, "inventory"));
  let totalQty = 0, lowCount = 0;
  invSnap.forEach(doc => {
    const d = doc.data();
    totalQty += parseInt(d.quantity) || 0;
    if (parseInt(d.quantity) <= 5) lowCount++;
  });

  const salesSnap = await getDocs(collection(db, "sales"));
  let totalSales = 0;
  salesSnap.forEach(doc => {
    totalSales += parseFloat(doc.data().total) || 0;
  });

  document.getElementById('totalModels').textContent = invSnap.size;
  document.getElementById('totalStock').textContent = totalQty;
  document.getElementById('lowStock').textContent = lowCount;
  document.getElementById('totalSales').textContent = `₱${totalSales.toLocaleString()}`;
}
loadStats();