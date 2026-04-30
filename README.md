# WordPress Blog System

> 一个前后端分离的现代博客系统，前端使用 Neon Cyber 风格华丽单页应用，后端基于 Express + SQLite。

## 仓库地址

https://github.com/EchoGG56/wordpress

---

## 项目结构

```
wordpress/
├── frontend/
│   └── index.html          # 单文件前端应用（HTML + CSS + JS 内联）
├── backend/
│   ├── server.js           # Express 主入口，端口 3000
│   ├── package.json        # 后端依赖配置
│   ├── db/
│   │   └── init.js         # SQLite 数据库初始化 & 建表
│   ├── middleware/
│   │   └── auth.js         # JWT 认证中间件
│   └── routes/
│       ├── auth.js         # 用户认证路由（注册/登录/个人信息）
│       └── posts.js        # 文章 CRUD 路由
├── CODE_PLAN.md            # 原始代码计划
├── .gitignore
└── README.md               # 本文件
```

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 原生 HTML/CSS/JS | 单文件，Neon Cyber 深色主题，Hash 路由 |
| 后端 | Node.js + Express | RESTful API，端口 3000 |
| 数据库 | SQLite (better-sqlite3) | WAL 模式，零配置 |
| 认证 | JWT (jsonwebtoken) | Bearer Token，7天有效期 |
| 密码 | bcryptjs | Salt rounds: 10 |
| 跨域 | cors | 全开放（开发环境） |

---

## 快速启动

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 启动后端服务

```bash
cd backend
node server.js
# 输出: Server running on http://localhost:3000
```

### 3. 启动前端

用任意静态服务器托管 `frontend/` 目录：

```bash
cd frontend
python3 -m http.server 8080
# 访问: http://localhost:8080
```

或直接用浏览器打开 `frontend/index.html`（部分功能可能受限于 CORS）。

---

## 数据库设计

共 5 张表，首次启动自动创建：

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户表 | id, username, email, password_hash, avatar, created_at |
| `posts` | 文章表 | id, title, content, excerpt, cover_image, author_id, category_id, status, created_at |
| `categories` | 分类表 | id, name, slug |
| `tags` | 标签表 | id, name |
| `post_tags` | 文章-标签关联 | post_id, tag_id (联合主键) |

**默认分类**：技术(tech)、生活(life)、随笔(essay)

**数据库文件**：`backend/blog.db`（已 gitignore，首次启动自动生成）

---

## API 接口

基础地址：`http://localhost:3000/api`

### 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 注册 | 否 |
| POST | `/auth/login` | 登录 | 否 |
| GET | `/auth/me` | 获取当前用户 | 是 |

**注册请求体**：
```json
{ "username": "...", "email": "...", "password": "..." }
```

**登录请求体**：
```json
{ "email": "...", "password": "..." }
```

**返回格式**：
```json
{ "token": "JWT_TOKEN", "user": { "id": 1, "username": "...", "email": "..." } }
```

### 文章相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/posts` | 文章列表（分页） | 否 |
| GET | `/posts/:id` | 文章详情 | 否 |
| POST | `/posts` | 创建文章 | 是 |
| PUT | `/posts/:id` | 更新文章 | 是（作者本人） |
| DELETE | `/posts/:id` | 删除文章 | 是（作者本人） |

**查询参数**：`page`, `limit`, `category`, `status`

**创建文章请求体**：
```json
{
  "title": "文章标题",
  "content": "文章内容",
  "excerpt": "摘要（可选）",
  "cover_image": "封面URL（可选）",
  "category_id": 1,
  "status": "published",
  "tags": ["标签1", "标签2"]
}
```

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/categories` | 获取所有分类 |
| GET | `/stats` | 统计信息（文章数/用户数/分类数） |

### 认证方式

请求头携带 JWT Token：
```
Authorization: Bearer <token>
```

---

## 前端架构

### 页面模块

- **导航栏**：Logo + 导航链接 + 主题切换 + 登录/头像
- **Hero 区域**：全屏 Banner 带粒子动画
- **文章列表**：Grid 卡片布局，支持分类筛选
- **文章详情**：基于 Hash 路由 (`#post-{id}`)
- **管理后台**：文章创建/管理面板 (`#admin`)
- **登录/注册**：弹窗 Modal
- **Footer**：站点信息

### 设计风格

- **主题色**：Midnight Navy (#0a0e1a) + Cyan (#00f5ff) + Magenta (#ff00e5)
- **效果**：毛玻璃(backdrop-filter)、CSS 粒子动画、渐变边框、发光 Hover
- **动画**：Intersection Observer 滚动入场动画
- **响应式**：移动端适配

### API 通信层

前端内置完整 API 调用逻辑：
- `api(endpoint, options)` — 统一请求封装（自动附加 Token）
- `handleLogin/handleRegister` — 认证处理
- `loadPostsFromAPI` — 加载文章（后端离线时降级为本地假数据）
- `handleCreatePost/deletePost` — 文章管理
- `showToast(message, type)` — 操作反馈通知

---

## 开发指南

### 环境要求

- Node.js >= 16
- npm >= 8

### 新增 API 路由

1. 在 `backend/routes/` 创建路由文件
2. 在 `backend/server.js` 中挂载：
   ```javascript
   app.use('/api/xxx', require('./routes/xxx'));
   ```
3. 需要认证的路由使用 `auth` 中间件：
   ```javascript
   const auth = require('../middleware/auth');
   router.post('/', auth, (req, res) => { ... });
   ```

### 新增数据库表

在 `backend/db/init.js` 的 `db.exec()` 中添加建表语句。

### 前端修改

直接编辑 `frontend/index.html`，所有样式和脚本均内联。

### JWT Secret

位于 `backend/middleware/auth.js`：
```
JWT_SECRET = 'wordpress-blog-secret-key-2024'
```
生产环境应改为环境变量。

---

## 已知限制 & TODO

- [ ] 前端为单文件，规模增长后应拆分为组件化架构
- [ ] JWT Secret 硬编码，需改为 `.env` 环境变量
- [ ] CORS 全开放，生产环境需限制 origin
- [ ] 无文件上传功能（封面图仅存 URL）
- [ ] 无评论系统
- [ ] 无搜索功能
- [ ] 无文章编辑器（富文本/Markdown）
- [ ] 无分页 UI 组件

---

## Git 提交历史

```
bc7c707 feat: 添加前端API通信层，实现前后端完整对接
7b9e2e7 feat: 初始化博客系统 - 前端原型 + 后端API + SQLite
```
