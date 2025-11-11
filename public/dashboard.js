// ==========================
// USER LOGIN CHECK
// ==========================
const currentUser =
  localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
if (!currentUser) window.location.href = "index.html";

// Display username
const userNameEl = document.getElementById("userName");
if (userNameEl && currentUser) {
  userNameEl.textContent =
    currentUser.charAt(0).toUpperCase() + currentUser.slice(1);
}

// ==========================
// INITIAL EXPENSE DATA
// ==========================
let usersData = JSON.parse(localStorage.getItem("usersData")) || {
  mansehaj: [
    {
      date: "2025-11-01",
      detail: "Food Catering",
      merchant: "McFood",
      amount: 250,
      status: "not-submitted",
    },
    {
      date: "2025-11-02",
      detail: "Office Supplies",
      merchant: "Officio",
      amount: 150,
      status: "submitted",
    },
    {
      date: "2025-11-03",
      detail: "Hotel Stay",
      merchant: "StayInn",
      amount: 275,
      status: "submitted",
    },
  ],
  arjun: [
    {
      date: "2025-11-02",
      detail: "Travel Expenses",
      merchant: "Air India",
      amount: 450,
      status: "submitted",
    },
    {
      date: "2025-11-05",
      detail: "Lunch Meeting",
      merchant: "Cafe 21",
      amount: 80,
      status: "not-submitted",
    },
  ],
};

// ==========================
// SAVE FUNCTION
// ==========================
function saveData() {
  localStorage.setItem("usersData", JSON.stringify(usersData));
}

// ==========================
// TABLE + CHART RENDER FUNCTIONS
// ==========================
const tableBody = document.querySelector("#expenseTable tbody");
const ctx = document.getElementById("expenseChart");
let chart;

function loadExpenses() {
  const userExpenses = usersData[currentUser] || [];
  tableBody.innerHTML = "";

  if (userExpenses.length === 0) {
    tableBody.innerHTML = `
      <tr><td colspan="6" style="text-align:center; color:#9ca3af; padding:20px;">
        No expense records found.
      </td></tr>`;
  } else {
    userExpenses.forEach((exp, index) => {
      const statusText =
        exp.status === "submitted" ? "Submitted" : "Not Submitted";
      const statusClass =
        exp.status === "submitted" ? "status-submitted" : "status-pending";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exp.date}</td>
        <td>${exp.detail}</td>
        <td>${exp.merchant}</td>
        <td>€${exp.amount}</td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td>
          <button class="delete-btn" data-index="${index}" title="Delete Expense">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Add Delete Functionality
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        if (confirm("Are you sure you want to delete this expense?")) {
          usersData[currentUser].splice(index, 1);
          saveData();
          loadExpenses(); // refresh view
        }
      });
    });
  }

  updateChart(userExpenses);
  updateStats(userExpenses);
}

// ==========================
// CHART UPDATE
// ==========================
function updateChart(data) {
  if (!ctx) return;

  const categoryTotals = {};
  data.forEach((exp) => {
    if (!categoryTotals[exp.detail]) categoryTotals[exp.detail] = 0;
    categoryTotals[exp.detail] += exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#fb923c",
            "#3b82f6",
            "#22c55e",
            "#a855f7",
            "#f43f5e",
          ],
          borderColor: "#0a0f16",
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#f8fafc" },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// ==========================
// SUMMARY CARDS
// ==========================
function updateStats(expenses) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const submitted = expenses.filter((e) => e.status === "submitted").length;
  const pending = expenses.length - submitted;
  const avg = expenses.length ? total / expenses.length : 0;

  document.getElementById("totalSpent").textContent = `€${total}`;
  document.getElementById("submittedCount").textContent = submitted;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("avgSpent").textContent = `€${avg.toFixed(0)}`;
}

// ==========================
// ADD EXPENSE MODAL
// ==========================
const modal = document.getElementById("expenseModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close-btn");

if (openBtn && modal && closeBtn) {
  openBtn.onclick = () => (modal.style.display = "flex");
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };
}

const addExpenseForm = document.getElementById("addExpenseForm");
if (addExpenseForm) {
  addExpenseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newExp = {
      date: document.getElementById("expDate").value,
      detail: document.getElementById("expDetail").value,
      merchant: document.getElementById("expMerchant").value,
      amount: parseFloat(document.getElementById("expAmount").value),
      status: document.getElementById("expStatus").value,
    };

    if (!usersData[currentUser]) usersData[currentUser] = [];
    usersData[currentUser].push(newExp);
    saveData();

    modal.style.display = "none";
    e.target.reset();
    loadExpenses();
  });
}

