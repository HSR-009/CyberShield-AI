# 🛡️ CyberShield AI

CyberShield AI is an intelligent message-analysis tool designed to help users identify potential scam messages before taking action.  
It uses **AI-guided, rule-based security logic** to interpret message content, assess risk, and provide clear safety recommendations.

The project focuses on **accuracy, explainability, and low false positives**, making it suitable for awareness, demos, and real-world usage scenarios.

---

## ✨ Features

- 🔍 **Context-aware scam detection**
- 🧠 **AI-guided rule engine** (explainable logic, not a black box)
- 🚨 Detects high-risk scam patterns such as:
  - Authority impersonation (police, courts, legal threats)
  - Bank & payment scams
  - OTP misuse
  - Lottery & reward fraud
  - Phishing links
  - Job & work-from-home scams
- 🎯 **Risk scoring system (0–100)** with clear severity levels
- 📊 Visual risk gauge & colored indicators
- 🧾 Incident log with severity-based highlighting
- 🔐 **Privacy-friendly**: messages are analyzed instantly and not stored

---

## 🧠 How CyberShield AI Works

CyberShield AI analyzes message text using a **rule-based intelligence engine enhanced with AI-style pattern interpretation**.

Instead of relying only on keywords, it evaluates:
- **Context** (e.g., OTP for login vs OTP for payment)
- **Intent** (informational vs demanding action)
- **Combinations of signals** (authority + urgency + link)
- **Real-world legitimacy rules** (how banks, delivery services, and authorities actually communicate)

Each message is classified into:
- **Safe**
- **Suspicious**
- **High Risk**
- **Critical Scam**

Along with:
- A **risk score**
- A **clear explanation**
- A **recommended action**

---

## 🎨 User Interface Highlights

- Light-rich, security-themed design
- Clear visual hierarchy for risk severity
- Color-aligned UI (score, gauge, logs, and recommendations always match)
- Info tooltip explaining the system for transparency

---

## 🧪 Example Scenarios Detected

| Message Type | Result |
|-------------|--------|
| Bank login OTP | Safe (if user initiated) |
| Delivery OTP | Safe (conditional) |
| Lottery win message | Always suspicious or dangerous |
| Bank asking for OTP | Critical scam |
| Bank asking for documents via link | Suspicious |
| Job asking for payment | Scam |
| Authority threatening arrest | Critical scam |

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/cybershield-ai.git
cd cybershield-ai
# CyberShield-AI
