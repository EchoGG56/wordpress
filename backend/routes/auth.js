const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/init');
const auth = require('../middleware/auth');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: '请填写所有必填字段' });
  }

  // 邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  // 密码强度校验：至少8位，包含大写、小写字母和特殊字符
  if (password.length < 8) {
    return res.status(400).json({ error: '密码至少需要8位字符' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: '密码需包含至少一个大写字母' });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: '密码需包含至少一个小写字母' });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return res.status(400).json({ error: '密码需包含至少一个特殊字符' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(400).json({ error: '用户名或邮箱已存在' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, password_hash);

  const user = { id: result.lastInsertRowid, username, email };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user });
});

// POST /login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '请填写邮箱和密码' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }

  const payload = { id: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: payload });
});

// GET /me
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json({ user });
});

module.exports = router;
