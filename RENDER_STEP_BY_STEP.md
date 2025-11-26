# 🎯 Render 部署 - 超详细分步指南

## 第一部分：创建数据库

### 步骤 1：登录 Render

1. 打开浏览器，访问 https://render.com
2. 点击右上角 **Sign In**
3. 选择 **Sign in with GitHub**（推荐）或使用邮箱注册
4. 登录成功后，你会看到 Dashboard（仪表板）

---

### 步骤 2：创建 PostgreSQL 数据库

1. **点击左上角蓝色按钮 "New +"**
2. **选择 "PostgreSQL"**
3. **填写配置**：
   ```
   Name: aipush-db
   Database: aipush
   User: aipush
   Region: Singapore (选择离你最近的)
   PostgreSQL Version: 16 (默认最新版本)
   Datadog API Key: 留空
   Plan: Free (选择免费计划)
   ```
4. **滚动到底部，点击 "Create Database"**
5. **等待 1-2 分钟**，状态从 "Creating" 变为 "Available"

---

### 步骤 3：获取 Internal Database URL

数据库创建完成后，你会自动进入数据库详情页。

**在这个页面上**，你会看到一个标题为 **"Connections"** 的区域，里面有：

```
Connections
├─ Internal Database URL
│  postgresql://aipush_user:randompassword123@dpg-xxxxx-a/aipush
│  [Copy to clipboard 图标]
│
├─ External Database URL
│  postgresql://aipush_user:randompassword123@oregon-postgres.render.com:5432/aipush
│  [Copy to clipboard 图标]
│
└─ PSQL Command
   psql -h dpg-xxxxx-a.oregon-postgres.render.com -U aipush_user aipush
```

**重要**：
- ✅ **复制 "Internal Database URL"** - 第一行的 URL
- ❌ **不要复制 "External Database URL"** - 第二行的 URL

**如何区分**：
- Internal URL 通常以 `postgresql://` 开头，主机名是 `dpg-xxxxx-a` 格式
- External URL 的主机名包含 `.render.com`

**复制方法**：
1. 找到 **"Internal Database URL"** 下面的文本框
2. 点击右边的 **复制图标** （📋）
3. URL 已复制到剪贴板！

**粘贴到记事本保存**：
```
打开记事本，粘贴保存：
DATABASE_URL=postgresql://aipush:xxx@dpg-xxxxx-a/aipush
```

---

### 步骤 4：创建 Redis

1. **再次点击 "New +"**
2. **选择 "Redis"**
3. **填写配置**：
   ```
   Name: aipush-redis
   Region: Singapore (与数据库相同)
   Plan: Free
   Maxmemory Policy: noeviction (默认)
   ```
4. **点击 "Create Redis"**
5. **等待创建完成**

---

### 步骤 5：获取 Redis 连接信息

Redis 创建完成后，进入 Redis 详情页，你会看到：

```
Connections
├─ Internal Redis URL
│  redis://red-xxxxx:6379
│  [Copy to clipboard]
│
└─ External Redis URL
   rediss://red-xxxxx.oregon-postgres.render.com:6379
```

**记录以下信息**（粘贴到记事本）：

1. **复制 Internal Redis URL**: `redis://red-xxxxx:6379`
2. **提取 REDIS_HOST**:
   - 从页面上找到 **Hostname** 字段
   - 通常是：`red-xxxxx.oregon-postgres.render.com`
   - 或者从 Internal URL 中提取 `red-xxxxx` 部分
3. **REDIS_PORT**: `6379`（默认）

在记事本中保存：
```
REDIS_HOST=red-xxxxx.oregon-postgres.render.com
REDIS_PORT=6379
```

---

## 第二部分：部署后端服务

### 步骤 6：创建 Web Service

1. **点击 "New +"**
2. **选择 "Web Service"**
3. **连接 GitHub 仓库**：
   - 如果是第一次，点击 "Connect account" 授权 GitHub
   - 找到并选择你的 `aipush` 仓库
   - 点击 "Connect"

---

### 步骤 7：配置 Web Service

#### Basic 设置：

```
Name: aipush-backend
Region: Singapore (与数据库相同)
Branch: main
Root Directory: (留空)
Runtime: Node
```

#### Build & Deploy 设置：

**Build Command**（完整复制）：
```bash
cd apps/api && npm install -g pnpm && pnpm install && pnpm build
```

**Start Command**（完整复制）：
```bash
cd apps/api && pnpm start:prod
```

#### Instance Type:
```
Plan: Free
```

**先不要点击 "Create Web Service"！继续下一步设置环境变量。**

---

### 步骤 8：添加环境变量

在同一个配置页面，向下滚动找到 **"Environment Variables"** 区域。

#### 方式 A：使用 Key-Value 模式（一个一个添加）

点击 **"Add Environment Variable"**，依次添加：

```
1.
Key: NODE_ENV
Value: production

2.
Key: PORT
Value: 4000

3.
Key: GLM_API_KEY
Value: 2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM

4.
Key: JWT_SECRET
Value: aipush-super-secret-jwt-key-production-change-this

5.
Key: DATABASE_URL
Value: [粘贴步骤3中复制的 Internal Database URL]

6.
Key: REDIS_HOST
Value: [粘贴步骤5中记录的 REDIS_HOST]

7.
Key: REDIS_PORT
Value: 6379

8.
Key: CORS_ORIGIN
Value: https://你的github用户名.github.io
```

**⚠️ 重要**：
- 将第 8 项的 `你的github用户名` 替换为你的实际 GitHub 用户名
- 例如：如果你的 GitHub 是 `github.com/zhangsan`，那么填写：`https://zhangsan.github.io`

#### 方式 B：使用 Raw Editor 模式（一次性粘贴）

