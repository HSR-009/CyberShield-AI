const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const detectScam = require("./scamdetector");
const logIncident = require("./logger");
const auth = require("./auth");

const app = express();

app.use(express.json());

app.use(session({
  secret: "cybershield-secret",
  resave: false,
  saveUninitialized: false
}));

/* =========================
   AUTH ROUTES
========================= */
app.post("/api/login", auth.login);
app.post("/api/signup", auth.signup);
app.post("/api/guest", auth.guest);
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

/* =========================
   PROTECT PAGES
========================= */
app.use((req, res, next) => {
  if (
    req.path.startsWith("/api") ||
    req.path === "/login.html"
  ) return next();

  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  next();
});

/* =========================
   ANALYZE MESSAGE
========================= */
app.post("/api/analyze", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const result = detectScam(text);
  logIncident(req.session.user.id, result);

  res.json(result);
});

/* =========================
   LOAD USER LOG HISTORY
========================= */
app.get("/api/logs", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const logFile = path.join(
    __dirname,
    "logs",
    `${req.session.user.id}.log`
  );

  if (!fs.existsSync(logFile)) {
    return res.json([]);
  }

  const lines = fs.readFileSync(logFile, "utf-8").trim().split("\n");

  const logs = lines.map(line => {
    const match = line.match(/\[(.*?)\]\s(.+?)\s\|\sScore:\s(\d+)/);
    if (!match) return null;

    return {
      time: new Date(match[1]).toLocaleTimeString(),
      type: match[2],
      score: Number(match[3])
    };
  }).filter(Boolean);

  res.json(logs);
});

/* =========================
   STATIC FILES
========================= */
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CyberShield AI running on port ${PORT}`);
});

