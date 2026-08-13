---
description: 创建新工具 - 从模板创建符合设计系统的新工具
---

# 创建新工具工作流

此工作流指导如何从零创建一个符合 Modiqi 设计系统的新工具。

## 前置条件

- 确定工具名称（中英文）
- 确定目标工作台（toolkit）
- 确定画布类型（A3/A4/A4横向）

## 执行步骤

### 1. 阅读设计规则
// turbo
```
view_file docs/DESIGN_RULES.md
```

### 2. 选择并复制模板

**画布选择规则**：
- **A3 横向** (默认): 适用于大多数工具 - 矩阵、仪表盘、地图、多模块布局
- **A4 纵向**: 仅用于简单表单、清单、竖版线性流程

> ⚠️ **重要**: 没有"A4 横向"这个选项。横向内容一律使用 A3。

| 画布类型 | 模板文件 | 适用场景 |
|---------|---------|---------|
| **A3 横向 (默认)** | `tool-template-a3.html` | 矩阵、仪表盘、画布、复杂工具 |
| A4 纵向 | `tool-template-a4.html` | 简单表单、清单、线性流程 |

复制模板到目标位置：
```bash
# 默认使用 A3 模板
cp shared/templates/tool-template-a3.html seo-toolkit/keyword-research.html
```

### 3. 替换占位符

在新文件中全局替换以下占位符：

| 占位符 | 替换为 | 示例 |
|--------|-------|------|
| `{{TOOL_NAME_CN}}` | 工具中文名 | 关键词研究工具 |
| `{{TOOL_NAME_EN}}` | 工具英文名 | Keyword Research Tool |
| `{{TOOL_ID}}` | 唯一工具ID | keyword_research_v1 |
| `{{TOOL_DESCRIPTION}}` | 工具描述 | 帮助您发现和分析SEO关键词 |
| `{{TOOLKIT_NAME}}` | 工作台名称 | seo-toolkit |
| `{{ICON_NAME}}` | Lucide图标名 | search |

### 4. 创建工具特定 CSS

// turbo
```
mkdir -p {toolkit-name}/assets/css
touch {toolkit-name}/assets/css/{tool-name}.css
```

在 CSS 文件顶部添加标准注释头：

```css
/* ============================================
   {Tool Name} Styles
   工具: {工具中文名} ({Tool Name EN})
   
   Design System Compliance:
   - 使用设计令牌，禁止硬编码
   - 无圆角 (border-radius: 0)
   - 单色优先，支持 color-mode
   - 使用语义边框变量
   ============================================ */
```

### 5. 参考黄金范例

根据工具类型查看对应范例：
// turbo
```
view_file docs/GOLDEN_EXAMPLES.md
```

然后查看具体范例文件获取实现参考。

### 6. 实现工具内容

根据工具需求实现具体内容。

**必须遵循**:
- 所有颜色使用 CSS 变量
- 所有间距使用 `--spacing-*`
- 可编辑元素添加 `data-save-key`
- 使用 `:focus-within` 替代 `:hover`

### 7. 验证工具

在浏览器中打开工具，检查：

```markdown
### 功能测试
- [ ] 工具正常显示
- [ ] 图标正常加载
- [ ] 数据可以保存
- [ ] 主题切换正常

### 样式测试
- [ ] 无 border-radius
- [ ] 无硬编码颜色
- [ ] 无 hover 动画
- [ ] 打印预览正常

### 代码质量
- [ ] 无控制台错误
- [ ] CSS 按正确顺序加载
- [ ] HTML 语义化
```

### 8. 更新工作台索引

在对应的 `{toolkit-name}/index.html` 中添加工具卡片：

```html
<a href="{tool-name}.html" class="tool-card">
    <div class="tool-icon">
        <i data-lucide="{icon-name}"></i>
    </div>
    <div class="tool-info">
        <h3>{工具中文名}</h3>
        <p>{工具描述}</p>
    </div>
</a>
```

### 9. 更新工具数量

更新工作台的版本标签中的工具数量。

## 完成确认

工具创建完成后，确认：
- [ ] 工具文件已创建
- [ ] CSS 文件已创建
- [ ] 工作台索引已更新
- [ ] 所有验证项通过
