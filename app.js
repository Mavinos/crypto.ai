/* =========================
   CONFIG
========================= */
const API_URL = "http://127.0.0.1:8000";

let chart = null;
let historyPrices = [];
let currentSymbol = "BTC/USDT";

/* =========================
   REFRESH DATA
========================= */
async function refresh() {
  try {
    const res = await fetch(`${API_URL}/state`);
    const data = await res.json();

    document.getElementById("capital").innerText =
      data.capital?.toFixed(2) ?? "--";

    const cards = document.getElementById("cards");
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
    // backend pas dispo → on ignore
  }
}

/* =========================
   TOGGLE IA
========================= */
async function toggleIA() {
  try {
    await fetch(`${API_URL}/toggle-ia`, { method: "POST" });
  } catch (e) {}
}

/* =========================
   CHART
========================= */
async function drawChart() {
  try {
    const res = await fetch(`${API_URL}/state`);
    const data = await res.json();

    const price = data.cryptos?.[currentSymbol]?.price;
    if (!price) return;

    historyPrices.push(price);
    if (historyPrices.length > 30) historyPrices.shift();

    const ctx = document.getElementById("chart");

    if (!chart) {
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: historyPrices.map((_, i) => i),
          datasets: [{
            label: currentSymbol,
            data: historyPrices,
            borderColor: "#4cc9f0",
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    } else {
      chart.data.datasets[0].label = currentSymbol;
      chart.data.datasets[0].data = historyPrices;
      chart.update();
    }

  } catch (e) {}
}

/* =========================
   HISTORY
========================= */
async function loadHistory() {
  try {
    const res = await fetch(`${API_URL}/history`);
    const data = await res.json();

    const box = document.getElementById("history");
    box.innerHTML = "";

    data.reverse().forEach(t => {
      box.innerHTML += `
        <tr>
          <td>${t.time}</td>
          <td>${t.type}</td>
          <td>${t.price?.toFixed(2) ?? "-"}</td>
        </tr>
      `;
    });
  } catch (e) {}
}

/* =========================
   SELECT CRYPTO
========================= */
function selectCrypto(symbol) {
  currentSymbol = symbol;
  historyPrices = [];
  const select = document.getElementById("cryptoSelect");
  if (select) select.value = symbol;
}

/* =========================
   NAVIGATION ONGLET (FIX FINAL)
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {

      navItems.forEach(n => n.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      item.classList.add("active");
      const target = item.dataset.section;
      const section = document.getElementById(target);

      if (section) {
        section.classList.add("active");
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // select crypto dropdown
  const select = document.getElementById("cryptoSelect");
  if (select) {
    select.onchange = e => {
      currentSymbol = e.target.value;
      historyPrices = [];
    };
  }

});

/* =========================
   INTERVALS
========================= */
setInterval(refresh, 1000);
setInterval(drawChart, 3000);
setInterval(loadHistory, 2000);

