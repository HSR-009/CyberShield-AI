// =====================
// Element References
// =====================
const analyzeBtn = document.getElementById("analyzeBtn");
const messageInput = document.getElementById("messageInput");
const resultBox = document.getElementById("resultBox");
const attackTypeEl = document.getElementById("attackType");
const riskScoreEl = document.getElementById("riskScore");
const reasonText = document.getElementById("reasonText");
const actionText = document.getElementById("actionText");
const riskBadge = document.getElementById("riskBadge");
const incidentList = document.getElementById("incidentList");
const preAnalysis = document.getElementById("preAnalysis");

analyzeBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  preAnalysis.classList.add("hidden");
  analyzeBtn.innerText = "Analyzing...";

  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const result = await res.json();
    showResult(result);
    logIncident(result);
  } catch (err) {
    console.error(err);
    alert("Backend not responding. Is the server running?");
  }

  analyzeBtn.innerText = "Analyze Risk";
};

function showResult(r) {
  // Activate colored gauge
  document.querySelector(".gauge-bar").style.background =
    "linear-gradient(to right, #22c55e 0%, #22c55e 30%, #facc15 30%, #facc15 60%, #ef4444 60%, #ef4444 100%)";

  const pointer = document.getElementById("gaugePointer");

  // Score → position (0–100)
  let position = Math.min(Math.max(r.score, 0), 100);
  pointer.style.left = `calc(${position}% - 8px)`;

  resultBox.classList.remove("hidden");
  attackTypeEl.innerText = r.type;
  riskScoreEl.innerText = r.score + "/100";
  reasonText.innerText = r.reason;
  actionText.innerText = r.action;

  if (r.score >= 60) {
    resultBox.style.borderColor = "red";
    riskBadge.innerText = "HIGH RISK";
  } else if (r.score >= 30) {
    resultBox.style.borderColor = "orange";
    riskBadge.innerText = "MEDIUM RISK";
  } else {
    resultBox.style.borderColor = "green";
    riskBadge.innerText = "LOW RISK";
  }
}

function logIncident(r) {
  const time = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  div.className = "log-item";
  div.innerHTML = `<strong>${time}</strong><br>${r.type} | Risk: ${r.score}`;
  incidentList.prepend(div);
}