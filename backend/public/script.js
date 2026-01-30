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

/* =========================
   LOAD LOG HISTORY ON LOGIN
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadPreviousLogs();
});

async function loadPreviousLogs() {
  try {
    const res = await fetch("/api/logs");

    if (res.status === 401) {
      location.href = "/login.html";
      return;
    }

    const logs = await res.json();
    if (!logs.length) return;

    incidentList.innerHTML = "";

    logs.forEach(log => renderLog(log));
  } catch (err) {
    console.error("Failed to load logs", err);
  }
}

/* =========================
   ANALYZE BUTTON
========================= */
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

    if (res.status === 401) {
      location.href = "/login.html";
      return;
    }

    const result = await res.json();
    showResult(result);
    logIncident(result);
  } catch (err) {
    alert("Backend error");
    console.error(err);
  }

  analyzeBtn.innerText = "Analyze Risk";
};

/* =========================
   RESULT + METER
========================= */
function showResult(r) {
  const pointer = document.getElementById("gaugePointer");
  const position = Math.min(Math.max(r.score, 0), 100);
  pointer.style.left = `calc(${position}% - 8px)`;

  resultBox.classList.remove("hidden");

  attackTypeEl.innerText = r.type;
  riskScoreEl.innerText = r.score + "/100";
  reasonText.innerText = r.reason;
  actionText.innerText = r.action;

  if (r.score >= 90) {
    resultBox.style.borderColor = "#7f1d1d";
    riskBadge.innerText = "CRITICAL";
    riskBadge.style.background = "#7f1d1d";
  } else if (r.score >= 60) {
    resultBox.style.borderColor = "#dc2626";
    riskBadge.innerText = "HIGH RISK";
    riskBadge.style.background = "#dc2626";
  } else if (r.score >= 30) {
    resultBox.style.borderColor = "#ca8a04";
    riskBadge.innerText = "SUSPICIOUS";
    riskBadge.style.background = "#ca8a04";
  } else {
    resultBox.style.borderColor = "#16a34a";
    riskBadge.innerText = "SAFE";
    riskBadge.style.background = "#16a34a";
  }
}

/* =========================
   LOG HANDLING
========================= */
function logIncident(r) {
  renderLog({
    time: new Date().toLocaleTimeString(),
    type: r.type,
    score: r.score
  });
}

function renderLog(log) {
  const div = document.createElement("div");

  let riskClass = "low";
  if (log.score >= 60) riskClass = "high";
  else if (log.score >= 30) riskClass = "medium";

  div.className = `log-item ${riskClass}`;
  div.innerHTML = `<strong>${log.time}</strong><br>${log.type} | Risk: ${log.score}`;

  incidentList.prepend(div);
}
