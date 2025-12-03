# Render 部署指南 - AI Pulse Daily

> 完全免费部署，包含性能优化配置

## 目录

- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [性能优化](#性能优化)
- [故障排查](#故障排查)

---

## 快速开始

### 优势

- ✅ **永久免费** - 不需要信用卡
- ✅ **自动部署** - Git push 自动触发
- ✅ **免费数据库** - PostgreSQL + Redis
- ⚠️ **启动较慢** - 15分钟不活跃会休眠

### 3步快速部署

#### 1️⃣ 创建服务（5分钟）

1. 访问 https://render.com 并登录
2. 创建 PostgreSQL 数据库（Free 计划）
3. 创建 Redis 实例（Free 计划）
4. 创建 Web Service 连接 GitHub 仓库

#### 2️⃣ 配置环境变量（2分钟）

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<PostgreSQL Internal URL>
REDIS_HOST=<Redis Host>
REDIS_PORT=6379
GLM_API_KEY=你的API密钥
JWT_SECRET=你的JWT密钥
CORS_ORIGIN=https://你的用户名.github.io
```

#### 3️⃣ 运行数据库迁移（3分钟）

```bash
# 在 Render Shell 中执行
cd apps/api
npx prisma migrate deploy
```

---

## 详细步骤

### 第一部分：创建数据库

#### 步骤 1：创建 PostgreSQL

1. 点击 **New +** → **PostgreSQL**
2. 配置：
   - Name: `aipush-db`
   - Database: `aipush`
   - Region: Singapore（选择最近的）
   - Plan: **Free**
3. 点击 **Create Database**
4. **复制 Internal Database URL**（重要：不要复制 External URL）

#### 步骤 2：创建 Redis

1. 点击 **New +** → **Redis**
2. 配置：
   - Name: `aipush-redis`
   - Region: Singapore（与数据库相同）
   - Plan: **Free**
3. 点击 **Create Redis**
4. 记录 Internal Redis URL 和 Hostname

### 第二部分：部署后端

#### 步骤 3：创建 Web Service

1. 点击 **New +** → **Web Service**
2. 连接 GitHub 仓库
3. 配置：
   - Name: `aipush-backend`
   - Region: Singapore
   - Branch: `main`
   - Runtime: `Node`
   - Build Command:
     ```bash
     cd apps/api && npm install -g pnpm && pnpm install && pnpm build
     ```
   - Start Command:
     ```bash
     cd apps/api && pnpm start:prod
     ```
   - Plan: **Free**

#### 步骤 4：配置环境变量

在 Environment 标签页添加：

```env
NODE_ENV=production
PORT=4000
GLM_API_KEY=你的GLM API密钥
JWT_SECRET=你的JWT密钥（建议32位随机字符串）
DATABASE_URL=postgresql://user:pass@host/db
REDIS_HOST=red-xxxxx.render.com
REDIS_PORT=6379
CORS_ORIGIN=https://你的用户名.github.io
```

#### 步骤 5：初始化数据库

部署完成后，使用 Render Shell：

```bash
cd apps/api
npx prisma migrate deploy
```

### 第三部分：配置前端

#### 步骤 6：GitHub Secret

1. GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加 Secret：
   - Name: `VITE_API_URL`
   - Value: `https://your-api.onrender.com/api/v1`

#### 步骤 7：启用 GitHub Pages

1. Settings → Pages
2. Source: **GitHub Actions**
3. 保存

#### 步骤 8：部署前端

```bash
git add .
git commit -m "feat: configure Render deployment"
git push origin main
```

#### 步骤 9：更新 CORS

等待 GitHub Pages 部署完成后，更新 Render 的 `CORS_ORIGIN`：

```
CORS_ORIGIN=https://你的用户名.github.io
```

---

## 性能优化

### 应用数据库迁移

代码已包含性能优化（commit: 6632d1d），需要应用数据库迁移：

```bash
# Render Shell
cd apps/api
npx prisma migrate deploy
```

### 优化效果

| 操作 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首页加载（缓存） | 200ms | **55ms** | ⬇72% |
| 搜索查询 | 600-2000ms | **100ms** | ⬇85% |
| 分类筛选 | 200-300ms | **55-100ms** | ⬇70% |

### 性能测试

```bash
# Windows
test-performance.bat https://your-api.onrender.com

# Linux/Mac
./test-performance.sh https://your-api.onrender.com
```

### 防止服务休眠

#### 方法1：UptimeRobot（推荐）

1. 访问 https://uptimerobot.com
2. 创建 HTTP(s) 监控
3. URL: `https://your-api.onrender.com/api/health`
4. 间隔: 5分钟

#### 方法2：GitHub Actions

创建 `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Alive

on:
  schedule:
    - cron: "*/10 * * * *"

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -f https://your-api.onrender.com/api/health
```

---

## 故障排查

### 数据库连接失败

```bash
# 检查 DATABASE_URL 是否正确
# 必须使用 Internal URL，格式：
postgresql://user:pass@dpg-xxxxx-a/database

# 不要使用 External URL
```

### CORS 错误

```bash
# 确保 CORS_ORIGIN 正确
CORS_ORIGIN=https://username.github.io
# 注意：不要末尾加斜杠
```

### 性能未提升

```sql
-- 验证索引已创建
SELECT indexname FROM pg_indexes WHERE tablename = 'news';

-- 应该看到：
-- news_search_vector_idx
-- news_category_published_at_idx
-- news_region_published_at_idx
-- news_trending_impact_published_idx
```

### 迁移失败

```bash
# 手动执行迁移 SQL
# 连接到 Render PostgreSQL
psql <External Database URL>

# 执行迁移文件
\i apps/api/prisma/migrations/20251202_add_search_indexes/migration.sql
```

### 服务响应慢

- Render Free 服务休眠后首次访问需要 30 秒唤醒
- 解决方案：使用 UptimeRobot 保持活跃
- 或升级到付费计划（$7/月）

---

## 验证清单

- [ ] 后端健康检查通过: `GET /api/health` 返回 `{" status":"ok"}`
- [ ] API 文档可访问: `GET /api/docs`
- [ ] AI 新闻生成正常: `GET /api/v1/news/ai/generate?count=5`
- [ ] 前端可以访问: GitHub Pages URL
- [ ] 缓存工作正常: 第二次请求 < 100ms
- [ ] 搜索性能正常: < 200ms
- [ ] 数据库索引已创建（4个新索引）

---

## 成本说明

| 服务 | 费用 | 说明 |
|------|------|------|
| PostgreSQL | 免费 | 512MB 存储 |
| Redis | 免费 | 25MB 内存 |
| Web Service | 免费 | 512MB RAM, 15分钟休眠 |
| **总计** | **$0/月** | ✅ 完全免费 |

付费升级选项：
- **Starter ($7/月)**: 不休眠，更多资源
- **Standard ($25/月)**: 生产级性能

---

## 相关文档

- [性能优化详情](./PERFORMANCE.md)
- [新闻采集说明](./采集新闻数据说明.md)
- [Docker 本地开发](./QUICKSTART.md)

---

**部署时间**: < 15 分钟
**难度**: 简单
**风险**: 低

需要帮助？查看 [Render 官方文档](https://render.com/docs)
