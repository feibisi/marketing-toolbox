# 🚨 Modiqi 设计规则速查表

> **⚠️ AI 必读**: 在修改任何 CSS/HTML 之前，必须阅读此文件。
> **版本**: 1.0.0 | **最后更新**: 2026-01-02

---

## ⛔ 绝对禁止 (工具页面)

> **适用范围**: 所有 `*-toolkit/*.html` 工具页面

### P0 级别 - 硬性规则

| # | 规则 | 禁止 | 允许 |
|---|------|------|------|
| 1 | **装饰性大圆角** | `border-radius: >8px` | `var(--radius-sm/md)` 或 `50%` |
| 2 | **硬编码颜色** | `color: #1a1a1a` | `var(--color-*)` 设计令牌 |
| 3 | **硬编码间距** | `padding: 16px` | `var(--spacing-*)` 设计令牌 |
| 4 | **悬停动画** | `:hover { transform }` | `:focus-within` 焦点状态 |
| 5 | **卡片阴影** | `box-shadow` | 仅 `.paper-*` 画布可用 |
| 6 | **过渡动画** | `transition: all 0.3s` | 功能性动画（见下方例外） |

---

## ✅ 例外情况 (详细说明)

### 🏠 启动器页面例外 (`launcher.css`)

启动器页面 (`index.html`, `*-toolkit/index.html`) **允许**以下样式：

| 样式 | 允许的值 | 说明 |
|------|---------|------|
| **卡片圆角** | `12px` | `.tool-card` 工具卡片 |
| **小圆角** | `4px`, `6px` | `.card-badge`, `.mini-preview`, `.version-info` |
| **胶囊圆角** | `99px` | `.version-tag` 版本标签 |
| **按钮圆角** | `6px` | `.widescreen-toggle` 切换按钮 |
| **卡片悬停** | `transform: translateY(-6px)` | 卡片上浮效果 |
| **过渡动画** | `transition: 0.2s-0.5s` | 卡片、按钮、链接 |

### ⭕ 圆形元素例外 (全局适用)

以下场景**始终允许** `border-radius: 50%`：

| 元素类型 | 类名 | 文件 |
|---------|------|------|
| **头像** | `.persona-avatar`, `.kol-avatar`, `.email-avatar`, `.fb-avatar`, `.mention-avatar`, `.agent-avatar`, `.head-icon` | 用户画像、KOL、邮件、社交工具 |
| **头像区域** | `.avatar-section`, `.avatar-placeholder`, `.agent-avatar-wrapper`, `.center-head` | 画像工具、AI 工具 |
| **图标按钮** | `.cravatar-icon-link` | 用户画像、KOL 评估 |
| **滑块按钮** | `::-webkit-slider-thumb`, `::-moz-range-thumb` | 所有 range input 滑块 |
| **分数圆盘** | `.score-circle` | 质量分数、邮件主题测试 |
| **中心圆形** | `.center-circle`, `.shape-circle`, `.circle-container::before` | SWOT、价值主张 |
| **字母圆圈** | `.letter-circle` | EAST 框架 (Nudge Planner) |
| **触点节点** | `.tp-circle`, `.add-tp-btn` | 归因模型 |
| **圆点指示器** | `.dot`, `.curve-point` | 社交监听、图表 |
| **迷你预览** | `.sk-circle`, `.v-circle`, `.swot-center`, `.empathy-head` | launcher.css |

#### 头像风格选择

头像支持两种圆角风格，根据设计类型选择：

| 风格 | 值 | 适用场景 |
|------|----|---------| 
| **圆形** | `border-radius: 50%` | 人物头像、用户图标、社交媒体风格 |
| **圆角方形** | `border-radius: 6%` | 应用图标、品牌 Logo、产品图片 |

### ⏱️ 功能性动画例外 (工具页面适用)

以下场景**允许** `transition`：

| 场景 | 允许的动画 | 禁止的动画 |
|------|-----------|-----------|
| **进度条** | ✅ 宽度/值变化动画 | - |
| **仪表盘指针** | ✅ 旋转动画 | - |
| **折叠/展开** | ✅ 高度变化动画 | - |
| **加载状态** | ✅ 旋转/脉冲动画 | - |
| **卡片悬停** | - | ❌ hover 缩放、阴影 |
| **按钮悬停** | - | ❌ hover 背景渐变 |

---

### P1 级别 - 结构规则

| # | 规则 | 说明 |
|---|------|------|
| 7 | **CSS 加载顺序** | tokens.css → base.css → components.css → canvas.css → 工具CSS |
| 8 | **必须初始化 ModiqiApp** | `new ModiqiApp('tool_id_v1')` |
| 9 | **必须初始化 Lucide 图标** | `lucide.createIcons({ attrs: { class: "icon", 'stroke-width': 2 }})` |
| 10 | **画布类型选择** | **默认A3**；仅简单表单/清单/竖版内容用A4；**无A4横向** |

---

## ✅ 必须遵循 (核心设计原则)

### 1. 单色优先 (Monochrome-First)

