const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function logIncident(userId, data) {
  const logFile = path.join(logDir, `${userId}.log`);
  const line = `[${new Date().toISOString()}] ${data.type} | Score: ${data.score}\n`;
  fs.appendFileSync(logFile, line);
}

module.exports = logIncident;
