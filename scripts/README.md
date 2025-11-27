# 缓存管理脚本

这些脚本用于清除 Redis 中的旧缓存数据，并重新生成包含中文字段的新数据。

## 📁 脚本列表

| 脚本 | 说明 | 适用系统 |
|------|------|---------|
| `clear-cache.js` | Node.js 版本 | Windows / macOS / Linux |
| `clear-cache.ps1` | PowerShell 版本 | Windows |

## 🚀 使用方法

### 方法 1: 使用 Node.js 脚本（推荐）

1. **修改配置**

打开 `scripts/clear-cache.js`，找到第 10 行：

```javascript
const API_URL = 'https://your-app.onrender.com'; // 修改这里！
```

改为你的实际 Render 应用 URL，例如：

```javascript
const API_URL = 'https://aipush-abc123.onrender.com';
```

2. **运行脚本**

```bash
node scripts/clear-cache.js
```

### 方法 2: 使用 PowerShell 脚本（Windows）

1. **修改配置**

打开 `scripts/clear-cache.ps1`，找到第 8 行：

```powershell
$API_URL = "https://your-app.onrender.com"  # 修改这里！
```

改为你的实际 Render 应用 URL。

2. **运行脚本**

```powershell
.\scripts\clear-cache.ps1
```

**注意：** 如果遇到执行策略错误，运行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 方法 3: 手动调用 API（适用任何系统）

使用 curl 或浏览器：

```bash
# 1. 清除缓存
curl -X DELETE https://你的域名/api/v1/news/cache/ai-news

# 2. 生成新数据
curl https://你的域名/api/v1/news/ai/generate?count=8
```

## 📊 脚本执行流程

脚本会自动执行以下步骤：

1. ✅ **检查 API 连接** - 验证应用是否可访问
2. 🗑️ **清除旧缓存** - 删除所有 `ai-news:*` 缓存
3. 🔄 **生成新数据** - 调用 GLM API 生成包含中文的新闻
4. ✔️ **验证中文字段** - 检查 `titleCn` 和 `summaryCn` 是否存在
5. 📈 **最终状态检查** - 显示最新缓存统计

## 📝 输出示例

```
🚀 开始清除 AI 新闻缓存...

1️⃣  检查 API 连接...
   ✅ API 连接成功
   📊 当前缓存状态:
      - Redis 可用: true
      - 内存缓存条目: 3

2️⃣  清除旧缓存...
   ✅ 成功清除 3 条缓存

3️⃣  生成新的 AI 新闻...
   ⏳ 调用 GLM API 生成新数据（可能需要 5-10 秒）...
   ✅ 成功生成 8 条新闻

4️⃣  验证中文字段...
   ✅ 中文字段验证成功！

📝 示例数据:
   英文标题: OpenAI Launches GPT-5 with Enhanced Reasoning
   中文标题: OpenAI 发布增强推理能力的 GPT-5
   英文摘要: OpenAI announced the release of GPT-5, featuring significa...
   中文摘要: OpenAI 宣布发布 GPT-5，具有显著增强的推理能力...

5️⃣  最终状态检查...
   📊 最新缓存状态:
      - Redis 可用: true
      - 内存缓存条目: 1

✅ 缓存清除完成！
```

## ⚠️ 常见问题

### 问题 1: 连接超时

**原因：** Render 应用可能处于休眠状态

**解决：**
1. 先访问一次你的应用 URL，唤醒应用
2. 等待 30 秒后再运行脚本

### 问题 2: 中文字段验证失败

**原因：** Render 可能还在部署新代码

**解决：**
1. 访问 Render Dashboard 检查部署状态
2. 确认最新的 3 个提交已部署：
   - `feat: Add Chinese translation fields to GLM API responses`
   - `feat: Add cache management endpoint for AI news`
   - `feat: Implement advanced Redis caching strategies`
3. 等待部署完成后再运行脚本

### 问题 3: API 返回 404

**原因：** URL 配置错误或路由未正确设置

**解决：**
1. 检查 API_URL 是否正确
2. 确认 URL 以 `/api/v1` 结尾（脚本会自动添加）
3. 测试访问：`https://你的域名/api/v1/news/cache/stats`

## 🔍 手动验证

如果脚本运行成功，你可以手动验证：

```bash
# 获取 AI 新闻
curl https://你的域名/api/v1/news/ai/generate?count=1

# 检查响应中是否包含：
# - titleCn
# - summaryCn
```

## 📚 相关文档

- [缓存策略文档](../docs/CACHE_STRATEGY.md)
- [API 文档](../README.md)

---

**最后更新：** 2025-11-27
