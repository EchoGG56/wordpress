const jwt = require('jsonwebtoken');

const JWT_SECRET = 'wordpress-blog-secret-key-2024';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: '认证令牌无效' });
  }
}

module.exports = auth;
module.exports.JWT_SECRET = JWT_SECRET;
