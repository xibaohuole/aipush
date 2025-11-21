# @aipush/ui

统一的 UI 组件库，为 AI Pulse Daily 平台提供可复用的 React 组件和设计系统。

## 功能特性

- ✅ **统一设计系统** - 跨应用的一致 UI 体验
- ✅ **深色模式支持** - 所有组件支持浅色/深色主题
- ✅ **TypeScript** - 完整的类型定义
- ✅ **Tailwind CSS** - 使用 Tailwind 进行样式定制
- ✅ **可访问性** - 遵循 ARIA 标准

## 组件列表

### Button
多种样式和尺寸的按钮组件。

```tsx
import { Button } from '@aipush/ui';

<Button variant="primary" size="md">
  点击我
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'

### Card
卡片容器组件，带有 Header、Content 和 Footer 子组件。

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@aipush/ui';

<Card variant="bordered">
  <CardHeader>标题</CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>页脚</CardFooter>
</Card>
```

**Props:**
- `variant`: 'default' | 'bordered' | 'elevated'

### Input
表单输入组件，支持标签、错误提示和帮助文本。

```tsx
import { Input } from '@aipush/ui';

<Input
  label="邮箱"
  placeholder="your@email.com"
  error="无效的邮箱地址"
/>
```

**Props:**
- `label`: 输入框标签
- `error`: 错误消息
- `helperText`: 帮助文本

### Badge
徽章组件，用于状态标识。

```tsx
import { Badge } from '@aipush/ui';

<Badge variant="success" size="md">
  已发布
</Badge>
```

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'

### Modal
模态框组件。

```tsx
import { Modal } from '@aipush/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="确认操作"
  size="md"
>
  <p>确定要执行此操作吗？</p>
</Modal>
```

**Props:**
- `isOpen`: 是否打开
- `onClose`: 关闭回调
- `title`: 标题
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: 是否显示关闭按钮

### Spinner
加载动画组件。

```tsx
import { Spinner } from '@aipush/ui';

<Spinner size="md" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'

## 工具函数

### cn
合并 Tailwind CSS 类名。

```tsx
import { cn } from '@aipush/ui';

const className = cn(
  'base-class',
  condition && 'conditional-class',
  'override-class'
);
```

## 使用方法

### 安装
已作为 workspace 包自动链接。

### 导入
```tsx
import { Button, Card, Input, Badge, Modal, Spinner } from '@aipush/ui';
```

### 在应用中使用
确保应用包含 Tailwind CSS 配置：

```js
// tailwind.config.js
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}', // 包含 UI 组件
  ],
  // ...
};
```

## 自定义主题

组件使用 Tailwind CSS 变量进行主题定制。在应用的 CSS 中定义：

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

## 开发

### 类型检查
```bash
pnpm --filter @aipush/ui type-check
```

### Lint
```bash
pnpm --filter @aipush/ui lint
```

## 许可证

MIT
