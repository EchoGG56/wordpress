const express = require('express');
const db = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// GET / - 获取文章列表
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const status = req.query.status || 'published';

  let where = 'WHERE p.status = ?';
  const params = [status];

  if (category) {
    where += ' AND c.slug = ?';
    params.push(category);
  }

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
  `).get(...params).count;

  const posts = db.prepare(`
    SELECT p.id, p.title, p.excerpt, p.cover_image, p.status, p.created_at, p.updated_at,
           u.username as author, c.name as category, c.slug as category_slug
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
});

// GET /:id - 获取文章详情
router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username as author, u.avatar as author_avatar,
           c.name as category, c.slug as category_slug
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!post) {
    return res.status(404).json({ error: '文章不存在' });
  }

  const tags = db.prepare(`
    SELECT t.id, t.name FROM tags t
    JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
  `).all(req.params.id);

  res.json({ ...post, tags });
});

// POST / - 创建文章
router.post('/', auth, (req, res) => {
  const { title, content, excerpt, cover_image, category_id, status, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' });
  }

  const result = db.prepare(`
    INSERT INTO posts (title, content, excerpt, cover_image, author_id, category_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, content, excerpt || '', cover_image || '', req.user.id, category_id || null, status || 'published');

  const postId = result.lastInsertRowid;

  // 处理标签
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const insertPostTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');

    for (const tagName of tags) {
      insertTag.run(tagName);
      const tag = getTag.get(tagName);
      if (tag) {
        insertPostTag.run(postId, tag.id);
      }
    }
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  res.status(201).json(post);
});

// PUT /:id - 更新文章
router.put('/:id', auth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: '文章不存在' });
  }
  if (post.author_id !== req.user.id) {
    return res.status(403).json({ error: '无权修改此文章' });
  }

  const { title, content, excerpt, cover_image, category_id, status, tags } = req.body;

  db.prepare(`
    UPDATE posts SET title = ?, content = ?, excerpt = ?, cover_image = ?,
    category_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || post.title,
    content || post.content,
    excerpt !== undefined ? excerpt : post.excerpt,
    cover_image !== undefined ? cover_image : post.cover_image,
    category_id !== undefined ? category_id : post.category_id,
    status || post.status,
    req.params.id
  );

  // 更新标签
  if (tags && Array.isArray(tags)) {
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(req.params.id);
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const insertPostTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)');

    for (const tagName of tags) {
      insertTag.run(tagName);
      const tag = getTag.get(tagName);
      if (tag) {
        insertPostTag.run(req.params.id, tag.id);
      }
    }
  }

  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - 删除文章
router.delete('/:id', auth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) {
    return res.status(404).json({ error: '文章不存在' });
  }
  if (post.author_id !== req.user.id) {
    return res.status(403).json({ error: '无权删除此文章' });
  }

  db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(req.params.id);
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);

  res.json({ message: '文章已删除' });
});

module.exports = router;
