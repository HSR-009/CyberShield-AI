const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const detectScam = require("./scamdetector");
const logIncident = require("./logger");
const auth = require("./auth");

const app = express();

/* =========================
   BASIC SETUP
========================= */
app.use(express.json());

// REQUIRED for Render / reverse proxy
app.set("trust proxy", 1);

/* =========================
   FORCE HTTPS (RENDER FIX)
========================= */
app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

/* =========================
   SESSION (FIXED FOR RENDER)
========================= */
app.use(session({
  name: "cybershield.sid",
  secret: process.env.SESSION_SECRET, // MUST be set in Render env
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,        // REQUIRED
    sameSite: "none",    // REQUIRED
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));

/* =========================
   STATIC FILES
========================= */
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(publicPath, "login.html"));
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

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
   PAGE PROTECTION
========================= */
app.use((req, res, next) => {
  if (
    req.path === "/login.html" ||
    req.path.startsWith("/api") ||
    req.path.match(/\.(css|js|png|jpg|svg)$/)
  ) {
    return next();
  }

  if (!req.session.user) {
    return res.redirect("/login.html");
  }

  next();
});

/* =========================
   ANALYZE API
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
   LOAD USER LOGS
========================= */
app.get("/api/logs", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const logFile = path.join(__dirname, "logs", `${req.session.user.id}.log`);
  if (!fs.existsSync(logFile)) return res.json([]);

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
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CyberShield AI running on port ${PORT}`);
});
