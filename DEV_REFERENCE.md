# 快速参考指南 - 新闻卡片组件

## 三个核心问题

### 1. 数据映射缺失 (严重)
- **位置**: `/apps/web/src/services/newsService.ts` 第62-100行
- **问题**: `titleCn` 和 `summaryCn` 没有从后端响应映射到前端
- **结果**: 这些字段始终为 undefined
- **修复**: 在map函数中添加 `titleCn: item.titleCn` 和 `summaryCn: item.summaryCn`

### 2. 显示逻辑重复 (逻辑错误)
- **位置**: `/apps/web/src/components/NewsCard.tsx` 第24-39行
- **问题**: 两个三元表达式的条件分支相同，导致按钮无效
- **代码问题**:
  ```typescript
  const displayTitle = globalTranslateEnabled
    ? (item.titleCn || item.title)  // 分支A
    : (item.titleCn || item.title); // 分支B 完全相同！
  ```
- **修复**: 一个分支应该显示英文，另一个显示中文

### 3. whyItMatters 未显示 (功能缺失)
- **位置**: NewsCard 组件中
- **问题**: 该字段被获取但从未显示
- **修复**: 在卡片中添加显示此字段的代码

---

## 文件导航

### 前端关键文件

| 文件 | 路径 | 行号 | 作用 |
|------|------|------|------|
| NewsCard | `apps/web/src/components/` | 24-39 | 显示逻辑（有问题） |
| App | `apps/web/src/` | 33, 551 | 全局状态定义和按钮 |
| newsService | `apps/web/src/services/` | 62-100 | 数据映射（缺失） |
| types | `apps/web/src/` | 全文 | 接口定义 |
| localStorage | `apps/web/src/utils/` | 全文 | 偏好存储 |

### 后端关键文件

| 文件 | 路径 | 功能 |
|------|------|------|
| news.controller | `apps/api/src/modules/news/controllers/` | 返回字段定义 |
| ai-analyzer | `apps/api/src/modules/news/services/` | 生成中文翻译 |

---

## 全局翻译开关机制

### 状态链
```
用户点击按钮
  ↓
setGlobalTranslateEnabled(!current)
  ↓
状态改变: false ↔ true
  ↓
重新渲染所有 NewsCard 子组件
  ↓
计算 displayTitle/displaySummary
  ↓
显示新内容
```

### 按钮配置
```typescript
// App.tsx ~551行
<Button
  onClick={() => setGlobalTranslateEnabled(!globalTranslateEnabled)}
  variant={globalTranslateEnabled ? "success" : "secondary"}
>
  {globalTranslateEnabled ? '显示原文' : '全部翻译'}
</Button>
```

### 传递流程
```
App.tsx 状态
  ↓
<NewsCard globalTranslateEnabled={globalTranslateEnabled} />
  ↓
NewsCard 组件接收 prop
  ↓
计算 displayTitle = globalTranslateEnabled ? ... : ...
```

---

## 显示逻辑对比

### 当前代码（有问题）
```typescript
const displayTitle = globalTranslateEnabled
  ? (item.titleCn || item.title)
  : (item.titleCn || item.title);
```
结果: 无论开关状态如何，都相同

### 应该改为（修复方案）
```typescript
const displayTitle = globalTranslateEnabled
  ? item.title                      // 显示英文原文
  : (item.titleCn || item.title);  // 显示中文或英文
```
结果: 开关真正有效果

---

## 数据流完整示意

```
API 返回
  ├─ title: "OpenAI releases GPT-5"
  ├─ titleCn: "OpenAI 发布 GPT-5"        ← 有值
  ├─ summary: "OpenAI announced..."
  └─ summaryCn: "OpenAI 宣布推出..."     ← 有值
       ↓ (newsService.ts 映射)
前端 NewsItem 对象
  ├─ title: "OpenAI releases GPT-5"
  ├─ titleCn: undefined              ← 问题！应该是"OpenAI 发布 GPT-5"
  ├─ summary: "OpenAI announced..."
  └─ summaryCn: undefined            ← 问题！应该是"OpenAI 宣布推出..."
       ↓ (NewsCard 显示逻辑)
显示结果
  ├─ displayTitle: item.titleCn || item.title
  │   → item.title（因为 titleCn = undefined）
  └─ displaySummary: item.summary（因为 summaryCn = undefined）
       ↓
显示英文 ✗（不符合预期，应该默认显示中文）
```

