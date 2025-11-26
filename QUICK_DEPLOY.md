# 🚀 快速部署指南

**目标**: 5 分钟内完成前后端部署

---

## 📋 前置准备

- [x] GitHub 账号
- [x] Railway 账号（使用 GitHub 登录）
- [x] 已安装 Git

---

## 🎯 部署步骤

### 第 1 步：部署后端到 Railway（2 分钟）

#### 方法 A：使用 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 在项目根目录初始化
railway init
# 选择 "Create a new project"
# 项目名: aipush-backend

# 4. 添加数据库
railway add --database postgres
railway add --database redis

# 5. 配置环境变量
railway variables set GLM_API_KEY="2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM"
railway variables set JWT_SECRET="change-this-to-random-string-min-32-chars"
railway variables set NODE_ENV="production"
railway variables set PORT="4000"

# 6. 部署
railway up

# 7. 获取部署 URL
railway domain
# 会显示类似: https://aipush-backend-production.up.railway.app
```

#### 方法 B：使用 Railway Dashboard（Web 界面）

1. 访问 https://railway.app
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择 `aipush` 仓库
4. 添加 PostgreSQL: **New** → **Database** → **PostgreSQL**
5. 添加 Redis: **New** → **Database** → **Redis**
6. 设置环境变量（**Variables** 标签页）：
   ```
   GLM_API_KEY=2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM
   JWT_SECRET=change-this-to-random-string-min-32-chars
   NODE_ENV=production
   PORT=4000
   ```
7. 点击 **Deploy**
8. 在 **Settings** → **Domains** 中点击 **Generate Domain**
9. 复制生成的 URL（例如：`https://aipush-backend-production.up.railway.app`）

---

### 第 2 步：配置前端部署（1 分钟）

1. **复制后端 URL**（从第 1 步获得）

2. **设置 GitHub Secret**:
   - 进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret**
   - 添加：
     - **Name**: `VITE_API_URL`
     - **Value**: `https://你的railway域名/api/v1`

     例如：`https://aipush-backend-production.up.railway.app/api/v1`

3. **启用 GitHub Pages**:
   - **Settings** → **Pages**
   - **Source**: 选择 **GitHub Actions**
   - 保存

---

### 第 3 步：更新 CORS 配置（30 秒）

**获取 GitHub Pages URL** 后（通常是 `https://你的用户名.github.io/aipush`）：

```bash
# 使用 CLI
railway variables set CORS_ORIGIN="https://你的用户名.github.io"

# 或在 Railway Dashboard 的 Variables 页面添加/更新：
# CORS_ORIGIN=https://你的用户名.github.io
```

---

### 第 4 步：触发部署（30 秒）

```bash
git add .
git commit -m "chore: configure production deployment"
git push origin main
```

GitHub Actions 会自动：
1. 构建前端
2. 部署到 GitHub Pages
3. 完成！

---

## ✅ 验证部署

### 1. 测试后端 API

```bash
# 健康检查
curl https://你的railway域名/api/health

# 生成 AI 新闻
curl https://你的railway域名/api/v1/news/ai/generate?count=5

# 访问 API 文档
# 浏览器打开: https://你的railway域名/api/docs
```

### 2. 测试前端

1. 访问你的 GitHub Pages URL：`https://你的用户名.github.io/aipush`
2. 打开浏览器开发者工具（F12）
3. 检查 **Network** 标签页 - 确认请求发送到 Railway 后端
4. 检查 **Console** - 应该没有 CORS 错误
5. 点击 "Refresh News" 按钮 - 应该能看到 AI 生成的新闻

---

## 🔧 常见问题

### ❌ CORS 错误

**症状**: 浏览器显示 "CORS policy" 错误

**解决**:
```bash
railway variables set CORS_ORIGIN="https://你的github-pages域名"
railway restart
```

### ❌ 500 Internal Server Error

**症状**: API 返回 500 错误

**解决**:
```bash
# 检查环境变量
railway variables

# 查看日志
railway logs

# 确认数据库已连接
railway run pnpm --filter @aipush/api prisma:migrate:deploy
```

### ❌ GLM API Key 错误

**症状**: "GLM API key not configured"

**解决**:
```bash
railway variables set GLM_API_KEY="2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM"
railway restart
```

---

## 📊 部署清单

使用此清单确保所有步骤完成：

- [ ] Railway 项目已创建
- [ ] PostgreSQL 数据库已添加
- [ ] Redis 数据库已添加
- [ ] 环境变量已配置（GLM_API_KEY, JWT_SECRET, NODE_ENV, PORT）
- [ ] 后端已部署并获取到 URL
- [ ] GitHub Secret `VITE_API_URL` 已设置
- [ ] GitHub Pages 已启用
- [ ] CORS_ORIGIN 已设置为 GitHub Pages 域名
- [ ] 前端代码已推送触发部署
- [ ] 后端健康检查通过
- [ ] 前端可以访问
- [ ] AI 新闻生成功能正常

---

## 🎉 部署成功！

你的应用现在应该已经在线了：

- **前端**: `https://你的用户名.github.io/aipush`
- **后端 API**: `https://你的railway域名.up.railway.app`
- **API 文档**: `https://你的railway域名.up.railway.app/api/docs`

---

## 📚 下一步

- 查看完整部署文档: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 配置自定义域名
- 设置监控和告警
- 优化性能

---

**需要帮助？** 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细文档。
