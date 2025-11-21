# 🚀 快速启动指南

## 方式一：使用脚本启动 (推荐)

### 1. 确保 Docker Desktop 正在运行

打开 Docker Desktop，等待底部状态栏显示绿色 "Running"

### 2. 启动所有服务

打开命令提示符(CMD)或PowerShell，运行：

```cmd
cd C:\Users\Li Wen Xuan\Desktop\aipush
scripts\docker-dev.bat start
```

### 3. 查看服务状态

```cmd
scripts\docker-dev.bat status
```

你会看到：
```
📊 Service Status:
NAME                 STATUS    PORTS
aipush-postgres      running   5432
aipush-redis         running   6379
aipush-api           running   4000
aipush-web           running   3000

🔗 Access URLs:
  Frontend:      http://localhost:3000
  Backend API:   http://localhost:4000
  API Docs:      http://localhost:4000/api/docs
```

### 4. 访问应用

在浏览器中打开：
- **前端**: http://localhost:3000
- **API文档**: http://localhost:4000/api/docs
- **健康检查**: http://localhost:4000/api/health

---

## 方式二：直接使用 Docker Compose

```cmd
cd C:\Users\Li Wen Xuan\Desktop\aipush
docker-compose up -d
```

---

## 🔧 常用命令

```cmd
# 启动所有服务
scripts\docker-dev.bat start

# 启动并查看日志
scripts\docker-dev.bat start-logs

# 停止所有服务
scripts\docker-dev.bat stop

# 重启服务
scripts\docker-dev.bat restart

# 查看日志
scripts\docker-dev.bat logs
scripts\docker-dev.bat logs api    # 只看API日志
scripts\docker-dev.bat logs web    # 只看Web日志

# 进入容器调试
scripts\docker-dev.bat shell api   # 进入API容器
scripts\docker-dev.bat shell web   # 进入Web容器

# 数据库操作
scripts\docker-dev.bat migrate          # 运行数据库迁移
scripts\docker-dev.bat prisma-studio    # 打开数据库管理界面
```

---

## ⚠️ 首次启动注意事项

### 1. 首次启动会比较慢
- Docker需要下载镜像 (PostgreSQL, Redis, Node等)
- 需要构建自定义镜像
- 需要安装npm依赖

**预计时间**: 5-15分钟 (取决于网络速度)

### 2. 如果遇到错误

**端口被占用**:
```cmd
# 检查哪个程序占用了端口
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# 修改 .env.local 中的端口
WEB_PORT=3001
API_PORT=4001
```

**Docker未启动**:
- 打开 Docker Desktop
- 等待底部状态栏显示绿色 "Running"

**网络问题**:
```cmd
# 清理并重新启动
scripts\docker-dev.bat stop
scripts\docker-dev.bat start
```

---

## 📊 验证启动成功

### 1. 检查容器状态

```cmd
docker-compose ps
```

所有服务应该显示 "running" 状态

### 2. 测试API健康检查

在浏览器打开: http://localhost:4000/api/health

应该看到:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### 3. 测试前端

在浏览器打开: http://localhost:3000

应该能看到前端界面

---

## 🛑 停止服务

```cmd
scripts\docker-dev.bat stop
```

或者:

```cmd
docker-compose down
```

**注意**: 停止服务不会删除数据，数据库数据会保留在 Docker volume 中

---

## 🧹 完全清理 (谨慎使用)

如果需要完全重置环境:

```cmd
scripts\docker-dev.bat clean
```

这会删除:
- ❌ 所有容器
- ❌ 所有数据卷 (包括数据库数据)
- ❌ 所有构建的镜像

---

## 📝 下一步

启动成功后，你可以:

1. **查看API文档**: http://localhost:4000/api/docs
2. **管理数据库**: `scripts\docker-dev.bat prisma-studio`
3. **查看日志**: `scripts\docker-dev.bat logs`
4. **开始开发**: 修改代码会自动热重载

---

## 🆘 需要帮助？

- 查看完整文档: [DOCKER.md](./DOCKER.md)
- 查看项目文档: [README.md](./README.md)
- 查看脚本帮助: `scripts\docker-dev.bat help`

---

<div align="center">

**准备好了吗？运行 `scripts\docker-dev.bat start` 开始吧！** 🎉

</div>
