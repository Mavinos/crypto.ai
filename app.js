console.log("APP.JS CHARGÉ");

// ===============================
// CONFIG API (RENDER)
// ===============================
const API_BASE = "https://crypto-ai-backend-nzvr.onrender.com";

// ===============================
// VARIABLES GLOBALES
// ===============================
let chart = null;
let historyPrices = [];
let currentSymbol = "BTC/USDT";

// ===============================
// RAFRAÎCHISSEMENT GLOBAL (STATE)
// ===============================
async function refreshState() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    const data = await res.json();

    console.log("STATE:", data);

    // Capital
    if (typeof data.capital === "number") {
      const el = document.getElementById("capital");
      if (el) {
        el.innerText = data.capital.toFixed(2) + " $";
      }
    }

    // Cards cryptos
    const cards = document.getElementById("cards");
    if (!cards) return;

    cards.innerHTML = "";

    Object.entries(data.cryptos || {}).forEach(([symbol, c]) => {
      cards.innerHTML += `
        <div class="card" onclick="selectCrypto('${symbol}')">
          <h3>${symbol}</h3>
          <p>Prix : ${c.price ? c.price.toFixed(2) : "--"}</p>
          <p>RSI : ${c.rsi ?? "--"}</p>
          <p>Tendance : ${c.trend ?? "--"}</p>
          <p>Décision : ${c.decision ?? "--"}</p>
          <p>Position : ${c.position ? "OUVERTE" : "AUCUNE"}</p>
        </div>
      `;
    });
  } catch (e) {
    console.error("Erreur refreshState:", e);
  }
}

setInterval(refreshState, 2000);
refreshState();

// ===============================
// TOGGLE IA
// ===============================
async function toggleIA() {
  await fetch(`${API_BASE}/toggle-ia`, { method: "POST" });
}

// ===============================
// GRAPH
// ===============================
async function drawChart() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    const data = await res.json();

    const price = data.cryptos?.[currentSymbol]?.price;
    if (!price) return;

    historyPrices.push(price);
    if (historyPrices.length > 30) historyPrices.shift();

    if (!chart) {
      chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
          labels: historyPrices.map((_, i) => i),
          datasets: [{
            label: currentSymbol,
            data: historyPrices,
            borderColor: "#4cc9f0",
            tension: 0.3
          }]
        }
      });
    } else {
      chart.data.datasets[0].label = currentSymbol;
      chart.data.datasets[0].data = historyPrices;
      chart.update();
    }
  } catch (e) {
    console.error("Erreur drawChart:", e);
  }
}

setInterval(drawChart, 3000);

// ===============================
// HISTORIQUE
// ===============================
async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`);
    const data = await res.json();

    const box = document.getElementById("history");
    if (!box) return;

    box.innerHTML = "";

    data.slice().reverse().forEach(t => {
      box.innerHTML += `
        <tr>
          <td>${t.time}</td>
          <td>${t.symbol}</td>
          <td style="color:${t.type === "BUY" ? "lime" : "red"}">
            ${t.type}
          </td>
          <td>${t.price?.toFixed(2) ?? "-"}</td>
          <td>${t.pnl ?? "-"}</td>
        </tr>
      `;
    });
  } catch (e) {
    console.error("Erreur loadHistory:", e);
  }
}

setInterval(loadHistory, 2000);

// ===============================
// PLAN (STARTER / PRO / ELITE)
// ===============================
async function loadPlan() {
  try {
    const res = await fetch(`${API_BASE}/plan`);
    const data = await res.json();

    if (data.plan === "STARTER") {
      const history = document.getElementById("history");
      if (history) {
        history.innerHTML = "🔒 Historique réservé au plan PRO";
      }
    }
  } catch (e) {
    console.error("Erreur loadPlan:", e);
  }
}

loadPlan();

// ===============================
// SELECT CRYPTO
// ===============================
function selectCrypto(symbol) {
  currentSymbol = symbol;
  historyPrices = [];
  const select = document.getElementById("cryptoSelect");
  if (select) select.value = symbol;
}

document.getElementById("cryptoSelect")?.addEventListener("change", e => {
  currentSymbol = e.target.value;
  historyPrices = [];
});

// ===============================
// NAVIGATION ONGLET
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      item.classList.add("active");
      const target = item.getAttribute("data-section");
      document.getElementById(target)?.classList.add("active");
    });
  });
});
