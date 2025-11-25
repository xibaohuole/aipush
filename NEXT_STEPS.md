# 🔥 立即行动 - 修复API密钥泄露

## ⚠️ 当前状态

✅ **已完成的修复**:
- 从前端代码中移除了所有硬编码的API密钥
- 创建了安全的后端API端点
- 前端现在通过后端调用AI服务
- 移除了Vite配置中的API密钥注入
- 更新了GitHub Actions配置

❌ **需要你完成的**:
- 获取新的GLM API密钥
- 配置后端环境变量
- 测试并部署

---

## 📋 必须执行的步骤（按顺序）

### 步骤1: 获取新的GLM API密钥 🔑

**重要**: 你的旧密钥已被泄露并报告，必须使用新密钥！

1. 访问 https://open.bigmodel.cn/
2. 登录你的账号
3. 进入 **API管理** 或 **密钥管理**
4. 点击 **创建新密钥** 或 **生成API密钥**
5. 复制新生成的密钥（格式类似: `xxxxxxxx.xxxxxxxxxx`）

⚠️ **不要使用以下被泄露的密钥**:
- `1c1aa0b4b71f43518dd7d03ba933bd3c.nD3WVYmgqa8thszj` (已从代码中删除)
- `2e99b6f1249c4912aa53bc10edaf6ed3.TnoDt5b1sKSgWumM` (已从.env中删除)

---

### 步骤2: 配置后端环境变量 ⚙️

编辑文件: `C:\Users\Li Wen Xuan\Desktop\aipush\.env`

找到第29行:
```env
GLM_API_KEY=your-new-glm-api-key-here
```

替换为你刚刚获取的新密钥:
```env
GLM_API_KEY=你的新密钥
```

**示例**:
```env
GLM_API_KEY=abc123def456.xyz789abc123
```

**保存文件后**, nodemon会自动重启后端服务（后端已经在运行中）。

---

### 步骤3: 测试后端API 🧪

在命令行运行以下命令测试:

```bash
curl "http://localhost:4000/api/v1/news/ai/generate?count=2"
```

**预期结果**: 应该返回2条AI生成的新闻（JSON格式）

如果看到错误，检查:
1. GLM_API_KEY是否正确配置
2. 后端服务是否正在运行（端口4000）
3. 查看后端日志中的错误信息

---

### 步骤4: 提交代码到Git 📦

```bash
# 添加所有修改
git add .

# 创建提交
git commit -m "security: Fix API key leak - move all AI calls to backend

- Remove hardcoded API keys from frontend
- Create secure backend endpoint for AI calls
- Update Vite config to exclude sensitive data
- Update GitHub Actions deployment
- Add security documentation

BREAKING CHANGE: Frontend now requires backend API to be running"

# 推送到GitHub
git push
```

---

### 步骤5: 配置GitHub Secrets 🔐

1. 访问: https://github.com/你的用户名/aipush/settings/secrets/actions

2. **删除旧密钥** (如果存在):
   - `VITE_GLM_API_KEY` ❌ 删除

3. **更新或创建新密钥**:
   - 名称: `VITE_API_URL`
   - 值: `https://你的后端域名.com/api/v1`

   **临时方案** (如果后端还未部署):
   - 值: `http://localhost:4000/api/v1` (仅用于本地测试)

---

### 步骤6: 部署后端 🚀

你的前端托管在GitHub Pages，但**后端需要单独部署**。

**推荐部署平台**:

#### 选项A: Vercel (推荐)
```bash
# 安装Vercel CLI
npm install -g vercel

# 在项目根目录运行
cd C:\Users\Li Wen Xuan\Desktop\aipush
vercel

# 选择 apps/api 作为项目目录
# 添加环境变量 GLM_API_KEY
```

#### 选项B: Railway
1. 访问 https://railway.app/
2. 连接GitHub仓库
3. 选择 `apps/api` 目录
4. 添加环境变量:
   - `GLM_API_KEY=你的新密钥`
   - `DATABASE_URL=你的数据库URL`
   - 其他必需的环境变量

#### 选项C: Render
1. 访问 https://render.com/
2. 创建新的Web Service
3. 连接GitHub仓库
4. Root目录: `apps/api`
5. Build命令: `pnpm install && pnpm build`
6. Start命令: `pnpm start`
7. 添加环境变量

---

### 步骤7: 更新前端配置指向生产后端 🌐

部署后端后，获取后端URL（例如: `https://aipush-api.vercel.app`）

更新GitHub Secret `VITE_API_URL`:
```
https://你的后端域名/api/v1
```

然后触发GitHub Actions重新部署前端:
```bash
# 推送一个小改动或手动触发
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

---

## 🔍 验证检查清单

完成上述步骤后，验证以下内容:

- [ ] 新的GLM API密钥已获取
- [ ] `.env`文件已更新（第29行）
- [ ] 后端本地测试成功（curl命令返回新闻）
- [ ] 代码已提交到GitHub
- [ ] 旧的`VITE_GLM_API_KEY` GitHub secret已删除
- [ ] `VITE_API_URL` GitHub secret已正确配置
- [ ] 后端已部署到生产环境
- [ ] 前端已重新部署并指向生产后端
- [ ] 访问 https://xibaohuole.github.io/aipush/ 确认没有API key错误

---

## 🆘 故障排除

### 问题1: 后端API返回 "GLM API key not configured"
**解决**: 检查`.env`文件的GLM_API_KEY是否正确，重启后端服务

### 问题2: 前端显示 "Backend Connection Error"
**解决**:
1. 检查后端是否运行在4000端口
2. 检查`VITE_API_URL`环境变量是否正确
3. 检查CORS设置

### 问题3: GitHub Pages部署后仍然报错
**解决**:
1. 确认后端已部署并可访问
2. 确认`VITE_API_URL` secret指向正确的后端URL
3. 触发重新部署

### 问题4: API密钥仍然被检测为泄露
**解决**:
1. 确认已使用新密钥（不是旧的被泄露密钥）
2. 确认新密钥没有出现在任何提交的代码中
3. 运行: `git log -S "你的新密钥" --all` 确认没有泄露

---

## 📚 相关文档

- `SECURITY_FIX_SUMMARY.md` - 完整的安全修复总结
- `SECURITY.md` - 安全最佳实践
- `.env.example` - 环境变量示例

---

## 💡 重要提示

1. **永远不要**将`.env`文件提交到Git
2. **永远不要**在前端代码中硬编码API密钥
3. **定期轮换** API密钥（建议每3-6个月）
4. **监控** API使用情况，发现异常立即轮换密钥

---

## ✅ 完成后

一旦所有步骤完成，你的应用将是安全的:
- ✅ API密钥安全存储在后端
- ✅ 前端无法访问敏感凭据
- ✅ 所有AI调用通过后端代理
- ✅ 生产环境完全安全

如有问题，请查看后端日志或前端控制台错误信息。
