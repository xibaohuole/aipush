# 部署指南 - AI Pulse Daily

> 多平台部署选项，选择最适合你的方式

## 目录

- [快速选择](#快速选择)
- [Render 部署](#render-部署推荐)
- [Railway 部署](#railway-部署)
- [本地开发](#本地开发)

---

## 快速选择

### 平台对比

| 平台 | 费用 | 优势 | 劣势 | 推荐场景 |
|------|------|------|------|----------|
| **Render** | 完全免费 | • 无需信用卡<br>• 永久免费<br>• 自动部署 | • 服务休眠<br>• 启动慢 | ✅ 个人项目<br>✅ 学习演示 |
| **Railway** | $5/月免费额度 | • 快速<br>• 不休眠<br>• 优秀体验 | • 需要信用卡 | ✅ 小型应用<br>✅ 原型项目 |
| **本地开发** | 免费 | • 完全控制<br>• 快速迭代 | • 需要配置环境 | ✅ 开发调试 |

### 推荐方案

- 🆓 **无预算** → **Render**（完全免费）
- 💳 **有信用卡** → **Railway**（更好性能）
- 💻 **开发阶段** → **本地 Docker**（最快）

---

## Render 部署（推荐）

### 快速开始

**部署时间**: 15 分钟 | **难度**: 简单 | **成本**: $0/月

1. **创建账户**: https://render.com
2. **创建服务**: PostgreSQL + Redis + Web Service
3. **配置环境变量**:
   ```env
   DATABASE_URL=<Internal URL>
   REDIS_HOST=<Redis Host>
   GLM_API_KEY=你的API密钥
   CORS_ORIGIN=https://你的用户名.github.io
   ```
4. **运行迁移**:
   ```bash
   npx prisma migrate deploy
   ```

### 详细指南

查看完整文档：**[DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md)**

包含：
- ✅ 详细分步指南
- ✅ 性能优化配置
- ✅ 故障排查
- ✅ 防止休眠方案

---

## Railway 部署

### 快速开始

**部署时间**: 10 分钟 | **难度**: 简单 | **成本**: ~$5/月

#### 方式一：Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 添加数据库
railway add --database postgres
railway add --database redis

# 5. 配置环境变量
railway variables set GLM_API_KEY="你的密钥"
railway variables set JWT_SECRET="你的JWT密钥"
railway variables set NODE_ENV="production"

# 6. 部署
railway up
```

#### 方式二：Web 界面

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 添加 PostgreSQL 和 Redis
4. 配置环境变量
5. 自动部署

### 配置详情

#### Build 设置

```bash
# Build Command
cd apps/api && pnpm install && pnpm build

# Start Command
cd apps/api && pnpm start:prod

# Watch Paths
apps/api/**
```

#### 环境变量

```env
NODE_ENV=production
PORT=4000
GLM_API_KEY=你的GLM API密钥
JWT_SECRET=你的JWT密钥（32位随机字符串）
DATABASE_URL=<Railway 自动生成>
REDIS_URL=<Railway 自动生成>
CORS_ORIGIN=https://你的用户名.github.io
```

### 数据库迁移

```bash
# 使用 Railway CLI
railway run pnpm --filter @aipush/api prisma:migrate:deploy

# 或在 Railway Shell 中
cd apps/api && npx prisma migrate deploy
```

---

## 本地开发

### 快速启动

**启动时间**: 5 分钟（首次）| **难度**: 简单

#### 使用 Docker（推荐）

```bash
# 1. 启动所有服务
scripts\docker-dev.bat start

# 2. 查看状态
scripts\docker-dev.bat status

# 3. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:4000
# API 文档: http://localhost:4000/api/docs
```

### 详细指南

查看完整文档：**[QUICKSTART.md](./QUICKSTART.md)**

包含：
- ✅ Docker 快速启动
- ✅ 常用命令
- ✅ 故障排查
- ✅ 开发工具

---

## 前端部署（GitHub Pages）

### 所有部署方案的前端配置

#### 1. 配置 GitHub Secret

1. GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加 Secret：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url/api/v1`

#### 2. 启用 GitHub Pages

1. **Settings** → **Pages**
2. **Source**: GitHub Actions
3. 保存

#### 3. 推送代码

```bash
git add .
git commit -m "feat: deploy to production"
git push origin main
```

#### 4. 更新 CORS

在后端环境变量中更新：

```env
CORS_ORIGIN=https://你的用户名.github.io
```

---

## 验证部署

### 后端检查

```bash
# 健康检查
curl https://your-api-url/api/health
# 期望: {"status":"ok"}

# API 文档
# 浏览器访问: https://your-api-url/api/docs

# AI 新闻生成
curl https://your-api-url/api/v1/news/ai/generate?count=5
```

### 前端检查

1. 访问 GitHub Pages URL
2. 打开浏览器控制台（F12）
3. 检查 Network 标签 - API 请求成功
4. 检查 Console - 无 CORS 错误
5. 测试功能：刷新新闻、搜索、翻页

---

## 常见问题

### CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**解决方法**:
```bash
# 确保 CORS_ORIGIN 正确设置
CORS_ORIGIN=https://你的用户名.github.io
# 注意：不要末尾加斜杠
```

### 数据库连接失败

**症状**: 后端日志显示数据库错误

**解决方法**:
- 检查 DATABASE_URL 是否正确
- Render: 使用 Internal URL
- Railway: 确认数据库已创建并连接

### 环境变量未生效

**症状**: API 返回配置错误

**解决方法**:
```bash
# 检查所有环境变量
# Render: Environment 标签页
# Railway: railway variables

# 重启服务
# Render: Manual Deploy
# Railway: railway restart
```

---

## 成本估算

### Render（免费方案）

| 服务 | 费用 | 限制 |
|------|------|------|
| PostgreSQL | $0 | 512MB 存储 |
| Redis | $0 | 25MB 内存 |
| Web Service | $0 | 512MB RAM, 15分钟休眠 |
| **总计** | **$0/月** | ✅ 完全免费 |

### Railway

| 服务 | 费用 | 限制 |
|------|------|------|
| 免费额度 | $5/月 | 包含所有服务 |
| 后端 API | ~$3-4 | 1 实例 |
| PostgreSQL | ~$1-2 | 标准配置 |
| Redis | ~$0.5-1 | 标准配置 |
| **总计** | ~**$5/月** | 在免费额度内 |

---

## 下一步

部署完成后：

1. **性能优化**: 参考 [PERFORMANCE.md](./PERFORMANCE.md)
2. **数据采集**: 参考 [采集新闻数据说明.md](./采集新闻数据说明.md)
3. **开发参考**: 参考 [DEV_REFERENCE.md](./DEV_REFERENCE.md)

---

## 相关文档

- [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) - Render 详细指南
- [QUICKSTART.md](./QUICKSTART.md) - 本地开发快速启动
- [PERFORMANCE.md](./PERFORMANCE.md) - 性能优化指南
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查

---

**部署愉快！** 🚀

如有问题，请查看相关文档或提交 Issue。
