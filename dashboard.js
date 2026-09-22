import { protectPage, logoutUser } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query, limit, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

protectPage();

// Sidebar & Logout
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
  }
};
document.getElementById('userEmail').textContent = localStorage.getItem('userEmail') || '';

// Load Dashboard Stats
async function loadStats() {
  const invSnap = await getDocs(collection(db, "inventory"));
  let totalQty = 0, lowCount = 0;
  invSnap.forEach(d => {
    const data = d.data();
    totalQty += parseInt(data.quantity) || 0;
    if (parseInt(data.quantity) <= 5) lowCount++;
  });

  document.getElementById('totalModels').textContent = invSnap.size;
  document.getElementById('totalStock').textContent = totalQty;
  document.getElementById('lowStock').textContent = lowCount;

  // Total Sales
  const salesSnap = await getDocs(collection(db, "sales"));
  let totalRev = 0;
  salesSnap.forEach(d => {
    const s = d.data();
    totalRev += parseFloat(s.total) || 0;
  });
  document.getElementById('totalSales').textContent = '₱' + totalRev.toLocaleString();
}

// Load Activity History
async function loadActivity() {
  const tbody = document.getElementById('activityBody');
  tbody.innerHTML = '';

  // Get recent sales
  const salesSnap = await getDocs(query(collection(db, "sales"), limit(10)));
  let activities = [];

  salesSnap.forEach(d => {
    const s = d.data();
    activities.push({
      time: s.date,
      action: '🛒 Sale',
      details: `${s.model} — ${s.quantity} units — ₱${parseFloat(s.total).toLocaleString()}`
    });
  });

  // Get recent inventory changes (from activity log collection)
  const actSnap = await getDocs(query(collection(db, "activity_log"), orderBy('timestamp', 'desc'), limit(15)));
  actSnap.forEach(d => {
    const a = d.data();
    activities.push({
      time: a.timestamp?.toDate() || new Date(),
      action: a.action,
      details: a.details
    });
  });

  // Sort by time, newest first
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  if (activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">No activity yet</td></tr>`;
    return;
  }

  // Show latest 10
  activities.slice(0, 10).forEach(act => {
    const time = new Date(act.time).toLocaleString();
    tbody.innerHTML += `
      <tr>
        <td style="font-size:0.9rem; color:#666;">${time}</td>
        <td><strong>${act.action}</strong></td>
        <td>${act.details}</td>
      </tr>`;
  });
}

// Helper: Log activity from other pages
export async function logActivity(action, details) {
  try {
    await addDoc(collection(db, "activity_log"), {
      action: action,
      details: details,
      user: localStorage.getItem('userEmail') || 'Unknown',
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.log("Activity log save skipped:", err);
  }
}

// Load everything
loadStats();
loadActivity();