点击 **"Add from .env"** 或切换到 **"Raw Editor"**，粘贴以下内容：

```env
NODE_ENV=production
PORT=4000
GLM_API_KEY=2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM
JWT_SECRET=aipush-super-secret-jwt-key-production-change-this
DATABASE_URL=postgresql://aipush:xxx@dpg-xxxxx-a/aipush
REDIS_HOST=red-xxxxx.oregon-postgres.render.com
REDIS_PORT=6379
CORS_ORIGIN=https://你的github用户名.github.io
```

**记得替换**：
- `DATABASE_URL` 的值（粘贴步骤3的 URL）
- `REDIS_HOST` 的值（粘贴步骤5的主机名）
- `CORS_ORIGIN` 的值（替换为你的 GitHub 用户名）

---

### 步骤 9：创建并部署

1. **检查所有配置无误**
2. **点击页面底部的蓝色按钮 "Create Web Service"**
3. **等待部署**（首次部署需要 5-10 分钟）

你会看到实时构建日志：
```
=== Building... ===
=== Installing dependencies ===
=== Running build command ===
=== Build complete ===
=== Starting service ===
=== Service is live ===
```

---

### 步骤 10：获取后端 URL

部署成功后，在页面顶部你会看到：

```
🟢 aipush-backend
   https://aipush-backend.onrender.com
   [Copy URL]
```

**复制这个 URL**（点击右边的复制按钮），保存到记事本：
```
后端 URL: https://aipush-backend.onrender.com
```

---

### 步骤 11：初始化数据库

部署完成后，需要运行数据库迁移。

#### 方法 1：使用 Render Shell（推荐）

1. 在 Web Service 页面，点击右上角 **"Shell"** 标签
2. 等待 Shell 启动（可能需要 10-20 秒）
3. 在命令行中输入：
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```
4. 按回车，等待迁移完成

#### 方法 2：使用本地命令

在你的电脑上（项目目录）运行：

```bash
# Windows
set DATABASE_URL=你的Internal Database URL
cd apps/api
pnpm prisma migrate deploy

# macOS/Linux
export DATABASE_URL=你的Internal Database URL
cd apps/api
pnpm prisma migrate deploy
```

---

## 第三部分：配置前端

### 步骤 12：配置 GitHub Secret

1. **打开 GitHub**，进入你的 `aipush` 仓库
2. **点击 Settings**（设置）标签页
3. **左侧菜单找到 "Secrets and variables"**
4. **点击 "Actions"**
5. **点击绿色按钮 "New repository secret"**
6. **填写**：
   ```
   Name: VITE_API_URL
   Secret: https://aipush-backend.onrender.com/api/v1
   ```
   （替换为步骤10中复制的后端 URL，后面加上 `/api/v1`）
7. **点击 "Add secret"**

---

### 步骤 13：启用 GitHub Pages

1. **仍在 Settings 页面**，左侧菜单找到 **"Pages"**
2. **在 "Source" 下拉菜单中选择 "GitHub Actions"**
3. **保存**（可能会自动保存）

---

### 步骤 14：推送代码触发部署

在你的电脑上（项目目录）运行：

```bash
git add .
git commit -m "feat: configure Render deployment"
git push origin main
```

推送后：
1. **访问 GitHub 仓库的 "Actions" 标签页**
2. **查看部署进度**（通常需要 2-3 分钟）
3. **部署成功后**，你会看到绿色的 ✓ 标记

---

### 步骤 15：获取 GitHub Pages URL

部署成功后：

1. **GitHub 仓库 → Settings → Pages**
2. **页面顶部会显示**：
   ```
   Your site is live at https://你的用户名.github.io/aipush/
   ```
3. **复制这个 URL**

---

### 步骤 16：更新 CORS 设置

如果你之前在步骤8中填写的 CORS_ORIGIN 不准确，现在更新：

1. **回到 Render Dashboard**
2. **选择 aipush-backend 服务**
3. **点击左侧 "Environment" 标签**
4. **找到 CORS_ORIGIN**
5. **更新为**：`https://你的用户名.github.io`（不要包含 /aipush）
6. **点击 "Save Changes"**
7. **服务会自动重启**（等待1-2分钟）

---

## 🎉 完成！测试你的应用

### 测试后端

在浏览器访问：
```
https://aipush-backend.onrender.com/api/health
```

应该看到：
```json
{"status":"ok"}
```

### 测试前端

访问：
```
https://你的用户名.github.io/aipush
```

**首次访问可能需要等待 30 秒**（Render 免费服务唤醒时间）

---

## ✅ 验证清单

完成所有步骤后，检查：

- [ ] 后端 URL 可以访问：`/api/health` 返回 `{"status":"ok"}`
- [ ] API 文档可以访问：`/api/docs` 显示 Swagger 文档
- [ ] AI 新闻生成：`/api/v1/news/ai/generate?count=5` 返回新闻列表
- [ ] 前端可以访问：GitHub Pages URL 打开网站
- [ ] 点击 "Refresh News" 按钮可以加载新闻
- [ ] 浏览器控制台没有 CORS 错误

---

## 🆘 遇到问题？

### 数据库连接失败
- 检查 `DATABASE_URL` 是否使用 **Internal** URL
- 确认已运行 `prisma migrate deploy`

### CORS 错误
- 检查 `CORS_ORIGIN` 是否正确（不要末尾加斜杠）
- 确认是 GitHub Pages 的完整域名

### 服务很慢
- Render 免费服务会休眠，首次访问需要 30 秒唤醒
- 考虑使用 UptimeRobot 保持活跃（参考 RENDER_DEPLOY.md）

### 构建失败
- 查看 Render 的 Logs 标签页
- 确认 Build Command 和 Start Command 正确

---

**需要帮助？欢迎随时询问！**
