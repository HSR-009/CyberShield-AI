const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const usersFile = path.join(__dirname, "users.json");

function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

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

  req.session.user = { id: user.id, email: user.email };
  res.json({ success: true });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  req.session.user = { id: user.id, email: user.email };
  res.json({ success: true });
};

exports.guest = (req, res) => {
  req.session.user = {
    id: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email: "guest"
  };
  res.json({ success: true });
};

