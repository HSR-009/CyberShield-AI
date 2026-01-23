function detectScam(text) {
  const t = text.toLowerCase();

  let score = 0;
  let indicators = [];
  let attackTypes = new Set();

  const vagueAction = [
    "please respond","action required","follow instructions",
    "review pending","avoid delay","confirmation required",
    "further action","validate","complete the step"
  ];

  const bankBlocking = [
    "account blocked","account suspended","kyc expired",
    "verify your account","bank account issue"
  ];

  const aadhaarPan = ["aadhaar","aadhar","pan card","uidai"];
  const authority = ["police","cbi","crime branch","court","legal notice","arrest"];
  const lotteryReward = ["lottery","jackpot","lucky draw","reward","prize","winner","won"];
  const fakeCredit = ["credited","credit alert","amount added","money added"];
  const delivery = ["parcel","courier","delivery failed","customs"];
  const jobScam = ["job offer","work from home","easy income"];

  const moneyActions = ["payment","transfer","upi","refund","pay now","processing fee","charges"];
  const sensitiveData = ["otp","pin","password","account details","debit card","credit card"];
  const links = ["click here","click link","go to this link","visit link","http","https","bit.ly","tinyurl"];
  const urgency = ["urgent","immediately","within 24 hours","final warning","act now"];

  if (bankBlocking.some(k => t.includes(k))) {
    score += 30; indicators.push("Bank account blocking / KYC threat");
    attackTypes.add("Bank / KYC Scam");
  }

  if (aadhaarPan.some(k => t.includes(k))) {
    score += 30; indicators.push("Aadhaar / PAN misuse");
    attackTypes.add("Aadhaar / PAN Scam");
  }

  if (authority.some(k => t.includes(k))) {
    score += 35; indicators.push("Authority impersonation");
    attackTypes.add("Authority Scam");
  }

  if (lotteryReward.some(k => t.includes(k))) {
    score += 35; indicators.push("Lottery / reward bait");
    attackTypes.add("Lottery / Reward Scam");
  }

  if (fakeCredit.some(k => t.includes(k))) {
    score += 35; indicators.push("Fake credit message");
    attackTypes.add("Fake Credit Scam");
  }

  if (delivery.some(k => t.includes(k))) {
    score += 25; indicators.push("Fake delivery message");
    attackTypes.add("Delivery Scam");
  }

  if (jobScam.some(k => t.includes(k))) {
    score += 25; indicators.push("Job / income lure");
    attackTypes.add("Job Scam");
  }

  if (moneyActions.some(k => t.includes(k))) {
    score += 30; indicators.push("Suspicious money request");
    attackTypes.add("Payment Scam");
  }

  if (sensitiveData.some(k => t.includes(k))) {
    score += 40; indicators.push("Sensitive data request (OTP / credentials)");
    attackTypes.add("Sensitive Data Scam");
  }

  if (links.some(k => t.includes(k))) {
    score += 30; indicators.push("Suspicious link present");
    attackTypes.add("Suspicious Link Scam");
  }

  if (urgency.some(k => t.includes(k))) {
    score += 20; indicators.push("Urgency manipulation");
  }

  if (authority.some(k => t.includes(k)) && sensitiveData.some(k => t.includes(k))) {
    score = Math.max(score, 95);
    attackTypes.add("Critical Police / Authority Scam");
    indicators.push("CRITICAL: Authority + OTP");
  }

  if (bankBlocking.some(k => t.includes(k)) && sensitiveData.some(k => t.includes(k))) {
    score = Math.max(score, 90);
    attackTypes.add("Critical Banking Scam");
    indicators.push("CRITICAL: Bank + OTP");
  }

  if (moneyActions.some(k => t.includes(k)) && links.some(k => t.includes(k))) {
    score = Math.max(score, 85);
    attackTypes.add("High-Risk Financial Scam");
    indicators.push("CRITICAL: Money + Link");
  }

  if (lotteryReward.some(k => t.includes(k)) && links.some(k => t.includes(k))) {
    score = Math.max(score, 85);
    attackTypes.add("High-Risk Lottery Scam");
    indicators.push("CRITICAL: Reward + Link");
  }

  score = Math.min(score, 100);

  if (score === 0 && vagueAction.some(k => t.includes(k))) {
    score = 15;
    indicators.push("Unclear action request");
    attackTypes.add("Low-Confidence Social Engineering");
  }

  let reason = indicators.length
    ? "Detected indicators: " + [...new Set(indicators)].join(", ") + "."
    : "No suspicious indicators detected.";

  let action =
    score >= 90 ? "🚨 Extremely high-risk scam. Do NOT respond."
    : score >= 70 ? "High-risk scam. Avoid interaction."
    : score >= 40 ? "Suspicious message. Verify carefully."
    : "Message appears safe, but remain cautious.";

  return {
    type: attackTypes.size ? [...attackTypes].join(" + ") : "Safe",
    score,
    reason,
    action
  };
}

module.exports = detectScam;
