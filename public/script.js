// Get current logged-in user
const currentUser = localStorage.getItem("loggedInUser");

if (!currentUser && window.location.pathname.includes("dashboard.html")) {
  window.location.href = "index.html";
}

if (document.getElementById("userName")) {
  document.getElementById("userName").textContent =
    currentUser.charAt(0).toUpperCase() + currentUser.slice(1);
}

// Populate expense table
const tableBody = document.querySelector("#expenseTable tbody");

if (tableBody && usersData[currentUser]) {
  usersData[currentUser].forEach((exp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.detail}</td>
      <td>${exp.merchant}</td>
      <td>€${exp.amount}</td>
      <td><span class="status-${exp.status}">${exp.status === "submitted" ? "Submitted" : "Not Submitted"}</span></td>
    `;
    tableBody.appendChild(row);
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });
}
