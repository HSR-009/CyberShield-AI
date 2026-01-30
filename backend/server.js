const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const detectScam = require("./scamdetector");
const logIncident = require("./logger");
const auth = require("./auth");

const app = express();

/* =========================
   BASIC SETUP
========================= */
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

/* =========================
   STATIC FILES (PROTECTED)
========================= */
const publicPath = path.join(__dirname, "public");

/**
 * 🔐 IMPORTANT FIX
 * Prevent direct access to index.html
 * Forces auth check via "/"
 */
app.use((req, res, next) => {
  if (req.path === "/index.html") {
    return res.redirect("/");
  }
  next();
});

app.use(express.static(publicPath));

/* =========================
   AUTH MIDDLEWARE (API ONLY)
========================= */
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* =========================
   ROOT ROUTE (ENTRY POINT)
========================= */
app.get("/", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.sendFile(path.join(publicPath, "login.html"));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.sendFile(path.join(publicPath, "index.html"));
  } catch {
    res.clearCookie("token");
    return res.sendFile(path.join(publicPath, "login.html"));
  }
});

/* =========================
   AUTH ROUTES
========================= */
app.post("/api/login", auth.login);
app.post("/api/signup", auth.signup);
app.post("/api/guest", auth.guest);

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

/* =========================
   ANALYZE API
========================= */
app.post("/api/analyze", requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const result = detectScam(text);
  logIncident(req.user.id, result);
  res.json(result);
});

/* =========================
   LOAD USER LOGS
========================= */
app.get("/api/logs", requireAuth, (req, res) => {
  const logFile = path.join(__dirname, "logs", `${req.user.id}.log`);
  if (!fs.existsSync(logFile)) return res.json([]);

  const lines = fs.readFileSync(logFile, "utf-8").trim().split("\n");

  const logs = lines
    .map(line => {
      const match = line.match(/\[(.*?)\]\s(.+?)\s\|\sScore:\s(\d+)/);
      if (!match) return null;

      return {
        time: new Date(match[1]).toLocaleTimeString(),
        type: match[2],
        score: Number(match[3])
      };
    })
    .filter(Boolean);

  res.json(logs);
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CyberShield AI running on port ${PORT}`);
});
