# CyberShield AI — Scam & Fraud Risk Analyzer

## 📌 Description

CyberShield AI is a full-stack web app that scores user-submitted messages (SMS, email, chat) for scam/fraud risk. Instead of a single keyword blocklist, it uses a rule-based, multi-category detection engine that recognizes patterns like authority impersonation, fake bank alerts, lottery scams, and OTP phishing — and tells the difference between a message that merely *mentions* an OTP and one that's actively trying to phish it.

## 🛠️ Features

- **Multi-category detection engine** — scores messages across categories (authority impersonation, bank alerts, lottery scams, OTP phishing, etc.) rather than relying on a single flat rule set.
- **Context-aware scoring** — escalates risk severity based on keyword *co-occurrence*, so an informational OTP message ("Your OTP is 1234, do not share it") isn't flagged the same way as an active phishing attempt asking the user to share that OTP.
- **Authentication** — JWT-based auth with bcrypt password hashing and HTTP-only cookie sessions; a guest mode is available for trying the tool without an account.
- **Access control** — the analysis dashboard is protected from unauthenticated access at the routing level, not just hidden in the UI.
- **Per-user history** — every analyzed message is logged per user, with a dashboard to review past messages alongside their computed risk scores.

## 🧱 Tech Stack

Node.js · Express · JWT · bcrypt · HTML/CSS/JS

## ⚙️ How It Works

1. A user submits a message (pasted text) through the web UI.
2. The backend runs the message through the detection engine, which checks for category-specific keyword patterns and their co-occurrence.
3. A risk score is computed based on which categories matched and how strongly, distinguishing informational mentions from active phishing language.
4. The result — score, matched category, and a short explanation — is returned to the UI and logged against the user's account for later review.

## 🚀 Usage

> Adjust paths/commands below to match your actual entrypoint and env variable names in the repo.

```bash
# 1. Clone the repo
git clone https://github.com/HSR-009/CyberShield-AI.git
cd CyberShield-AI

# 2. Install dependencies
npm install

# 3. Configure environment variables (JWT secret, port, etc.)
cp .env.example .env
# edit .env with your values

# 4. Run the server
npm start
```

Then open `http://localhost:3000` (or your configured port) in the browser. Use guest mode to try it without creating an account, or sign up to save your analysis history.

## Website's URL

https://cybershield-ai-c47m.onrender.com/

## 🔒 Notes

This is a learning/portfolio project demonstrating rule-based fraud detection and secure auth patterns. Detection is heuristic/rule-based (not ML-based), so it should be treated as a proof of concept rather than production-grade fraud detection.