```css
/* ✅ 默认: 灰色/中性色 */
.icon { color: var(--color-text-secondary); }
.badge { background: var(--color-bg-subtle); }

/* ✅ 彩色模式下才使用语义色 */
body.color-mode .badge.success {
    background: var(--color-semantic-strength);
}
```

### 2. 以静为美 (静态交互)

```css
/* ✅ 使用 :focus-within 替代 :hover */
.card:focus-within {
    outline: 2px solid var(--color-focus-ring);
    background: var(--color-focus-bg);
}

/* ❌ 禁止 */
.card:hover { transform: scale(1.02); }
```

### 3. 边框优先于阴影

```css
/* ✅ 正确: 使用边框 */
.card { border: 1px solid var(--border-sem-outer); }

/* ❌ 错误: 使用阴影 */
.card { box-shadow: var(--shadow-md); }

/* ⚠️ 例外: 只有 .paper-* 可以有阴影 */
.paper-a3 { box-shadow: var(--shadow-paper); }
```

### 4. 语义化边框变量

```css
var(--border-sem-outer)   /* 外边框 - 卡片、主网格轮廓 */
var(--border-sem-inner)   /* 内分隔线 - 表格、区块内部 */
var(--border-sem-dashed)  /* 虚线 - 占位符、添加按钮 */
```

### 5. 打印优化

```css
@media print {
    /* 移除阴影和背景 */
    .paper-a3, .paper-a4 { box-shadow: none; }
    
    /* 确保边框可见 */
    .card { border: 1px solid #333 !important; }
    
    /* 隐藏工具栏 */
    .modiqi-toolbar { display: none !important; }
}
```

---

## 📋 情境触发器 (何时查阅什么)

| 当你正在做... | 必须先阅读... | 关注重点 |
|--------------|--------------|---------|
| **创建新工具** | `shared/templates/tool-template-*.html` | HTML 结构 |
| **修改 CSS** | 本文件 (DESIGN_RULES.md) | 禁止清单 |
| **处理溢出** | `DESIGN_SYSTEM.md` §溢出处理策略 | 优先级表 |
| **添加颜色** | `tokens.css` + 本文件 §单色优先 | 语义化令牌 |
| **添加交互** | 本文件 §以静为美 | focus-within |
| **不确定时** | 询问用户或记录到 `DESIGN_DECISIONS.md` | - |

---

## 🎯 参考范例 (Golden Examples)

> 当实现新功能时，优先参考这些已审核的工具

| 模式 | 参考工具 | 学习重点 |
|-----|---------|---------|
| **A3 画布布局** | `strategy-toolkit/swot-analysis.html` | 网格、模块间距 |
| **表格密集型** | `content-marketing-hub/content-performance.html` | 表格样式、溢出处理 |
| **竞争者可视化** | `competitive-intelligence/landscape-map.html` | 拖拽、气泡定位 |
| **表单工具** | `email-toolkit/subject-line-tester.html` | 输入框、验证 |
| **卡片网格** | `analytics-toolkit/rfm-analysis.html` | 卡片布局、Badge |

---

## 🔢 关键设计令牌速查

### 间距 (基于 8pt 网格)
```
--spacing-xs: 4px    --spacing-sm: 8px
--spacing-md: 16px   --spacing-lg: 24px
--spacing-xl: 32px   --spacing-2xl: 48px
```

### 字号
```
--font-size-xs: 0.65rem (10.4px)  --font-size-sm: 0.75rem (12px)
--font-size-base: 0.9rem (14.4px) --font-size-md: 1rem (16px)
--font-size-lg: 1.1rem (17.6px)   --font-size-xl: 1.25rem (20px)
```

### 画布尺寸
```
--canvas-a3-width: 1400px   --canvas-a3-height: 990px
--canvas-a4-width: 794px    --canvas-a4-height: 1123px
```

---

## 📝 决策流程

```
遇到设计问题
    │
    ├─→ 本文件有规定？→ 遵循规则
    │
    ├─→ DESIGN_SYSTEM.md 有规定？→ 遵循规范
    │
    ├─→ 参考范例有类似做法？→ 参考实现
    │
    └─→ 都没有？→ 询问用户 → 记录到 DESIGN_DECISIONS.md
```

---

## ⚡ 快速检查清单

在提交代码前，确认以下所有项目：

- [ ] 无大圆角 (>8px) (除启动器卡片外)
- [ ] 无硬编码颜色值
- [ ] 无 `:hover` 动画效果
- [ ] 无 `box-shadow` (除 `.paper-*` 外)
- [ ] 无 `transition` 属性
- [ ] 图标使用 `--color-text-secondary`
- [ ] 可编辑容器有 `:focus-within` 样式
- [ ] 使用语义化边框变量
- [ ] CSS 按正确顺序加载
- [ ] `data-save-key` 属性已添加到可编辑元素

---

**维护者**: Modiqi Design System Team  
**关联文档**: 
- [QUICKSTART.md](./QUICKSTART.md) - 快速入门
- [COMMON_MISTAKES.md](./COMMON_MISTAKES.md) - 常见错误
- [GLOSSARY.md](./GLOSSARY.md) - 术语表
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 完整规范
- [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) - 决策记录
