FROM docker.m.daocloud.io/library/node:18-alpine

WORKDIR /app

# 安装 better-sqlite3 编译依赖
# x86 构建时 dl-cdn 可能超时，切换到更稳定的镜像源
RUN sed -i 's#https\\?://dl-cdn\\.alpinelinux\\.org/alpine#https://mirrors.aliyun.com/alpine#g' /etc/apk/repositories \
  && apk add --no-cache python3 make g++

# 安装后端依赖（强制从源码编译原生模块）
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --production --build-from-source

# 只复制源码，避免把宿主机的 node_modules 覆盖进镜像
COPY backend/server.js ./backend/
COPY backend/db ./backend/db
COPY backend/middleware ./backend/middleware
COPY backend/routes ./backend/routes
COPY frontend ./frontend

# 环境变量
ENV PORT=8088
ENV NODE_ENV=production

EXPOSE 8088

CMD ["node", "backend/server.js"]
