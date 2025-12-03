# 数据库迁移指南

## 新功能概述

本次更新添加了以下功能：

1. **收藏功能**：支持匿名用户和登录用户收藏新闻
2. **已读记录**：自动跟踪用户已读新闻，记录阅读时长和滚动深度
3. **详情页国际化**：完整的中英文支持

## 数据库变更

### 1. 新增表

- **read_history**：已读记录表
  - 记录用户已读的新闻
  - 跟踪阅读时长（readDuration）
  - 跟踪滚动深度（scrollDepth）

### 2. 修改表

- **bookmarks**：书签表
  - 添加 `session_id` 字段支持匿名用户
  - 添加 `updated_at` 字段
  - `user_id` 改为可选

- **activity_event_type** 枚举：
  - 添加 `read` 事件类型

## Render 部署迁移步骤

### 方式一：自动迁移（推荐）

Render 会在部署时自动运行 `npm run build`，如果配置了 Prisma，会自动执行迁移。

检查 `apps/api/package.json` 的 build 脚本是否包含：

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && nest build"
  }
}
```

### 方式二：手动迁移

如果自动迁移失败，可以通过 Render Shell 手动执行：

1. 进入 Render Dashboard
2. 选择你的 API 服务
3. 点击 "Shell" 标签
4. 运行以下命令：

```bash
cd apps/api
npx prisma migrate deploy
```

### 方式三：直接执行 SQL

如果 Prisma 迁移失败，可以直接在 PostgreSQL 数据库执行 SQL：

**连接到数据库：**

```bash
psql $DATABASE_URL
```

**执行迁移 SQL：**

```sql
-- AlterEnum
ALTER TYPE "activity_event_type" ADD VALUE 'read';

-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN     "session_id" VARCHAR(100),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_session_id_news_id_key" ON "bookmarks"("session_id", "news_id");

-- CreateIndex
CREATE INDEX "bookmarks_session_id_idx" ON "bookmarks"("session_id");

-- CreateTable
CREATE TABLE "read_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "session_id" VARCHAR(100),
    "news_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_duration" INTEGER,
    "scroll_depth" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "read_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "read_history_user_id_idx" ON "read_history"("user_id");
CREATE INDEX "read_history_session_id_idx" ON "read_history"("session_id");
CREATE INDEX "read_history_news_id_idx" ON "read_history"("news_id");
CREATE INDEX "read_history_read_at_idx" ON "read_history"("read_at" DESC);
CREATE UNIQUE INDEX "read_history_user_id_news_id_key" ON "read_history"("user_id", "news_id");
CREATE UNIQUE INDEX "read_history_session_id_news_id_key" ON "read_history"("session_id", "news_id");

-- AddForeignKey
ALTER TABLE "read_history" ADD CONSTRAINT "read_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "read_history" ADD CONSTRAINT "read_history_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 验证迁移

迁移完成后，验证表结构：

```sql
-- 检查 bookmarks 表
\d bookmarks

-- 检查 read_history 表
\d read_history

-- 检查枚举类型
\dT+ activity_event_type
```

## 新 API 端点

### 书签 API

- `POST /api/v1/bookmarks/:newsId` - 添加书签
- `DELETE /api/v1/bookmarks/:newsId` - 移除书签
- `GET /api/v1/bookmarks` - 获取用户书签列表
- `GET /api/v1/bookmarks/check/:newsId` - 检查是否已收藏
- `POST /api/v1/bookmarks/check-multiple` - 批量检查收藏状态

### 已读记录 API

- `POST /api/v1/read-history/:newsId` - 标记为已读
- `GET /api/v1/read-history` - 获取已读历史
- `GET /api/v1/read-history/check/:newsId` - 检查是否已读
- `POST /api/v1/read-history/check-multiple` - 批量检查已读状态
- `GET /api/v1/read-history/stats` - 获取已读统计

### 请求头

所有 API 需要以下请求头：

```
x-session-id: <用户会话ID>
x-user-id: <可选，登录用户ID>
```

## 前端变更

### 新增工具和服务

- `utils/session.ts` - 会话 ID 管理
- `services/bookmarkService.ts` - 书签服务
- `services/readHistoryService.ts` - 已读记录服务

### 自动行为

- 用户进入详情页后 **3秒** 自动标记为已读
- 离开详情页时自动更新阅读时长和滚动深度
- 所有操作基于 sessionId，支持匿名用户

## 注意事项

1. **Redis 配置**：确保 Render 上的 Redis 服务正常运行
2. **环境变量**：检查 `DATABASE_URL` 和 `REDIS_HOST` 配置正确
3. **Prisma Client**：迁移后需要重新生成 Prisma Client（自动触发）
4. **唯一约束**：`userId+newsId` 和 `sessionId+newsId` 都有唯一约束，防止重复记录

## 故障排查

### 问题：迁移失败 "relation already exists"

**解决方案：** 部分表已存在，可以跳过对应的 CREATE TABLE 语句，只执行 ALTER 和 CREATE INDEX。

### 问题：枚举值已存在

**解决方案：** 如果 `read` 枚举值已存在，跳过 ALTER ENUM 语句。

### 问题：前端请求 403/404

**解决方案：** 检查 API 路由是否正确，确保 `/api/v1/bookmarks` 和 `/api/v1/read-history` 可访问。

## 回滚方案

如果需要回滚数据库：

```sql
-- 删除新表
DROP TABLE IF EXISTS "read_history" CASCADE;

-- 删除新增的字段
ALTER TABLE "bookmarks" DROP COLUMN IF EXISTS "session_id";
ALTER TABLE "bookmarks" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "bookmarks" ALTER COLUMN "user_id" SET NOT NULL;

-- 注意：无法轻易删除枚举值，建议不回滚枚举
```

## 后续优化建议

1. 定期清理 30 天以上的已读记录（已实现 API）
2. 使用 Redis 缓存热门新闻的收藏/已读状态
3. 添加用户阅读分析报告功能
4. 实现跨设备同步（需要用户登录）
