const express = require("express");
const detectScam = require("./scamdetector");
const logIncident = require("./logger");

const app = express();
app.use(express.json());

app.post("/api/analyze", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  const result = detectScam(text);
  logIncident(result);

  res.json(result);
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CyberShield AI running on port ${PORT}`);

});
