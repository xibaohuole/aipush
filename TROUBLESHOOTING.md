# ⚡ 快速开始 - 5分钟修复指南

## 🎯 你现在需要做的3件事

### 1️⃣ 获取新的API密钥（2分钟）

访问: https://open.bigmodel.cn/

点击 **创建新密钥** → 复制密钥

---

### 2️⃣ 更新配置文件（1分钟）

打开: `C:\Users\Li Wen Xuan\Desktop\aipush\.env`

找到第29行，替换为:
```env
GLM_API_KEY=你刚复制的新密钥
```

保存文件。

---

### 3️⃣ 测试（2分钟）

运行命令测试:
```bash
curl "http://localhost:4000/api/v1/news/ai/generate?count=2"
```

看到新闻JSON数据 = 成功! ✅

---

## 🚀 然后部署

```bash
# 提交代码
git add .
git commit -m "security: Fix API key leak"
git push

# 部署后端（选择一个）:
# - Vercel: vercel
# - Railway: 访问 railway.app
# - Render: 访问 render.com
```

---

## 📖 完整指南

详细步骤请查看: `NEXT_STEPS.md`

安全说明请查看: `SECURITY_FIX_SUMMARY.md`

---

## ❓ 需要帮助?

1. 后端日志: 查看正在运行的后端控制台
2. 前端错误: 打开浏览器控制台 (F12)
3. 文档: 查看 `NEXT_STEPS.md` 的故障排除部分
