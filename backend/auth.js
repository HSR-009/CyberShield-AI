const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const usersFile = path.join(__dirname, "users.json");

function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function issueToken(res, user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 2
  });
}

/* =========================
   SIGNUP
========================= */
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `u_${Date.now()}`,
    email,
    passwordHash
  };

  users.push(user);
  saveUsers(users);

  issueToken(res, user);
  res.json({ success: true });
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  issueToken(res, user);
  res.json({ success: true });
};

/* =========================
   GUEST
========================= */
exports.guest = (req, res) => {
  const user = {
    id: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email: "guest"
  };

  issueToken(res, user);
  res.json({ success: true });
};
