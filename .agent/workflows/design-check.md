---
description: 设计规则检查 - 修改CSS/HTML前必须执行
---

# 设计规则检查工作流

此工作流在修改任何 CSS 或 HTML 文件前自动触发。

## 触发条件

当 AI 代理执行以下操作时，必须先执行此工作流：
- 创建新的 `.css` 文件
- 修改现有 `.css` 文件
- 创建新的 `.html` 工具文件
- 修改现有工具的 HTML 结构

## 执行步骤

### 1. 阅读设计规则速查表
// turbo
```
view_file docs/DESIGN_RULES.md
```

**关注重点**:
- ⛔ 绝对禁止清单
- ✅ 核心设计原则
- 🔢 关键设计令牌

### 2. 确认情境触发器

根据当前任务类型，检查是否需要阅读额外文档：

| 任务类型 | 额外阅读 |
|---------|---------|
| 创建新工具 | `shared/templates/tool-template-*.html` |
| 处理溢出 | `docs/DESIGN_SYSTEM.md` §溢出处理策略 |
| 添加颜色 | `shared/css/tokens.css` |
| 参考实现 | `docs/GOLDEN_EXAMPLES.md` |

### 3. 检查参考范例

如果任务涉及特定模式，先查看对应的黄金范例：

// turbo
```
view_file docs/GOLDEN_EXAMPLES.md
```

### 4. 执行修改

现在可以进行代码修改。

### 5. 提交前检查

在完成修改后，验证以下所有项目：

```markdown
- [ ] 无 border-radius (除启动器外)
- [ ] 无硬编码颜色值
- [ ] 无 :hover 动画效果
- [ ] 无 box-shadow (除 .paper-* 外)
- [ ] 无 transition 属性
- [ ] 图标使用 --color-text-secondary
- [ ] 可编辑容器有 :focus-within 样式
- [ ] 使用语义化边框变量
- [ ] CSS 按正确顺序加载
- [ ] data-save-key 已添加
```

### 6. 记录新决策（如适用）

如果实现了规范未覆盖的新模式：
1. 询问用户确认
2. 用户批准后，更新 `docs/DESIGN_DECISIONS.md`
3. 如果是通用模式，同时更新 `docs/DESIGN_RULES.md`

## 注意事项

- 如果对某个规则有疑问，**先询问用户**而不是假设
- 如果发现规范有冲突或遗漏，记录到 `DESIGN_DECISIONS.md`
- 紧急修复可以跳过步骤3，但必须执行步骤1和5

## 完成确认

工作流完成后，向用户简要报告：
- 遵循了哪些设计规则
- 参考了哪个范例（如适用）
- 是否有需要记录的新决策