---

## 三行修复方案

### 修复1: newsService.ts (3行)
```typescript
// 在 map 函数中添加：
titleCn: item.titleCn,
summaryCn: item.summaryCn,
```

### 修复2: NewsCard.tsx (2行)
```typescript
const displayTitle = globalTranslateEnabled
  ? item.title                      // ← 改这里
  : (item.titleCn || item.title);
```

### 修复3: NewsCard.tsx (显示whyItMatters)
```typescript
{item.whyItMatters && (
  <p className="text-xs text-gray-400">{item.whyItMatters}</p>
)}
```

---

## 语言偏好系统

### 两个独立的系统

**系统1: targetLanguage (设置页面用)**
- 存储位置: localStorage['aipush_language']
- 影响: i18n 国际化库的语言
- UI体现: Settings 页面的语言选项

**系统2: globalTranslateEnabled (仪表板按钮)**
- 存储位置: 仅在内存中（刷新后重置）
- 影响: 显示中文还是英文
- UI体现: 头部的"全部翻译"/"显示原文"按钮

### 注意
这两个系统目前是分离的，不会相互影响。

---

## 关键代码位置速查

### 显示逻辑
- 第24-39行 (NewsCard.tsx)
- 第100-182行 (CARD 模式渲染)
- 第61-98行 (LIST 模式渲染)

### 状态管理
- 第33行 (全局翻译开关声明)
- 第551-560行 (按钮定义)
- 第573行 (传递给子组件)

### 数据映射
- 第62-100行 (newsService.ts 的 map 函数)

### 类型定义
- 全文 (types.ts - NewsItem 接口)

### 存储
- 全文 (localStorage.ts - 读写函数)

---

## 类型检查

### NewsItem 接口结构
```typescript
interface NewsItem {
  id: string;
  title: string;           // 英文
  titleCn?: string;        // 中文 (可选)
  summary: string;         // 英文
  summaryCn?: string;      // 中文 (可选)
  whyItMatters?: string;   // 英文
  // whyItMattersCn?: string;  // 中文 (不在接口中)
  category: NewsCategory;
  region: Region;
  impact: number;
  // ... 其他字段
}
```

### NewsCardProps 接口
```typescript
interface NewsCardProps {
  item: NewsItem;
  targetLanguage: string;
  isBookmarked: boolean;
  viewMode: ViewMode;  // 'CARD' | 'LIST'
  onToggleBookmark: (id: string) => void;
  onAsk: (item: NewsItem) => void;
  globalTranslateEnabled?: boolean;  // ← 关键属性
}
```

---

## 常见误解澄清

### 误解1: "全部翻译"和"显示原文"会改变显示内容
**事实**: 当前代码中这两个按钮状态相同，没有实际效果

### 误解2: targetLanguage 会影响新闻卡片的显示
**事实**: targetLanguage 只影响 UI 的国际化（菜单、标签等），不影响新闻内容显示

### 误解3: whyItMatters 字段被显示
**事实**: 虽然后端返回并有数据，但组件完全没有渲染它

### 误解4: titleCn 和 summaryCn 已经在前端显示
**事实**: 因为数据映射缺失，这些字段始终为 undefined

---

## 调试技巧

### 检查后端是否返回中文字段
```javascript
// 在浏览器 console 中
fetch('http://localhost:4000/api/v1/news?page=1&limit=5')
  .then(r => r.json())
  .then(d => console.log(d.data.items[0]))
  // 查看是否有 titleCn, summaryCn 字段
```

### 检查前端是否接收到中文字段
```javascript
// 在 NewsCard 组件中添加
console.log('item.titleCn:', item.titleCn);  // 应该有值，但现在是 undefined
```

### 检查按钮是否触发状态改变
```typescript
// 在 App.tsx 中添加
useEffect(() => {
  console.log('globalTranslateEnabled:', globalTranslateEnabled);
}, [globalTranslateEnabled]);
```

---

## 总结

| 项目 | 状态 | 优先级 |
|------|------|--------|
| 数据映射缺失 | 严重错误 | 高 |
| 显示逻辑重复 | 逻辑错误 | 高 |
| whyItMatters 未显示 | 功能缺失 | 中 |

修复顺序建议:
1. 先修复数据映射 (最关键)
2. 再修复显示逻辑
3. 最后添加 whyItMatters 显示

