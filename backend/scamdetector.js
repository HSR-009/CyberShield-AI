function detectScam(text) {
  const t = text.toLowerCase();

  let score = 0;
  let indicators = [];
  let attackTypes = new Set();

  /* =========================
     KEYWORDS
  ========================= */
  const authority = ["police", "cbi", "crime branch", "court", "legal notice", "arrest"];

  const bankAlerts = [
    "account blocked", "account suspended", "kyc expired",
    "verify your account", "payment failed", "transaction failed",
    "card blocked", "card declined"
  ];

  const bankGeneric = ["bank"];

  const documentRequests = [
    "submit", "upload", "documents", "document",
    "verify details", "update details"
  ];

  const lotteryReward = [
    "lottery", "jackpot", "lucky draw",
    "reward", "prize", "winner", "won"
  ];

  const jobScam = ["job offer", "work from home", "easy income", "hiring"];

  const delivery = ["parcel", "courier", "out for delivery", "delivery"];

  const moneyActions = [
    "payment", "transfer", "upi", "refund",
    "processing fee", "charges", "pay"
  ];

  const sensitiveData = [
    "otp", "pin", "password",
    "account details", "card details"
  ];

  const otpRequestWords = ["share", "send", "confirm", "verify", "reply"];
  const otpInfoPhrases = ["your otp is", "otp for", "use this otp"];

  // 🔴 IMPORTANT FIX IS HERE
  const links = [
    "link",          // <-- THIS WAS MISSING
    "click here",
    "visit link",
    "http",
    "https",
    "bit.ly",
    "tinyurl"
  ];

  const urgency = ["urgent", "immediately", "final warning", "act now", "within 24 hours"];

  /* =========================
     AUTHORITY — HARD RULE
  ========================= */
  if (authority.some(k => t.includes(k))) {
    score = Math.max(score, 35);
    indicators.push("Authority impersonation");
    attackTypes.add("Authority Scam");

    if (
      sensitiveData.some(k => t.includes(k)) ||
      links.some(k => t.includes(k)) ||
      documentRequests.some(k => t.includes(k))
    ) {
      score = Math.max(score, 95);
      indicators.push("CRITICAL: Authority asking for action or details");
    }
  }

  /* =========================
     LOTTERY — NEVER SAFE
  ========================= */
  if (lotteryReward.some(k => t.includes(k))) {
    score = Math.max(score, 60);
    indicators.push("Unsolicited lottery or reward message");
    attackTypes.add("Lottery Scam");

    if (urgency.some(k => t.includes(k))) score = Math.max(score, 75);
    if (links.some(k => t.includes(k))) score = Math.max(score, 85);
    if (moneyActions.some(k => t.includes(k)) || sensitiveData.some(k => t.includes(k))) {
      score = Math.max(score, 95);
    }
  }

  /* =========================
     BANK ALERTS
  ========================= */
  if (bankAlerts.some(k => t.includes(k))) {
    score = Math.max(score, 25);
    indicators.push("Bank or payment alert");
    attackTypes.add("Bank Alert");

    if (sensitiveData.some(k => t.includes(k)) || moneyActions.some(k => t.includes(k))) {
      score = Math.max(score, 90);
      indicators.push("CRITICAL: Bank asking for OTP or payment");
    }

    else if (documentRequests.some(k => t.includes(k)) || links.some(k => t.includes(k))) {
      score = Math.max(score, 35);
      indicators.push("Bank asking for documents or verification via message");
    }
  }

  /* =========================
     ✅ GENERIC BANK DOCUMENT REQUEST (FINAL FIX)
  ========================= */
  if (
    bankGeneric.some(k => t.includes(k)) &&
    documentRequests.some(k => t.includes(k)) &&
    links.some(k => t.includes(k)) &&
    !moneyActions.some(k => t.includes(k)) &&
    !sensitiveData.some(k => t.includes(k))
  ) {
    score = Math.max(score, 35);
    indicators.push("Bank asking for documents via link");
    attackTypes.add("Bank Verification Message");
  }

  /* =========================
     OTP — CONTEXT AWARE
  ========================= */
  if (sensitiveData.some(k => t.includes(k))) {
    const otpRequested = otpRequestWords.some(k => t.includes(k));
    const otpInformational = otpInfoPhrases.some(k => t.includes(k));

    if (otpRequested) score = Math.max(score, 85);
    else if (otpInformational && (t.includes("login") || t.includes("sign in"))) score = Math.max(score, 15);
    else if (otpInformational && delivery.some(k => t.includes(k))) score = Math.max(score, 20);
    else if (moneyActions.some(k => t.includes(k)) || urgency.some(k => t.includes(k))) score = Math.max(score, 90);
  }

  /* =========================
     FINALIZE
  ========================= */
  score = Math.min(score, 100);

  let action =
    score >= 90
      ? "🚨 Definite scam. Do NOT respond, click links, or share any information."
      : score >= 60
      ? "⚠️ High scam risk. Do not interact with this message."
      : score >= 30
      ? "🟡 Suspicious message. Verify through official apps or trusted sources before doing anything."
      : "🟢 Appears informational. Proceed only if you initiated the action.";

  return {
    type: attackTypes.size ? [...attackTypes].join(" + ") : "Informational",
    score,
    reason: indicators.length
      ? "Detected indicators: " + [...new Set(indicators)].join(", ") + "."
      : "No suspicious indicators detected.",
    action
  };
}

module.exports = detectScam;
