# AI Pulse Daily - Enterprise Edition 🚀

> 企业级AI新闻聚合平台 | Enterprise-grade AI News Aggregation Platform

## 📋 项目概述

AI Pulse Daily 已从纯前端应用升级为**完整的企业级应用架构**，采用 Monorepo 架构，实现前后端分离、模块化设计，**确保各模块间完全解耦**。

### ✨ 核心特性

- 🏗️ **企业级架构** - Turborepo Monorepo，模块完全隔离
- 🔐 **完整认证系统** - JWT + OAuth 2.0
- 💾 **PostgreSQL数据库** - 完整schema设计，支持全文搜索
- 🎯 **类型安全** - 全栈TypeScript，共享类型定义
- 📦 **模块化** - 前后端模块完全解耦，独立开发部署
- 🚄 **高性能** - Redis缓存、数据库优化、请求限流
- 📚 **API文档** - Swagger/OpenAPI自动生成
- 🐳 **容器化** - Docker支持，易于部署

---

## 🛠️ 技术栈

### 前端
```
React 19 + TypeScript + Vite
├── 状态管理: Zustand
├── 数据获取: TanStack Query
├── 表单: React Hook Form + Zod
└── 样式: Tailwind CSS
```

### 后端
```
NestJS 11 + TypeScript
├── 数据库: PostgreSQL 16 + Prisma 6
├── 缓存: Redis
├── 认证: JWT + Passport
└── 文档: Swagger
```

### 基础设施
```
Turborepo + pnpm
├── 容器化: Docker
├── CI/CD: GitHub Actions
└── 部署: Kubernetes (计划中)
```

---

## 📁 项目结构

```
aipush/
├── apps/                         # 应用层
│   ├── web/                      # ✅ 前端应用
│   ├── api/                      # ✅ 后端API
│   └── admin/                    # ⏳ 管理后台
│
├── packages/                     # 共享包
│   ├── types/                    # ✅ TypeScript类型
│   ├── utils/                    # ✅ 工具函数
│   ├── api-client/               # ✅ API客户端SDK
│   ├── ui/                       # ⏳ UI组件库
│   └── config/                   # ✅ 共享配置
│
├── database/                     # 数据库
│   ├── schema.sql                # ✅ PostgreSQL Schema
│   ├── prisma/schema.prisma      # ✅ Prisma Schema
│   ├── migrations/               # 迁移文件
│   └── seeds/                    # 种子数据
│
├── turbo.json                    # ✅ Turborepo配置
├── pnpm-workspace.yaml           # ✅ pnpm工作区
└── package.json                  # ✅ 根配置
```

---

## 🗄️ 数据库设计

### 核心表结构

| 表名 | 说明 | 主要字段 |
|-----|------|---------|
| `users` | 用户账户 | email, username, role, preferences |
| `news` | 新闻文章 | title, summary, category, region, impactScore |
| `bookmarks` | 用户书签 | userId, newsId, notes, tags |
| `comments` | 评论系统 | userId, newsId, parentId, content, likes |
| `daily_summaries` | 每日摘要 | date, headline, keyTakeaways, audioUrl |
| `user_activities` | 行为追踪 | eventType, entityType, entityId |

### 数据库特性

✅ **全文搜索** (pg_trgm)
✅ **软删除支持**
✅ **自动时间戳**
✅ **触发器自动计数** (浏览/书签/分享/评论)
✅ **推荐算法视图**
✅ **趋势新闻视图**

---

## 🚀 快速开始

### 1. 环境要求

```bash
Node.js >= 20.0.0
pnpm >= 9.0.0
PostgreSQL >= 16
Redis >= 7
```

### 2. 安装依赖

```bash
# 安装pnpm
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 3. 配置环境变量

创建 `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aipush"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GLM AI (智谱AI)
GLM_API_KEY="your-glm-api-key"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Ports
PORT=4000
```

### 4. 初始化数据库

```bash
cd apps/api

# 生成Prisma客户端
pnpm prisma:generate

# 运行迁移
pnpm prisma:migrate

# 查看数据库
pnpm prisma:studio
```

### 5. 启动开发服务器

```bash
# 返回根目录
cd ../..

# 启动所有服务
pnpm dev

