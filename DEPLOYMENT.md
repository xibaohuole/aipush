# 部署指南 - Railway + GitHub Pages

本项目采用前后端分离部署：
- **前端**: GitHub Pages（自动部署）
- **后端**: Railway（需要手动配置）

---

## 🚀 后端部署到 Railway

### 方式一：通过 Railway CLI（推荐）

#### 1. 安装 Railway CLI

```bash
# Windows (使用 npm)
npm install -g @railway/cli

# macOS (使用 Homebrew)
brew install railway

# 验证安装
railway --version
```

#### 2. 登录 Railway

```bash
railway login
```

这会打开浏览器进行认证。

#### 3. 初始化项目

```bash
# 在项目根目录执行
railway init

# 选择 "Create a new project"
# 输入项目名称，例如：aipush-backend
```

#### 4. 添加数据库服务

```bash
# 添加 PostgreSQL
railway add --database postgres

# 添加 Redis
railway add --database redis
```

Railway 会自动创建数据库并设置 `DATABASE_URL` 和 `REDIS_URL` 环境变量。

#### 5. 配置环境变量

```bash
# 手动设置其他环境变量
railway variables set GLM_API_KEY="2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM"
railway variables set JWT_SECRET="aipush-super-secret-jwt-key-production-change-this"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"

# 等待 GitHub Pages URL 后设置 CORS（见步骤 7）
# railway variables set CORS_ORIGIN="https://你的用户名.github.io"
```

#### 6. 部署后端

```bash
railway up
```

部署完成后，Railway 会给你一个 URL，例如：
```
https://aipush-backend-production.up.railway.app
```

#### 7. 配置 CORS（重要！）

获取你的 GitHub Pages URL 后，设置 CORS：

```bash
# 替换为你的 GitHub Pages 域名
railway variables set CORS_ORIGIN="https://你的用户名.github.io"

# 或者自定义域名
railway variables set CORS_ORIGIN="https://your-custom-domain.com"
```

#### 8. 运行数据库迁移

```bash
# 连接到 Railway 项目
railway run pnpm --filter @aipush/api prisma:migrate:deploy

# 或者查看数据库
railway run pnpm --filter @aipush/api prisma:studio
```

---

### 方式二：通过 Railway Dashboard（Web 界面）

#### 1. 访问 Railway

打开 https://railway.app 并登录（使用 GitHub 账号）

#### 2. 创建新项目

1. 点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 选择你的仓库 `aipush`
4. Railway 会自动检测项目

#### 3. 配置构建设置

在项目设置中：

- **Root Directory**: `/`
- **Build Command**: `cd apps/api && pnpm install && pnpm build`
- **Start Command**: `cd apps/api && pnpm start:prod`
- **Watch Paths**: `apps/api/**`

#### 4. 添加数据库

1. 点击 **New** → **Database** → **Add PostgreSQL**
2. 点击 **New** → **Database** → **Add Redis**

Railway 会自动设置 `DATABASE_URL` 和 `REDIS_URL`。

#### 5. 配置环境变量

在 **Variables** 标签页添加：

```env
GLM_API_KEY=2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM
JWT_SECRET=aipush-super-secret-jwt-key-production-change-this
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://你的用户名.github.io
```

#### 6. 部署

点击 **Deploy** 按钮，Railway 会自动构建和部署。

#### 7. 获取后端 URL

部署成功后，在 **Settings** → **Domains** 中：
1. 点击 **Generate Domain** 生成 Railway 提供的免费域名
2. 或者添加自定义域名

你会得到类似这样的 URL：
```
https://aipush-backend-production.up.railway.app
```

---

## 🌐 配置 GitHub Pages（前端）

### 1. 设置 GitHub Secret

1. 进入你的 GitHub 仓库
2. **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://你的railway域名/api/v1`

   例如：`https://aipush-backend-production.up.railway.app/api/v1`

### 2. 启用 GitHub Pages

1. **Settings** → **Pages**
2. **Source**: 选择 **GitHub Actions**
3. 保存

### 3. 触发部署

推送代码到 main 分支会自动触发部署：

```bash
git add .
git commit -m "chore: configure Railway deployment"
git push origin main
```

---

## ✅ 验证部署

### 1. 测试后端 API

```bash
# 健康检查
curl https://你的railway域名/api/health

# 测试 AI 新闻生成
curl https://你的railway域名/api/v1/news/ai/generate?count=5

# 访问 API 文档
https://你的railway域名/api/docs
```

### 2. 测试前端

访问你的 GitHub Pages URL：
```
https://你的用户名.github.io/aipush
```

打开浏览器开发者工具，检查：
1. Network 标签页 - 确认请求发送到 Railway 后端
2. Console - 检查是否有 CORS 错误

---

## 🔧 常见问题

### 1. CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**解决方法**:
```bash
# 确保 CORS_ORIGIN 设置正确
railway variables set CORS_ORIGIN="https://你的github-pages域名"

# 重启服务
railway restart
```

### 2. 数据库连接失败

**症状**: 后端日志显示数据库连接错误

**解决方法**:
```bash
# 检查 DATABASE_URL 是否设置
railway variables

# 重新生成 Prisma 客户端
railway run pnpm --filter @aipush/api prisma:generate
railway run pnpm --filter @aipush/api prisma:migrate:deploy
```

### 3. 环境变量未生效

**症状**: API 返回 "GLM API key not configured"

**解决方法**:
```bash
# 检查所有环境变量
railway variables

# 确认 GLM_API_KEY 已设置
railway variables set GLM_API_KEY="你的密钥"

# 重启服务
railway restart
```

### 4. 构建失败

**症状**: Railway 部署失败

**解决方法**:
```bash
# 检查 railway.toml 配置
# 确保 buildCommand 正确
# 查看 Railway 构建日志找到具体错误
```

---

## 📊 监控和日志

### 查看实时日志

```bash
# Railway CLI
railway logs

# 或在 Railway Dashboard
# 项目页面 → Deployments → 点击部署 → View Logs
```

### 性能监控

Railway 提供内置监控：
- CPU 使用率
- 内存使用率
- 网络流量
- 请求延迟

访问 Railway Dashboard 查看。

---

## 💰 成本估算

### Railway 免费额度（截至 2025）

- **每月免费**: $5 美元额度
- **自动休眠**: 不活跃服务会自动休眠
- **数据库**: 包含在免费额度内

### 预估使用量

| 服务 | 预估成本 |
|------|---------|
| 后端 API (1 实例) | ~$3-4/月 |
| PostgreSQL | ~$1-2/月 |
| Redis | ~$0.5-1/月 |
| **总计** | ~$5/月（在免费额度内）|

**提示**: 如果流量很低，可以启用 "自动休眠" 功能进一步降低成本。

---

## 🔄 持续部署

### 自动部署

Railway 支持 GitHub 集成：
1. 推送到 main 分支自动触发部署
2. 可以设置特定分支或 PR 部署

### 手动部署

```bash
# 使用 CLI
railway up

# 强制重新构建
railway up --force
```

---

## 📚 参考链接

- [Railway 文档](https://docs.railway.app/)
- [Railway CLI 指南](https://docs.railway.app/develop/cli)
- [Prisma 迁移指南](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 Railway 部署日志
2. 检查环境变量配置
3. 验证数据库连接
4. 查看前端浏览器控制台
5. 提交 GitHub Issue

---

**部署成功后，记得更新 README.md 中的部署链接！** 🎉
