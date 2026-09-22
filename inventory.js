import { protectPage, logoutUser } from './auth.js';
import { db } from './firebase-config.js';
import { logActivity } from './dashboard.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

protectPage();

// ==========================================
// 🔐 CONFIGURE YOUR SECRET CODE HERE
// ==========================================
const SECRET_CODE = "MotorStar2026"; // ✅ CHANGE THIS TO YOUR OWN CODE!

// Mobile menu & logout
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

// Show/Hide Form
window.showForm = () => {
  document.getElementById('invForm').classList.remove('hidden');
  document.getElementById('formTitle').textContent = "Add Motorcycle";
  document.getElementById('motorcycleForm').reset();
  document.getElementById('docId').value = "";
};

window.hideForm = () => {
  document.getElementById('invForm').classList.add('hidden');
};

// Load & render inventory
async function renderInventory() {
  const snap = await getDocs(collection(db, "inventory"));
  const tbody = document.getElementById('invTableBody');
  tbody.innerHTML = "";
  snap.forEach(d => {
    const data = d.data();
    tbody.innerHTML += `
      <tr>
        <td>${data.model}</td>
        <td>${data.brand}</td>
        <td>${data.year}</td>
        <td>${data.color}</td>
        <td>${data.quantity}</td>
        <td>₱${parseFloat(data.price).toLocaleString()}</td>
        <td>
          <button class="sm" onclick="editItem('${d.id}')">Edit</button>
          <button class="sm danger" onclick="deleteItem('${d.id}')">Del</button>
        </td>
      </tr>`;
  });
}

// Save (Add or Update) — WITH SECRET CODE CHECK
document.getElementById('motorcycleForm').addEventListener('submit', async e => {
  e.preventDefault();

  // 🔐 VERIFY SECRET CODE FIRST
  const enteredCode = document.getElementById('secretCode').value.trim();
  if (enteredCode !== SECRET_CODE) {
    alert("❌ Invalid Secret Code! Access Denied.");
    document.getElementById('secretCode').value = "";
    document.getElementById('secretCode').focus();
    return; // STOP — does NOT save!
  }

  // ✅ Code Correct → Proceed to Save
  const data = {
    model: document.getElementById('model').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    year: parseInt(document.getElementById('year').value),
    color: document.getElementById('color').value.trim(),
    quantity: parseInt(document.getElementById('quantity').value),
    price: parseFloat(document.getElementById('price').value)
  };
  const docId = document.getElementById('docId').value;

  if (docId) {
    await updateDoc(doc(db, "inventory", docId), data);
    await logActivity('✏️ Updated', `${data.model} — ${data.quantity} units`);
  } else {
    await addDoc(collection(db, "inventory"), data);
    await logActivity('➕ Added', `${data.model} — ${data.quantity} units`);
  }

  alert("✅ Saved Successfully!");
  hideForm();
  renderInventory();
});

// Edit — CLEARS SECRET CODE
window.editItem = async id => {
  const snap = await getDocs(collection(db, "inventory"));
  const item = snap.docs.find(d => d.id === id);
  if (item) {
    const d = item.data();
    document.getElementById('docId').value = id;
    document.getElementById('model').value = d.model;
    document.getElementById('brand').value = d.brand;
    document.getElementById('year').value = d.year;
    document.getElementById('color').value = d.color;
    document.getElementById('quantity').value = d.quantity;
    document.getElementById('price').value = d.price;
    document.getElementById('formTitle').textContent = "Edit Motorcycle";
    document.getElementById('invForm').classList.remove('hidden');
    document.getElementById('secretCode').value = ""; // Force re-enter code
    document.getElementById('secretCode').focus();
  }
};

// Delete
window.deleteItem = async id => {
  if (confirm("Delete this record?")) {
    await deleteDoc(doc(db, "inventory", id));
    await logActivity('🗑️ Deleted', 'Item removed from inventory');
    renderInventory();
  }
};

// Load on open
renderInventory();