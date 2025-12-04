# AI Pulse Daily - 项目结构探索分析

## 项目概览
- 项目名称: AI Pulse Daily (ai-pulse-daily-monorepo)
- 版本: 1.0.0
- 架构: Monorepo (Turborepo)
- 包管理器: pnpm 9.15.0+
- Node版本: >=20.0.0
- 数据库: PostgreSQL

## 1. 卡片组件位置

### 1.1 主要卡片组件位置
- /components (根目录旧版本)
  - NewsCard.tsx (206行)
  - DailyBrief.tsx
  - TrendingList.tsx

- /apps/web/src/components (当前Web应用)
  - NewsCard.tsx (11922字节 - 最新版本)
  - NewsDetail.tsx (14704字节)
  - DailyBrief.tsx
  - DashboardStats.tsx

- /packages/ui/src/components (通用UI组件库)
  - Card.tsx (通用卡片基础组件)
  - CardHeader.tsx, CardContent.tsx, CardFooter.tsx
  - Button.tsx, Input.tsx, Badge.tsx, Modal.tsx

### 1.2 NewsCard 功能特性
- 支持CARD和LIST两种视图模式
- 分类样式: 使用渐变背景根据分类类型变化
- 翻译功能 (多语言支持)
- 收藏/书签功能
- AI提问功能
- 分享功能
- 音频播放
- 保存到Notion
- 固定评论显示

## 2. Prisma Schema 分析

### 2.1 Schema文件位置
- 主Schema: /apps/api/prisma/schema.prisma
- 备用Schema: /database/prisma/schema.prisma
- 数据库: PostgreSQL

### 2.2 核心数据模型

**用户相关**
- User: 用户主表 (id, email, username, passwordHash, role, emailVerified)
- UserPreferences: 用户偏好 (theme, viewMode, language, notification)
- RefreshToken: 刷新令牌管理
- ApiKey: API密钥认证

**新闻相关**
- News: 新闻主表 (title, summary, category, region, impactScore)
- Bookmark: 书签 (支持用户和匿名会话)
- ReadHistory: 阅读历史 (readDuration, scrollDepth)

**交互相关**
- Comment: 评论 (支持嵌套回复)
- CommentLike: 评论赞
- Share: 分享记录 (twitter/linkedin/facebook/email/link)

**其他**
- DailySummary: 每日摘要
- UserActivity: 用户活动追踪
- Notification: 通知系统
- ModeratorAction: 版主操作
- Settings: 全局设置

### 2.3 关键枚举
- UserRole: user, admin, moderator, editor
- NewsCategory: research, product, finance, policy, ethics, robotics, lifestyle, entertainment, meme, other
- Region: global, north_america, europe, asia, other
- ViewMode: card, list
- ThemeMode: light, dark, auto

## 3. API 路由结构

### 3.1 API基础配置
- 全局前缀: /api
- 版本化: URI版本 (v1 default)
- 安全: Helmet + CORS
- 数据库: PostgreSQL + Prisma
- 缓存: Redis
- Swagger文档: /api/docs

### 3.2 模块结构

已实现:
- news/ (最完整) - controllers, services, schedulers
- settings/ (已实现)
- analytics/ (已创建)

未实现/空:
- auth/ (auth.module.ts - 仅框架)
- users/ (users.module.ts - 仅框架)
- bookmarks/ (空)
- comments/ (空)
- daily-summaries/ (空)
- notifications/ (空)

## 4. 用户认证系统分析

### 4.1 认证实现状态

认证模块位置: /apps/api/src/modules/auth/
当前状态: 已创建但未实现 (仅有空模块定义)

### 4.2 认证数据库支持

已有的认证基础:
- User表结构: passwordHash, emailVerified, role, lastLoginAt
- RefreshToken表: 支持令牌管理和撤销
- ApiKey表: API认证支持
- UserRole枚举: user, admin, moderator, editor

### 4.3 未实现的功能

需要实现:
- [ ] 登录端点 (POST /api/auth/login)
- [ ] 注册端点 (POST /api/auth/register)
- [ ] JWT生成和验证
- [ ] 密码重置流程
- [ ] 守卫 (Guard) - 路由保护

### 4.4 存在的认证标记

- Swagger文档中已标记认证: .addBearerAuth()
- CORS头部: Authorization已在允许列表中
- ValidationPipe已启用

## 5. 文件路径映射

| 功能 | 路径 |
|------|------|
| 新闻卡片组件 | /apps/web/src/components/NewsCard.tsx |
| 基础UI组件 | /packages/ui/src/components/Card.tsx |
| 数据库模型 | /apps/api/prisma/schema.prisma |
| API主文件 | /apps/api/src/main.ts |
| 新闻控制器 | /apps/api/src/modules/news/controllers/news.controller.ts |
| 认证模块 | /apps/api/src/modules/auth/auth.module.ts |
| 主应用 | /apps/web/src/App.tsx |

## 6. 技术栈

前端:
- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS 3.4.17
- Lucide React (图标)
- React Query

后端:
- NestJS
- Prisma ORM
- PostgreSQL
- Redis

共享:
- Turborepo (monorepo)
- pnpm 9.15.0+
- i18n (国际化)

## 7. 关键发现

1. 认证系统:
   - Auth模块已创建但未实现
   - 用户系统数据库支持完整
   - 需要实现核心认证功能

2. 卡片系统:
   - Web应用版本最新
   - 支持CARD和LIST视图
   - 功能完整

3. API架构:
   - 完整NestJS框架
   - News模块最完整
   - 其他模块需要扩展

4. 数据库:
   - Schema设计完整
   - 支持多租户/匿名用户
   - 有完整审计能力