# 前端: http://localhost:3000
# 后端: http://localhost:4000
# API文档: http://localhost:4000/api/docs
```

---

## 📡 API文档

访问 Swagger 文档: **http://localhost:4000/api/docs**

### 主要端点

#### 🔐 认证 `/api/auth`
```http
POST   /auth/register        # 注册
POST   /auth/login           # 登录
POST   /auth/logout          # 登出
POST   /auth/refresh         # 刷新Token
GET    /auth/me              # 当前用户
GET    /auth/google          # Google OAuth
```

#### 📰 新闻 `/api/news`
```http
GET    /news                 # 列表 (分页/过滤)
GET    /news/:id             # 详情
POST   /news                 # 创建
PATCH  /news/:id             # 更新
DELETE /news/:id             # 删除
GET    /news/trending        # 趋势
GET    /news/search?q=       # 搜索
```

#### 🔖 书签 `/api/bookmarks`
```http
GET    /bookmarks            # 用户书签
POST   /bookmarks            # 添加
DELETE /bookmarks/:id        # 删除
```

#### 💬 评论 `/api/comments`
```http
GET    /news/:newsId/comments    # 获取评论
POST   /news/:newsId/comments    # 发表评论
PATCH  /comments/:id             # 编辑
DELETE /comments/:id             # 删除
POST   /comments/:id/like        # 点赞
```

---

## 🏗️ 架构设计

### 模块隔离原则

每个模块**完全独立**，互不干扰：

```
┌─────────────┬─────────────┬─────────────┐
│  新闻模块    │  用户模块    │  社交模块    │
│  - 独立路由  │  - 独立路由  │  - 独立路由  │
│  - 独立状态  │  - 独立状态  │  - 独立状态  │
│  - 独立API   │  - 独立API   │  - 独立API   │
└─────────────┴─────────────┴─────────────┘
         ↓             ↓             ↓
    ┌────────────────────────────────────┐
    │      共享层 (Types, Utils, UI)      │
    └────────────────────────────────────┘
```

### 数据流

```
前端组件 → TanStack Query → API Client → NestJS Controller
    ↓                                           ↓
  Zustand Store                        Service Layer
                                              ↓
                                    Prisma (Database)
                                              ↓
                                        PostgreSQL
```

---

## 🔒 安全措施

- ✅ **Helmet.js** - 安全HTTP头
- ✅ **CORS配置** - 跨域保护
- ✅ **Rate Limiting** - 请求限流
- ✅ **JWT认证** - 无状态认证
- ✅ **密码哈希** - bcryptjs加密
- ✅ **SQL注入防护** - Prisma ORM
- ✅ **XSS防护** - 输入验证
- ✅ **Class Validator** - DTO验证

---

## 🐳 Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f api web

# 停止服务
docker-compose down
```

---

## 📊 项目进度

### ✅ Phase 1 - 基础架构 (已完成)
- [x] Monorepo架构搭建
- [x] 数据库设计 (PostgreSQL + Prisma)
- [x] NestJS后端框架
- [x] 共享包系统 (Types, Utils, API Client)
- [x] API文档 (Swagger)

### 🔄 Phase 2 - 核心功能 (进行中)
- [ ] Docker开发环境
- [ ] 完整认证系统 (JWT + OAuth)
- [ ] 前端代码迁移
- [ ] UI组件库

### ⏳ Phase 3 - 业务功能 (计划中)
- [ ] 新闻抓取服务
- [ ] 实时通知 (WebSocket)
- [ ] 推荐算法
- [ ] 管理后台

### ⏳ Phase 4 - 生产就绪 (计划中)
- [ ] 单元测试 + E2E测试
- [ ] 性能优化
- [ ] 监控告警 (Prometheus + Grafana)
- [ ] Kubernetes部署

---

## 📝 开发规范

### 代码规范
```bash
# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 格式化
pnpm format
```

### Git 提交规范
```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建/工具
```

---

## 🤝 贡献指南

1. Fork 项目
2. 创建分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

MIT License

---

## 📚 文档导航

### 快速开始
- **[本地开发](./QUICKSTART.md)** - Docker 快速启动
- **[部署指南](./DEPLOYMENT.md)** - 多平台部署选项

### 部署文档
- **[Render 部署](./DEPLOYMENT_RENDER.md)** - 免费云部署（推荐）
- **[Railway 部署](./DEPLOYMENT.md#railway-部署)** - 快速云部署

### 技术文档
- **[性能优化](./PERFORMANCE.md)** - 性能提升 72-85%
- **[新闻采集](./采集新闻数据说明.md)** - 数据采集说明

### 开发参考
- **[开发参考](./DEV_REFERENCE.md)** - 快速参考指南
- **[组件分析](./DEV_COMPONENTS.md)** - 组件详细分析
- **[故障排查](./TROUBLESHOOTING.md)** - 常见问题解决

### 维护指南
- **[文档维护](./DOCS_GUIDE.md)** - 文档维护规范

---

## 👨‍💻 维护者

- **Email**: support@aipulsedaily.com
- **GitHub**: [AI Pulse Daily](https://github.com/your-repo)

---

<div align="center">

**Built with ❤️ using NestJS, React, and PostgreSQL**

</div>
