const express = require('express');
const db = require('../db/init');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /posts/:postId/comments - 获取文章评论
router.get('/posts/:postId/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT c.id, c.content, c.post_id, c.user_id, c.parent_id, c.created_at,
           u.username, u.avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.postId);

  res.json({ comments });
});

// POST /posts/:postId/comments - 创建评论（需登录）
router.post('/posts/:postId/comments', auth, (req, res) => {
  const { content, parent_id } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.postId);
  if (!post) {
    return res.status(404).json({ error: '文章不存在' });
  }

  if (parent_id) {
    const parent = db.prepare('SELECT id FROM comments WHERE id = ? AND post_id = ?').get(parent_id, req.params.postId);
    if (!parent) {
      return res.status(400).json({ error: '父评论不存在' });
    }
  }

  const result = db.prepare(
    'INSERT INTO comments (content, post_id, user_id, parent_id) VALUES (?, ?, ?, ?)'
  ).run(content.trim(), req.params.postId, req.user.id, parent_id || null);

  const comment = db.prepare(`
    SELECT c.id, c.content, c.post_id, c.user_id, c.parent_id, c.created_at,
           u.username, u.avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(comment);
});

// DELETE /comments/:id - 删除评论（仅作者本人）
router.delete('/comments/:id', auth, (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) {
    return res.status(404).json({ error: '评论不存在' });
  }
  if (comment.user_id !== req.user.id) {
    return res.status(403).json({ error: '无权删除此评论' });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ message: '评论已删除' });
});

module.exports = router;
