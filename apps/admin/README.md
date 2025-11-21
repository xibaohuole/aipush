# AI Pulse Admin Dashboard

企业级管理后台，用于管理 AI Pulse Daily 平台的内容、用户和系统配置。

## 功能特性

### 核心功能
- ✅ **仪表盘** - 系统概览和关键指标可视化
- ✅ **用户管理** - 用户账号管理、权限控制、状态监控
- ✅ **新闻管理** - 新闻审核、编辑、发布流程
- ✅ **评论审核** - 用户评论审核和管理
- ✅ **数据分析** - 平台数据统计和趋势分析
- ✅ **系统设置** - 系统参数配置和 API 管理

### 技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **路由**: React Router DOM 7
- **状态管理**: Zustand 5
- **数据请求**: TanStack Query 5
- **样式**: Tailwind CSS 3
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **图表**: Recharts (已配置)

## 快速开始

### 前提条件
- Node.js 20+
- pnpm 9+

### 开发模式

1. 在项目根目录安装依赖：
```bash
pnpm install
```

2. 启动 Admin 应用：
```bash
cd apps/admin
pnpm dev
```

或者从根目录使用 Turbo:
```bash
pnpm --filter @aipush/admin dev
```

3. 打开浏览器访问: http://localhost:3001

### 默认登录凭据（演示）
- 邮箱: `admin@example.com`
- 密码: 任意密码（演示模式）

## 项目结构

```
apps/admin/
├── src/
│   ├── components/          # 共享组件
│   │   └── layout/         # 布局组件（Sidebar, Header）
│   ├── layouts/            # 页面布局
│   │   └── AdminLayout.tsx # 主布局
│   ├── pages/              # 页面组件
│   │   ├── auth/          # 认证页面
│   │   ├── users/         # 用户管理
│   │   ├── news/          # 新闻管理
│   │   ├── comments/      # 评论管理
│   │   ├── DashboardPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── stores/            # Zustand 状态管理
│   │   ├── authStore.ts   # 认证状态
│   │   └── uiStore.ts     # UI 状态
│   ├── lib/               # 工具函数
│   │   └── utils.ts
│   ├── App.tsx            # 应用入口
│   ├── main.tsx           # React 入口
│   └── index.css          # 全局样式
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 页面路由

| 路由 | 页面 | 描述 |
|------|------|------|
| `/login` | 登录页面 | 管理员登录 |
| `/` | 仪表盘 | 系统概览 |
| `/users` | 用户列表 | 用户管理 |
| `/users/:id` | 用户详情 | 用户详细信息 |
| `/news` | 新闻列表 | 新闻管理 |
| `/news/:id` | 新闻详情 | 新闻审核和编辑 |
| `/comments` | 评论列表 | 评论审核 |
| `/analytics` | 数据分析 | 统计报告 |
| `/settings` | 系统设置 | 配置管理 |

## 构建部署

### 生产构建
```bash
pnpm build
```

构建输出目录: `dist/`

### 预览生产构建
```bash
pnpm preview
```

## 环境变量

创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:4000
```

## 开发计划

### 待实现功能
- [ ] 与后端 API 集成
- [ ] 实际的数据图表（Recharts）
- [ ] 图片上传功能
- [ ] 富文本编辑器
- [ ] 批量操作
- [ ] 导出数据功能
- [ ] 实时通知
- [ ] 主题切换实现

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
