# 🚀 Render 部署指南（完全免费）

Render 提供永久免费层，无需信用卡，非常适合个人项目。

## ✨ Render 优势

- ✅ **永久免费** - 不需要信用卡
- ✅ **自动部署** - Git push 自动触发
- ✅ **免费数据库** - PostgreSQL + Redis
- ⚠️ **启动较慢** - 15分钟不活跃会休眠，首次访问需要30秒唤醒

---

## 📋 部署步骤

### 方式 1：通过 Web Dashboard（推荐，最简单）

#### 1. 创建账户

1. 访问 https://render.com
2. 使用 GitHub 账号登录（或注册新账号）

#### 2. 创建 PostgreSQL 数据库

1. 点击 **New +** → **PostgreSQL**
2. 配置：
   - **Name**: `aipush-db`
   - **Database**: `aipush`
   - **User**: `aipush`
   - **Region**: 选择离你最近的（如 Singapore）
   - **Plan**: **Free**
3. 点击 **Create Database**
4. 等待创建完成，**复制 Internal Database URL**（类似：`postgresql://...`）

#### 3. 创建 Redis 实例

1. 点击 **New +** → **Redis**
2. 配置：
   - **Name**: `aipush-redis`
   - **Region**: 与数据库相同
   - **Plan**: **Free**
3. 点击 **Create Redis**
4. 记录 **Internal Redis URL**

#### 4. 部署后端 Web Service

1. 点击 **New +** → **Web Service**
2. 连接你的 GitHub 仓库 `aipush`
3. 配置：

   **Basic Settings**:
   - **Name**: `aipush-backend`
   - **Region**: 与数据库相同
   - **Branch**: `main`
   - **Root Directory**: 留空
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     cd apps/api && npm install -g pnpm && pnpm install && pnpm build
     ```
   - **Start Command**:
     ```bash
     cd apps/api && pnpm start:prod
     ```
   - **Plan**: **Free**

   **Advanced Settings**:
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`

4. 点击 **Environment** 标签页，添加环境变量：

   ```env
   NODE_ENV=production
   PORT=4000
   GLM_API_KEY=2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM
   JWT_SECRET=aipush-super-secret-jwt-key-production-change-this
   DATABASE_URL=<粘贴步骤2中的 Internal Database URL>
   REDIS_HOST=<从 Redis Internal URL 中提取，例如：red-xxx.oregon-postgres.render.com>
   REDIS_PORT=6379
   CORS_ORIGIN=https://你的github用户名.github.io
   ```

   **如何从 Redis URL 提取 REDIS_HOST**:
   ```
   Redis Internal URL: redis://red-xxx:6379
   REDIS_HOST: red-xxx.oregon-postgres.render.com (查看 Redis 详情页)
   REDIS_PORT: 6379
   ```

5. 点击 **Create Web Service**

#### 5. 等待部署完成

- 首次部署需要 5-10 分钟
- 查看 **Logs** 标签页监控进度
- 部署成功后会显示 URL（例如：`https://aipush-backend.onrender.com`）

#### 6. 运行数据库迁移

部署完成后，需要初始化数据库：

1. 在 Web Service 页面，点击 **Shell** 标签页
2. 运行以下命令：
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

或者使用本地命令（设置 DATABASE_URL 环境变量）：
```bash
# Windows
set DATABASE_URL=<你的Render数据库URL>
cd apps/api
pnpm prisma migrate deploy

# macOS/Linux
DATABASE_URL=<你的Render数据库URL> pnpm --filter @aipush/api prisma migrate deploy
```

---

### 方式 2：使用 render.yaml（自动化）

我已经创建了 `render.yaml` 配置文件。使用此方法可以一键部署所有服务：

1. 访问 https://dashboard.render.com
2. 点击 **New +** → **Blueprint**
3. 连接你的 GitHub 仓库
4. Render 会自动检测 `render.yaml`
5. 点击 **Apply**
6. 手动设置这些环境变量（Blueprint 无法自动设置）：
   - `GLM_API_KEY`
   - `CORS_ORIGIN`
7. 部署完成！

---

## 🔧 配置前端（GitHub Pages）

### 1. 获取后端 URL

部署完成后，你会得到类似这样的 URL：
```
https://aipush-backend.onrender.com
```

### 2. 设置 GitHub Secret

1. GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加 Secret：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://aipush-backend.onrender.com/api/v1`

### 3. 更新 CORS

