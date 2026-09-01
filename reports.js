import { protectPage, logoutUser } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

protectPage();

// Sidebar & Logout
document.getElementById('menuBtn').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  logoutUser();
};
document.getElementById('userEmail').textContent = localStorage.getItem('userEmail') || '';

// Load Inventory Report
async function loadInventoryReport() {
  const snap = await getDocs(collection(db, "inventory"));
  const invBody = document.getElementById('invReportBody');
  const lowBody = document.getElementById('lowStockBody');
  invBody.innerHTML = "";
  lowBody.innerHTML = "";

  snap.forEach(d => {
    const i = d.data();
    const qty = parseInt(i.quantity) || 0;
    const price = parseFloat(i.price) || 0;
    const value = qty * price;

    // Full inventory row
    invBody.innerHTML += `
      <tr>
        <td>${i.model}</td>
        <td>${i.brand}</td>
        <td>${i.year}</td>
        <td>${i.color}</td>
        <td>${qty}</td>
        <td>₱${price.toLocaleString()}</td>
        <td>₱${value.toLocaleString()}</td>
      </tr>`;

    // Low stock row
    if (qty <= 5) {
      lowBody.innerHTML += `
        <tr style="background:#fee2e2;">
          <td>${i.model}</td>
          <td>${qty}</td>
          <td>₱${price.toLocaleString()}</td>
        </tr>`;
    }
  });

  if (!lowBody.innerHTML) {
    lowBody.innerHTML = `<tr><td colspan="3" style="color:green;">✅ All items have sufficient stock</td></tr>`;
  }
}

// Load Sales Summary
async function loadSalesSummary() {
  const snap = await getDocs(collection(db, "sales"));
  let totalCount = 0;
  let totalRevenue = 0;

  snap.forEach(d => {
    const s = d.data();
    totalCount++;
    totalRevenue += parseFloat(s.total) || 0;
  });

  document.getElementById('totalSalesCount').textContent = totalCount;
  document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();
}
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
  }
};

// Load all reports
loadInventoryReport();
loadSalesSummary();