# WordPress 博客系统 - 代码计划

## 项目概述
一个现代化的前端博客系统，使用华丽的前端页面 + Node.js 后端 + SQLite 数据库。

## 技术栈
- **前端**: 纯 HTML/CSS/JS（使用 frontend-slides 风格的华丽设计）
- **后端**: Node.js + Express
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT Token

## 功能模块

### Phase 1: 核心功能（当前阶段）
- [x] 项目架构设计
- [x] 前端页面原型
- [ ] 数据库表设计与初始化
- [ ] 用户认证 API（注册/登录）
- [ ] 文章 CRUD API
- [ ] 前端页面实现
- [ ] 前后端对接

### Phase 2: 增强功能（后续）
- [ ] 文章分类和标签
- [ ] 文章搜索
- [ ] 评论系统
- [ ] 图片上传
- [ ] Markdown 编辑器

## 数据库设计

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 用户ID |
| username | TEXT UNIQUE | 用户名 |
| email | TEXT UNIQUE | 邮箱 |
| password_hash | TEXT | 密码哈希 |
| avatar | TEXT | 头像URL |
| created_at | DATETIME | 创建时间 |

### posts 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 文章ID |
| title | TEXT | 标题 |
| content | TEXT | 内容 |
| excerpt | TEXT | 摘要 |
| cover_image | TEXT | 封面图 |
| author_id | INTEGER | 作者ID |
| category_id | INTEGER | 分类ID |
| status | TEXT | 状态(draft/published) |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### categories 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 分类ID |
| name | TEXT UNIQUE | 分类名 |
| slug | TEXT UNIQUE | URL别名 |

### tags 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PRIMARY KEY | 标签ID |
| name | TEXT UNIQUE | 标签名 |

### post_tags 表
| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | INTEGER | 文章ID |
| tag_id | INTEGER | 标签ID |

## API 设计

### 认证
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- GET /api/auth/me - 获取当前用户

### 文章
- GET /api/posts - 获取文章列表（支持分页）
- GET /api/posts/:id - 获取文章详情
- POST /api/posts - 创建文章（需认证）
- PUT /api/posts/:id - 更新文章（需认证）
- DELETE /api/posts/:id - 删除文章（需认证）

### 分类
- GET /api/categories - 获取分类列表
- POST /api/categories - 创建分类（需认证）

## 启动方式

### 后端
```bash
cd backend
npm install
npm start
```

### 前端
直接用浏览器打开 frontend/index.html 或使用 Live Server