回到 Render Dashboard，更新 `CORS_ORIGIN` 环境变量：
```
CORS_ORIGIN=https://你的github用户名.github.io
```

保存后服务会自动重启。

### 4. 部署前端

```bash
git add .
git commit -m "feat: configure Render deployment"
git push origin main
```

---

## ✅ 验证部署

### 1. 测试后端

```bash
# 健康检查
curl https://aipush-backend.onrender.com/api/health

# AI 新闻生成
curl https://aipush-backend.onrender.com/api/v1/news/ai/generate?count=5

# API 文档
# 浏览器打开: https://aipush-backend.onrender.com/api/docs
```

### 2. 测试前端

访问：`https://你的github用户名.github.io/aipush`

**注意**: 由于免费服务会休眠，首次访问可能需要等待 30 秒左右唤醒。

---

## ⚡ 性能优化

### 防止服务休眠

Render 免费服务在 15 分钟不活跃后会休眠。可以使用以下方法保持活跃：

#### 方法 1：使用 UptimeRobot（推荐）

1. 访问 https://uptimerobot.com（免费）
2. 创建新的监控：
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://aipush-backend.onrender.com/api/health`
   - **Monitoring Interval**: 5 分钟
3. 这样可以让服务保持活跃

#### 方法 2：GitHub Actions 定时 Ping

在 `.github/workflows/` 创建 `keep-alive.yml`：

```yaml
name: Keep Render Service Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # 每 10 分钟
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: |
          curl -f https://aipush-backend.onrender.com/api/health || exit 0
```

---

## 💰 成本对比

| 平台 | 费用 | 优势 | 劣势 |
|------|------|------|------|
| **Render** | 完全免费 | 无需信用卡，永久免费 | 服务会休眠，启动慢 |
| **Railway** | $5/月免费额度 | 快速，不休眠 | 需要信用卡验证 |
| **Vercel** | 免费 | 极快，CDN | 不支持长连接，Serverless 限制 |

---

## 🔍 监控和日志

### 查看实时日志

1. Render Dashboard → 选择服务
2. 点击 **Logs** 标签页
3. 实时查看应用日志

### 性能监控

Render 提供：
- CPU 使用率
- 内存使用率
- 请求延迟
- 健康检查状态

---

## 🆘 常见问题

### Q: 部署失败，显示构建错误？

**A**: 检查构建日志，常见原因：
- pnpm 未安装：确保 Build Command 包含 `npm install -g pnpm`
- 依赖安装失败：检查 `package.json` 是否正确
- 内存不足：Render 免费层有 512MB 限制

### Q: 数据库连接失败？

**A**:
1. 确认 `DATABASE_URL` 使用的是 **Internal Database URL**（不是 External）
2. 确保数据库和 Web Service 在同一区域
3. 运行 Prisma 迁移：`npx prisma migrate deploy`

### Q: Redis 连接失败？

**A**:
1. 使用 **Internal Redis URL**
2. 正确提取 `REDIS_HOST` 和 `REDIS_PORT`
3. 检查环境变量是否正确设置

### Q: CORS 错误？

**A**:
```bash
# 确保 CORS_ORIGIN 设置正确
CORS_ORIGIN=https://你的github用户名.github.io
# 注意：不要在末尾加斜杠 /
```

### Q: 服务响应很慢？

**A**: Render 免费服务会在 15 分钟不活跃后休眠。解决方法：
- 使用 UptimeRobot 保持活跃
- 或接受首次访问需要等待 30 秒的事实
- 或升级到付费计划（$7/月）

---

## 📊 部署清单

- [ ] Render 账户已创建
- [ ] PostgreSQL 数据库已创建
- [ ] Redis 实例已创建
- [ ] Web Service 已配置
- [ ] 所有环境变量已设置
- [ ] 首次部署已完成
- [ ] 数据库迁移已运行
- [ ] 后端 URL 已获取
- [ ] GitHub Secret `VITE_API_URL` 已设置
- [ ] CORS_ORIGIN 已更新
- [ ] 前端已部署
- [ ] 健康检查通过 ✅
- [ ] AI 新闻生成功能正常 ✅
- [ ] （可选）配置 UptimeRobot 防止休眠

---

## 🎉 完成！

你的应用现在应该在 Render 上运行了！

- **前端**: `https://你的用户名.github.io/aipush`
- **后端**: `https://aipush-backend.onrender.com`
- **API 文档**: `https://aipush-backend.onrender.com/api/docs`

---

**需要帮助？** 查看 Render 文档：https://render.com/docs
