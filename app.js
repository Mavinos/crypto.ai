async function refresh() {
  fetch("http://127.0.0.1:8000/state").catch(() => null);
  const data = await res.json();

  // Capital global
  document.getElementById("capital").innerText =
    data.capital.toFixed(2);

  const cards = document.getElementById("cards");
  cards.innerHTML = "";

  Object.entries(data.cryptos).forEach(([symbol, c]) => {
    cards.innerHTML += `
      <div class="card" onclick="selectCrypto('${symbol}')">
        <h3>${symbol}</h3>
        <p>Prix : ${c.price ? c.price.toFixed(2) : "--"}</p>
        <p>RSI : ${c.rsi ?? "--"}</p>
        <p>Tendance : ${c.trend ?? "--"}</p>
        <p>Décision : ${c.decision}</p>
        <p>Position : ${c.position ? "OUVERTE" : "AUCUNE"}</p>
      </div>
    `;
  });
}

async function toggleIA() {
fetch("http://127.0.0.1:8000/state").catch(() => null);
}

setInterval(refresh, 1000);

// ===== NAVIGATION ONGLET (FIX DEFINITIF) =====
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // reset
      navItems.forEach(n => n.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      // activate
      item.classList.add("active");
      const target = item.getAttribute("data-section");
      document.getElementById(target).classList.add("active");
    });
  });
});

let chart;
let historyPrices = [];
let currentSymbol = "BTC/USDT";

document.getElementById("cryptoSelect").onchange = e => {
  currentSymbol = e.target.value;
  historyPrices = [];
};

async function drawChart() {
  fetch("http://127.0.0.1:8000/state").catch(() => null) 
  const data = await res.json();

  const price = data.cryptos[currentSymbol].price;
  if (!price) return;

  historyPrices.push(price);
  if (historyPrices.length > 30) historyPrices.shift();

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
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

setInterval(drawChart, 3000);

async function loadHistory() {
  const res = await fetch("http://127.0.0.1:8000/history");
  const data = await res.json();

  const box = document.getElementById("history");
  box.innerHTML = "";

  data.reverse().forEach(t => {
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
}

setInterval(loadHistory, 2000);

function selectCrypto(symbol) {
  currentSymbol = symbol;
  historyPrices = [];
  document.getElementById("cryptoSelect").value = symbol;
}

// ===== NAVIGATION ONGLET (CLICK FIX) =====
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {

      // Retire l'actif partout
      navItems.forEach(n => n.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      // Active l'onglet cliqué
      item.classList.add("active");
      const target = item.getAttribute("data-section");
      const section = document.getElementById(target);

      if (section) {
        section.classList.add("active");
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}};
