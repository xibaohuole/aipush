# Docker 开发环境指南

## 📋 前置要求

确保你已经安装了以下软件：

- **Docker Desktop** (包含 Docker 和 Docker Compose)
  - Windows: [下载地址](https://www.docker.com/products/docker-desktop)
  - 最低版本: Docker 20.10+, Docker Compose 2.0+

检查安装：
```bash
docker --version
docker-compose --version
```

---

## 🚀 快速开始

### 1. 环境配置

首次运行时，脚本会自动从 `.env.example` 创建 `.env.local`：

```bash
# Windows
scripts\docker-dev.bat start

# Linux/Mac
chmod +x scripts/docker-dev.sh
./scripts/docker-dev.sh start
```

**重要**: 编辑 `.env.local` 并设置必要的值：
```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
POSTGRES_PASSWORD=change-this-password
JWT_SECRET=your-secret-key-min-32-characters-long
```

### 2. 启动所有服务

```bash
# Windows
scripts\docker-dev.bat start

# Linux/Mac
./scripts/docker-dev.sh start
```

这将启动：
- ✅ PostgreSQL (localhost:5432)
- ✅ Redis (localhost:6379)
- ✅ Backend API (localhost:4000)
- ✅ Frontend Web (localhost:3000)

### 3. 访问应用

打开浏览器访问：

| 服务 | URL |
|-----|-----|
| **前端应用** | http://localhost:3000 |
| **后端API** | http://localhost:4000 |
| **API文档 (Swagger)** | http://localhost:4000/api/docs |
| **健康检查** | http://localhost:4000/api/health |

---

## 📚 常用命令

### 基础操作

```bash
# 启动所有服务(后台运行)
scripts\docker-dev.bat start

# 启动并显示日志
scripts\docker-dev.bat start-logs

# 停止所有服务
scripts\docker-dev.bat stop

# 重启所有服务
scripts\docker-dev.bat restart

# 查看服务状态
scripts\docker-dev.bat status
```

### 查看日志

```bash
# 查看所有服务日志
scripts\docker-dev.bat logs

# 查看特定服务日志
scripts\docker-dev.bat logs api
scripts\docker-dev.bat logs web
scripts\docker-dev.bat logs postgres
scripts\docker-dev.bat logs redis
```

### 数据库操作

```bash
# 运行数据库迁移
scripts\docker-dev.bat migrate

# 生成Prisma客户端
scripts\docker-dev.bat prisma-gen

# 打开Prisma Studio (数据库GUI)
scripts\docker-dev.bat prisma-studio
# 然后访问: http://localhost:5555

# 数据库种子(填充测试数据)
scripts\docker-dev.bat seed
```

### 开发调试

```bash
# 进入API容器shell
scripts\docker-dev.bat shell api

# 进入Web容器shell
scripts\docker-dev.bat shell web

# 进入PostgreSQL容器
scripts\docker-dev.bat shell postgres
```

### 重建与清理

```bash
# 重新构建所有镜像
scripts\docker-dev.bat build

# 清理所有容器和数据 (⚠️ 谨慎使用)
scripts\docker-dev.bat clean
```

---

## 🔧 手动 Docker Compose 命令

如果你想直接使用 `docker-compose`：

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api

# 重启服务
docker-compose restart api

# 进入容器
docker-compose exec api sh

# 查看运行中的容器
docker-compose ps

# 启动Prisma Studio
docker-compose --profile tools up -d prisma-studio
```

---

## 🐛 故障排查

### 问题 1: 端口已被占用

**错误**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**解决方案**:
1. 检查占用端口的进程：
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```

2. 修改 `.env.local` 中的端口：
   ```env
   WEB_PORT=3001
   API_PORT=4001
   ```

### 问题 2: 数据库连接失败

**错误**: `Can't reach database server`

**解决方案**:
1. 确保 PostgreSQL 容器正在运行：
   ```bash
   docker-compose ps postgres
   ```

2. 检查数据库日志：
   ```bash
   docker-compose logs postgres
   ```

3. 验证 DATABASE_URL 配置正确

### 问题 3: 容器无法启动

**错误**: `Container exited with code 1`

**解决方案**:
1. 查看容器日志：
   ```bash
   docker-compose logs api
   ```

2. 重新构建镜像：
   ```bash
   scripts\docker-dev.bat build
   scripts\docker-dev.bat start
   ```

3. 清理并重新开始：
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### 问题 4: Prisma 迁移失败

**错误**: `Migration engine error`

**解决方案**:
1. 重新生成 Prisma 客户端：
   ```bash
   scripts\docker-dev.bat prisma-gen
   ```

2. 重置数据库 (⚠️ 会删除所有数据):
   ```bash
   docker-compose down -v
   docker-compose up -d postgres redis
   scripts\docker-dev.bat migrate
   ```

### 问题 5: 文件更改不生效

**问题**: 修改代码后容器没有热重载

**解决方案**:
1. 确保 volumes 挂载正确 (查看 docker-compose.yml)
2. 重启服务：
   ```bash
   scripts\docker-dev.bat restart
   ```

---

## 🔍 Docker Compose 服务说明

### postgres
- **镜像**: postgres:16-alpine
- **端口**: 5432
- **数据持久化**: postgres_data volume
- **健康检查**: pg_isready

### redis
- **镜像**: redis:7-alpine
- **端口**: 6379
- **数据持久化**: redis_data volume
- **密码**: 通过 REDIS_PASSWORD 设置 (可选)

### api (后端)
- **构建**: apps/api/Dockerfile
- **端口**: 4000
- **依赖**: postgres, redis
- **热重载**: 支持 (volume 挂载)
- **健康检查**: /api/health 端点

### web (前端)
- **构建**: apps/web/Dockerfile
- **端口**: 3000
- **依赖**: api
- **热重载**: 支持 (volume 挂载)

### prisma-studio (可选)
- **端口**: 5555
- **启动**: `docker-compose --profile tools up -d prisma-studio`
- **用途**: 数据库可视化管理

---

## 📦 生产环境部署

生产环境使用不同的配置：

```bash
# 构建生产镜像
docker-compose -f docker-compose.prod.yml build

# 启动生产服务
docker-compose -f docker-compose.prod.yml up -d
```

生产环境特性：
- ✅ 多阶段构建优化镜像大小
- ✅ 非 root 用户运行
- ✅ Nginx 静态文件服务
- ✅ 健康检查
- ✅ 资源限制
- ✅ 日志管理

---

## 🎯 最佳实践

1. **环境变量管理**
   - 不要提交 `.env.local` 到 Git
   - 为不同环境使用不同的配置文件
   - 敏感信息使用 Secret Manager

2. **数据持久化**
   - 定期备份 PostgreSQL 数据
   - 使用命名 volumes 而非匿名 volumes

3. **日志管理**
   - 定期清理容器日志
   - 使用日志聚合工具 (如 ELK)

4. **性能优化**
   - 使用 `.dockerignore` 减少构建上下文
   - 合理使用 Docker 缓存层
   - 定期清理未使用的镜像和容器

5. **安全建议**
   - 定期更新基础镜像
   - 扫描镜像漏洞
   - 使用非 root 用户运行容器
   - 限制容器资源使用

---

## 📖 更多资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL Docker 镜像](https://hub.docker.com/_/postgres)
- [Redis Docker 镜像](https://hub.docker.com/_/redis)
- [Nginx Docker 镜像](https://hub.docker.com/_/nginx)

---

## 💡 提示

- 首次启动可能需要较长时间(下载镜像 + 构建)
- 确保 Docker Desktop 已分配足够的内存 (建议 ≥ 4GB)
- 在 Windows 上使用 WSL 2 后端以获得更好性能
- 使用 `docker system prune` 定期清理未使用的资源

---

<div align="center">

**需要帮助？** 查看项目 [README.md](./README.md) 或提交 Issue

</div>
