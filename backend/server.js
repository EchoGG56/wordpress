const express = require('express');
const cors = require('cors');
const db = require('./db/init');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

app.use(cors());
app.use(express.json());

// 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);

// 获取所有分类
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

// 统计信息
app.get('/api/stats', (req, res) => {
  const posts = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  res.json({ posts, users, categories });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
