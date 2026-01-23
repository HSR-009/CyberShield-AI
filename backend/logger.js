const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "logs");
const logFile = path.join(logDir, "incident.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function logIncident(data) {
  const line = `[${new Date().toISOString()}] ${data.type} | Score: ${data.score}\n`;
  fs.appendFileSync(logFile, line);
}

module.exports = logIncident;