// ==========================
// LOGOUT
// ==========================
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Create overlay
    const confirmOverlay = document.createElement("div");
    confirmOverlay.style.position = "fixed";
    confirmOverlay.style.top = 0;
    confirmOverlay.style.left = 0;
    confirmOverlay.style.width = "100%";
    confirmOverlay.style.height = "100%";
    confirmOverlay.style.background = "rgba(0,0,0,0.6)";
    confirmOverlay.style.display = "flex";
    confirmOverlay.style.justifyContent = "center";
    confirmOverlay.style.alignItems = "center";
    confirmOverlay.style.zIndex = "2000";
    confirmOverlay.style.opacity = "0";
    confirmOverlay.style.transition = "opacity 0.3s ease";

    // Confirmation box
    const box = document.createElement("div");
    box.style.background = "#111827";
    box.style.padding = "25px 30px";
    box.style.borderRadius = "12px";
    box.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
    box.style.textAlign = "center";
    box.style.width = "320px";
    box.style.transform = "scale(0.8)";
    box.style.transition = "transform 0.25s ease, opacity 0.25s ease";
    box.style.opacity = "0";
    box.innerHTML = `
      <h3 style="color: #f8fafc; font-size: 1.2rem; margin-bottom: 15px;">
        Are you sure you want to log out?
      </h3>
      <div style="display:flex; justify-content:center; gap:10px;">
        <button id="confirmLogout" 
          style="background:linear-gradient(90deg, #fb923c, #ea580c);
          border:none; color:#fff; padding:10px 18px; border-radius:8px;
          cursor:pointer; font-weight:600; transition:transform 0.2s ease;">Yes</button>
        <button id="cancelLogout" 
          style="background:#1e293b; border:none; color:#fff; 
          padding:10px 18px; border-radius:8px; cursor:pointer;
          transition:transform 0.2s ease;">Cancel</button>
      </div>
    `;

    confirmOverlay.appendChild(box);
    document.body.appendChild(confirmOverlay);

    // Animate fade-in + scale-up
    setTimeout(() => {
      confirmOverlay.style.opacity = "1";
      box.style.opacity = "1";
      box.style.transform = "scale(1)";
    }, 50);

    // Button hover effects
    const buttons = box.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.addEventListener("mouseover", () => (btn.style.transform = "scale(1.05)"));
      btn.addEventListener("mouseout", () => (btn.style.transform = "scale(1)"));
    });

    // Confirm logout
    document.getElementById("confirmLogout").addEventListener("click", () => {
      box.style.transform = "scale(0.9)";
      box.style.opacity = "0";
      confirmOverlay.style.opacity = "0";
      setTimeout(() => {
        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("loggedInUser");
        confirmOverlay.remove();
        window.location.href = "index.html";
      }, 250);
    });

    // Cancel logout
    document.getElementById("cancelLogout").addEventListener("click", () => {
      box.style.transform = "scale(0.9)";
      box.style.opacity = "0";
      confirmOverlay.style.opacity = "0";
      setTimeout(() => confirmOverlay.remove(), 250);
    });
  });
}


// ==========================
// REPORTS MODAL
// ==========================
const reportsModal = document.getElementById("reportsModal");
const openReportsBtn = document.getElementById("openReportsBtn");
const closeReports = document.querySelector(".close-reports");

if (openReportsBtn && reportsModal) {
  openReportsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    reportsModal.style.display = "flex";
    setTimeout(renderReports, 250);
  });
}

if (closeReports) {
  closeReports.onclick = () => (reportsModal.style.display = "none");
}

function renderReports() {
  const data = usersData[currentUser] || [];
  if (!data.length) return;

  const trendCtx = document.getElementById("monthlyTrendChart");
  const statusCtx = document.getElementById("statusChart");

  if (window.trendChart) window.trendChart.destroy();
  if (window.statusChart) window.statusChart.destroy();

  const monthlyTotals = {};
  data.forEach((exp) => {
    const month = exp.date.slice(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  window.trendChart = new Chart(trendCtx, {
    type: "line",
    data: {
      labels: Object.keys(monthlyTotals),
      datasets: [
        {
          label: "Total Spent (€)",
          data: Object.values(monthlyTotals),
          borderColor: "#fb923c",
          backgroundColor: "rgba(251,146,60,0.3)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#f8fafc" } },
        y: { ticks: { color: "#f8fafc" } },
      },
      maintainAspectRatio: false,
      responsive: true,
    },
  });

  const submitted = data.filter((e) => e.status === "submitted").length;
  const pending = data.length - submitted;

  window.statusChart = new Chart(statusCtx, {
    type: "bar",
    data: {
      labels: ["Submitted", "Pending"],
      datasets: [
        {
          data: [submitted, pending],
          backgroundColor: ["#22c55e", "#f97316"],
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#f8fafc" } },
        y: { ticks: { color: "#f8fafc" } },
      },
      maintainAspectRatio: false,
      responsive: true,
    },
  });
}

// ==========================
// INITIAL LOAD
// ==========================
loadExpenses();
