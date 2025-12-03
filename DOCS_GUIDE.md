# 文档维护指南 - AI Pulse Daily

> 保持文档清晰、最新和可维护

## 文档结构

### 核心文档

| 文档 | 用途 | 更新频率 |
|------|------|----------|
| [README.md](./README.md) | 项目主文档，架构说明 | 重大变更时 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 部署指南总览 | 新增部署方式时 |
| [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) | Render 详细部署 | Render 流程变化时 |
| [QUICKSTART.md](./QUICKSTART.md) | Docker 本地开发 | 开发流程变化时 |

### 技术文档

| 文档 | 用途 | 更新频率 |
|------|------|----------|
| [PERFORMANCE.md](./PERFORMANCE.md) | 性能优化指南 | 新增优化时 |
| [DEV_REFERENCE.md](./DEV_REFERENCE.md) | 开发快速参考 | 代码结构变化时 |
| [DEV_COMPONENTS.md](./DEV_COMPONENTS.md) | 组件详细分析 | 组件重构时 |
| [采集新闻数据说明.md](./采集新闻数据说明.md) | 新闻采集说明 | 采集流程变化时 |

### 辅助文档

| 文档 | 用途 | 更新频率 |
|------|------|----------|
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 故障排查 | 发现新问题时 |
| [DOCKER.md](./DOCKER.md) | Docker 详细说明 | Docker 配置变化时 |
| [PROGRESS.md](./PROGRESS.md) | 项目进度追踪 | 里程碑完成时 |
| [SECURITY.md](./SECURITY.md) | 安全说明 | 安全策略变化时 |

---

## 文档命名规范

### 命名原则

1. **清晰明确**: 文件名应明确说明内容
2. **避免重复**: 不要创建功能重复的文档
3. **使用英文**: 主要文档使用英文命名（除非特定语言文档）
4. **全大写**: 主要文档使用全大写（如 README.md）
5. **下划线连接**: 多个单词使用下划线（如 DEV_REFERENCE.md）

### 命名示例

✅ **好的命名**:
- `DEPLOYMENT.md` - 清晰
- `DEPLOYMENT_RENDER.md` - 明确平台
- `PERFORMANCE.md` - 简洁明了
- `DEV_COMPONENTS.md` - 清楚用途

❌ **不好的命名**:
- `QUICK_DEPLOY.md` vs `QUICK_START.md` - 容易混淆
- `RENDER_DEPLOYMENT.md` vs `RENDER_DEPLOY.md` - 重复
- `PERFORMANCE_ANALYSIS.md` vs `PERFORMANCE_SUMMARY.md` - 冗余

---

## 文档内容规范

### 文档结构模板

```markdown
# 文档标题 - 项目名

> 一句话描述文档用途

## 目录

- [章节1](#章节1)
- [章节2](#章节2)

---

## 章节1

### 子章节

内容...

---

## 相关文档

- [链接到相关文档]

---

**更新日期**: YYYY-MM-DD
```

### 内容要求

1. **保持简洁**: 避免冗长的说明
2. **代码示例**: 提供清晰的代码示例
3. **截图/图表**: 必要时使用可视化
4. **链接引用**: 使用相对链接引用其他文档
5. **更新日期**: 在文档底部标注最后更新日期

---

## 文档维护流程

### 1. 创建新文档

**检查清单**:
- [ ] 确认没有类似功能的现有文档
- [ ] 使用规范的命名
- [ ] 遵循结构模板
- [ ] 添加到 README.md 相关文档部分
- [ ] 添加到本指南的文档结构表格

**示例**:
```bash
# 创建新文档
touch NEW_FEATURE.md

# 编辑文档
# 添加内容...

# 更新 README.md
# 在"相关文档"部分添加链接
```

### 2. 更新现有文档

**检查清单**:
- [ ] 检查文档是否过时
- [ ] 更新相关内容
- [ ] 更新底部的"更新日期"
- [ ] 检查所有链接是否有效
- [ ] 如果结构变化，更新目录

**示例**:
```markdown
---

**更新日期**: 2024-12-03
**变更**: 添加了新的部署选项
```

### 3. 合并重复文档

**步骤**:
1. 识别重复内容
2. 创建综合文档
3. 合并所有有价值的信息
4. 删除旧文档
5. 更新所有引用链接
6. 提交 Git commit

**示例**:
```bash
# 创建综合文档
cat RENDER_DEPLOY.md RENDER_STEP_BY_STEP.md > DEPLOYMENT_RENDER.md

# 编辑并整理内容
# ...

# 删除旧文档
rm RENDER_DEPLOY.md RENDER_STEP_BY_STEP.md

# 提交更改
git add .
git commit -m "docs: merge Render deployment guides"
git push
```

