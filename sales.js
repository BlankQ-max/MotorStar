import { protectPage, logoutUser } from './auth.js';
import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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

let inventoryList = [];
let selectedDocId = null;

// Load models into dropdown
async function loadModels() {
  const snap = await getDocs(collection(db, "inventory"));
  const select = document.getElementById('modelSelect');
  select.innerHTML = `<option value="">-- Select Model --</option>`;
  inventoryList = [];

  snap.forEach(d => {
    const item = { id: d.id, ...d.data() };
    inventoryList.push(item);
    select.innerHTML += `<option value="${d.id}">${item.model} — ₱${parseFloat(item.price).toLocaleString()} (Stock: ${item.quantity})</option>`;
  });
}

// When model selected → auto-fill price
document.getElementById('modelSelect').addEventListener('change', () => {
  selectedDocId = null;
  const id = document.getElementById('modelSelect').value;
  if (!id) {
    document.getElementById('unitPrice').value = '';
    document.getElementById('totalAmount').value = '';
    return;
  }
  const item = inventoryList.find(i => i.id === id);
  if (item) {
    selectedDocId = id;
    document.getElementById('unitPrice').value = item.price;
    calculateTotal();
  }
});

// Calculate total when quantity changes
document.getElementById('qtySold').addEventListener('input', calculateTotal);
function calculateTotal() {
  const price = parseFloat(document.getElementById('unitPrice').value) || 0;
  const qty = parseInt(document.getElementById('qtySold').value) || 0;
  document.getElementById('totalAmount').value = (price * qty).toFixed(2);
}

// Save sale & deduct stock
document.getElementById('salesForm').addEventListener('submit', async e => {
  e.preventDefault();
  if (!selectedDocId) return alert("Please select a model");

  const qty = parseInt(document.getElementById('qtySold').value);
  const item = inventoryList.find(i => i.id === selectedDocId);

  if (qty > item.quantity) {
    return alert(`Not enough stock! Only ${item.quantity} available.`);
  }

  // Save sale record
  await addDoc(collection(db, "sales"), {
    model: item.model,
    quantity: qty,
    total: parseFloat(document.getElementById('totalAmount').value),
    date: new Date().toISOString()
  });

  // Deduct stock from inventory
  const newQty = item.quantity - qty;
  await updateDoc(doc(db, "inventory", selectedDocId), { quantity: newQty });

  alert("✅ Sale recorded! Stock updated.");
  document.getElementById('salesForm').reset();
  loadModels();
  loadSalesHistory();
});

// Load sales history
async function loadSalesHistory() {
  const snap = await getDocs(collection(db, "sales"));
  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = "";

  snap.forEach(d => {
    const s = d.data();
    const date = new Date(s.date).toLocaleString();
    tbody.innerHTML += `
      <tr>
        <td>${date}</td>
        <td>${s.model}</td>
        <td>${s.quantity}</td>
        <td>₱${parseFloat(s.total).toLocaleString()}</td>
      </tr>`;
  });
}
document.getElementById('logoutLink').onclick = e => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutUser();
  }
};
// Init
loadModels();
loadSalesHistory();