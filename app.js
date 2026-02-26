console.log("APP.JS CHARGÉ");

const API_BASE = "https://crypto-ai-backend-nzvr.onrender.com";

let chart = null;
let historyPrices = [];
let currentSymbol = "BTC/USDC";

// ================= REFRESH STATE =================
async function refreshState() {
  const res = await fetch(`${API_BASE}/state`);
  const data = await res.json();

  if (data.capital) {
    document.getElementById("capital").innerText =
      data.capital.toFixed(2) + " $";
  }

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
        <p>Position : ${c.position ?? "AUCUNE"}</p>
      </div>
    `;
  });
}

setInterval(refreshState, 2000);
refreshState();

// ================= HISTORIQUE =================
async function loadHistory() {
  const res = await fetch(`${API_BASE}/history`);
  const data = await res.json();

  const box = document.getElementById("history");
  box.innerHTML = "";

  data.slice().reverse().forEach(t => {
    box.innerHTML += `
      <tr>
        <td>${t.time}</td>
        <td>${t.symbol}</td>
        <td style="color:${t.type.includes("BUY") ? "lime" : "red"}">
          ${t.type}
        </td>
        <td>${t.price?.toFixed(2) ?? "-"}</td>
        <td>${t.pnl ?? "-"}</td>
      </tr>
    `;
  });
}

setInterval(loadHistory, 2000);

// ================= GRAPH =================
async function drawChart() {
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
    chart.data.datasets[0].data = historyPrices;
    chart.data.datasets[0].label = currentSymbol;
    chart.update();
  }
}

setInterval(drawChart, 3000);

// ================= MANUAL BUY =================
async function manualBuy() {
  const amount = parseFloat(document.getElementById("manualAmount").value);

  await fetch(`${API_BASE}/manual-buy`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      symbol: currentSymbol,
      usdc_amount: amount
    })
  });
}

// ================= MANUAL SELL =================
async function manualSell() {
  await fetch(`${API_BASE}/manual-sell`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      symbol: currentSymbol
    })
  });
}

// ================= SELECT =================
function selectCrypto(symbol) {
  currentSymbol = symbol;
  historyPrices = [];
  document.getElementById("cryptoSelect").value = symbol;
}

document.getElementById("cryptoSelect")
  .addEventListener("change", e => {
    currentSymbol = e.target.value;
    historyPrices = [];
  });

// ================= TOGGLE IA =================
async function toggleIA() {
  await fetch(`${API_BASE}/toggle-ia`, { method: "POST" });
}