### 4. 删除过时文档

**检查清单**:
- [ ] 确认文档确实过时
- [ ] 检查是否有其他文档引用
- [ ] 更新所有引用链接
- [ ] 在 Git commit 中说明删除原因

**示例**:
```bash
# 删除过时文档
rm OLD_GUIDE.md

# 提交
git add .
git commit -m "docs: remove outdated OLD_GUIDE.md (replaced by NEW_GUIDE.md)"
git push
```

---

## 定期维护任务

### 每月检查

- [ ] 检查所有链接是否有效
- [ ] 更新版本号和依赖信息
- [ ] 验证代码示例是否仍然有效
- [ ] 检查是否有重复内容

### 每季度检查

- [ ] 审查整个文档结构
- [ ] 合并相似文档
- [ ] 更新截图和可视化内容
- [ ] 收集用户反馈并改进

### 重大版本发布时

- [ ] 全面审查所有文档
- [ ] 更新所有过时信息
- [ ] 添加新功能文档
- [ ] 创建版本归档（如需要）

---

## 文档质量标准

### 必须包含

- ✅ 清晰的标题和描述
- ✅ 目录（对于长文档）
- ✅ 代码示例
- ✅ 相关文档链接
- ✅ 更新日期

### 应该包含

- ⭐ 常见问题解答
- ⭐ 故障排查步骤
- ⭐ 实际操作示例
- ⭐ 视觉辅助（截图/图表）

### 避免

- ❌ 过时的信息
- ❌ 重复内容
- ❌ 模糊的说明
- ❌ 破损的链接
- ❌ 缺少上下文的代码

---

## Git 提交规范

### 文档相关 Commit 类型

```bash
# 新建文档
git commit -m "docs: add DEPLOYMENT_RENDER.md"

# 更新文档
git commit -m "docs: update PERFORMANCE.md with new benchmarks"

# 合并文档
git commit -m "docs: merge duplicate Render deployment guides"

# 删除文档
git commit -m "docs: remove outdated QUICK_DEPLOY.md"

# 重命名文档
git commit -m "docs: rename QUICK_START.md to TROUBLESHOOTING.md"

# 修复文档
git commit -m "docs: fix broken links in README.md"

# 重构文档结构
git commit -m "docs: reorganize documentation structure"
```

---

## 文档审查清单

在提交文档更改前，检查：

### 内容质量
- [ ] 信息准确无误
- [ ] 代码示例可运行
- [ ] 步骤清晰易懂
- [ ] 没有拼写错误

### 结构组织
- [ ] 使用了适当的标题层级
- [ ] 包含目录（如需要）
- [ ] 章节逻辑清晰
- [ ] 相关内容分组合理

### 链接和引用
- [ ] 所有链接有效
- [ ] 使用相对路径
- [ ] 引用了相关文档
- [ ] 图片路径正确

### 格式一致性
- [ ] 代码块正确标记语言
- [ ] 表格格式正确
- [ ] 列表格式一致
- [ ] 缩进规范

---

## 快速参考

### 常用 Markdown 语法

```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体** *斜体*

- 无序列表
1. 有序列表

[链接文字](url)
![图片](path/to/image.png)

`行内代码`

```bash
代码块
```

| 表格 | 列1 | 列2 |
|------|-----|-----|
| 行1  | A   | B   |
```

### 相对链接示例

```markdown
# 链接到根目录文档
[README](./README.md)

# 链接到同级文档
[部署指南](./DEPLOYMENT.md)

# 链接到子目录
[API文档](./docs/api/README.md)

# 锚点链接
[跳转到某章节](#章节名称)
```

---

## 工具推荐

### Markdown 编辑器

- **VS Code** + Markdown 插件
- **Typora** - 所见即所得
- **Obsidian** - 知识管理

### 链接检查工具

```bash
# 安装 markdown-link-check
npm install -g markdown-link-check

# 检查文档链接
markdown-link-check README.md
```

### 文档预览

```bash
# 使用 grip 预览 GitHub 风格 Markdown
pip install grip
grip README.md
# 访问 http://localhost:6419
```

---

## 联系和反馈

- **文档问题**: 提交 GitHub Issue
- **改进建议**: 创建 Pull Request
- **紧急问题**: 联系项目维护者

---

**本指南最后更新**: 2024-12-03
**维护者**: AI Pulse Daily Team
