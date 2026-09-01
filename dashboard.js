import { protectPage, logoutUser } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

protectPage();

document.getElementById('menuBtn').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  logoutUser();
};
document.getElementById('userEmail').textContent = localStorage.getItem('userEmail') || '';

async function loadStats() {
  const snap = await getDocs(collection(db, "inventory"));
  let totalQty = 0, lowCount = 0;
  snap.forEach(d => {
    const data = d.data();
    totalQty += parseInt(data.quantity) || 0;
    if (parseInt(data.quantity) <= 5) lowCount++;
  });

  document.getElementById('totalModels').textContent = snap.size;
  document.getElementById('totalStock').textContent = totalQty;
  document.getElementById('lowStock').textContent = lowCount;
}

document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
  }
};
loadStats();