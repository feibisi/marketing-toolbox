# Modiqi 设计系统使用指南 v2.4.0

> 本文保留组件和历史实现细节。产品类型、纸张边界及验收优先级以 [`DESIGN_CONSTITUTION.md`](DESIGN_CONSTITUTION.md) 为准；本文中 A4 横向、固定纸张与溢出处理的历史矛盾不得作为新实现依据。

> **文档版本**: 2.4.0
> **最后更新**: 2026-01-02
> **适用范围**: 所有 Modiqi 数字营销工作台

---

## 🚨 AI 代理快速入口

> **修改 CSS/HTML 前必读**: [DESIGN_RULES.md](./DESIGN_RULES.md) - 核心规则速查表
> **创建新工具**: 使用工作流 `/new-tool`
> **遇到规范未覆盖情况**: 使用工作流 `/record-decision`

### 相关文档

| 文档 | 用途 | 何时查阅 |
|------|------|---------|
| [DESIGN_RULES.md](./DESIGN_RULES.md) | 核心规则速查 | **每次修改前** |
| [GOLDEN_EXAMPLES.md](./GOLDEN_EXAMPLES.md) | 参考范例 | 实现新功能时 |
| [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md) | 布局/交互模式 | 选择模式时 |
| [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) | 决策记录 | 遇到新情况时 |

---

## 📚 目录

1. [快速开始](#快速开始)
2. [设计原则](#设计原则)
3. [文件结构](#文件结构)
4. [颜色系统](#颜色系统)
5. [字体系统](#字体系统)
6. [间距系统](#间距系统)
7. [组件库](#组件库)
8. [画布布局](#画布布局)
9. [动态内容管理](#动态内容管理)
10. [JavaScript集成](#javascript集成)
11. [主题系统](#主题系统)
12. [数据持久化](#数据持久化)
13. [打印优化](#打印优化)
14. [无障碍访问](#无障碍访问)
15. [性能优化](#性能优化)
16. [禁止事项](#禁止事项)
17. [测试清单](#测试清单)
18. [FAQ](#faq)

---

## 🚀 快速开始

### 方式1: 使用模板创建新工具

```bash
# 1. 选择合适的模板
cd shared/templates/

# 2. 复制模板到目标工作台
cp tool-template-a3.html ../../seo-toolkit/keyword-research.html

# 3. 全局替换占位符
# {{TOOL_NAME_CN}}     → 关键词研究工具
# {{TOOL_NAME_EN}}     → Keyword Research Tool
# {{TOOL_ID}}          → keyword_research_v1
# {{TOOL_DESCRIPTION}} → 帮助您发现和分析SEO关键词
# {{TOOL_KEYWORDS}}    → 关键词研究,SEO,搜索优化
# {{TOOLKIT_NAME}}     → seo-toolkit
# {{ICON_NAME}}        → search

# 4. 创建工具特定CSS
mkdir -p ../../seo-toolkit/assets/css
touch ../../seo-toolkit/assets/css/keyword-research.css
```

### 方式2: 手动引入设计系统

**所有工具页面都必须按以下顺序引入CSS**:

```html
<!-- 1. 设计令牌 (必须第一个加载) -->
<link rel="stylesheet" href="../shared/css/tokens.css">

<!-- 2. 基础样式 -->
<link rel="stylesheet" href="../shared/css/base.css">

<!-- 3. 组件库 -->
<link rel="stylesheet" href="../shared/css/components.css">

<!-- 4. 画布布局 -->
<link rel="stylesheet" href="../shared/css/canvas.css">

<!-- 5. 工具特定样式 (最后加载,可覆盖默认样式) -->
<link rel="stylesheet" href="assets/css/your-tool.css">
```

**引入顺序错误会导致样式优先级混乱!**

### 初始化JavaScript

```html
<script src="../shared/js/core.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        // 初始化ModiqiApp (必需)
        new ModiqiApp('your_tool_id_v1'); // 唯一ID用于localStorage

        // 初始化图标 (必需)
        lucide.createIcons({
            attrs: {
                class: "icon",
                'stroke-width': 2
            }
        });
    });
</script>
```

---

## 💡 设计原则

### 1. 单色优先设计 (Monochrome-First Design)

**核心原则**: 所有工具默认使用黑白灰单色设计,确保打印友好性和专业性。

#### 为什么单色优先?

1. **打印友好**: 黑白打印时不会丢失信息
2. **专业性**: 单色设计更专业、更正式
3. **可访问性**: 不依赖颜色传达信息
4. **成本效益**: 黑白打印成本更低

#### 单色设计规范

**标准灰度色板** (用于SVG和图形元素):

```css
/* 单色设计专用灰度色板 */
#ffffff  /* 纯白 - 背景 */
#f8fafc  /* 极浅灰 - 次级背景 */
#f1f5f9  /* 浅灰 - 卡片背景 */
#e2e8f0  /* 中浅灰 - 边框、分隔线 */
#cbd5e1  /* 中灰 - 图形填充 */
#94a3b8  /* 深中灰 - 图形强调 */
#64748b  /* 深灰 - 重要元素 */
#475569  /* 极深灰 - 文字、边框 */
```

#### SVG图形规范

**❌ 错误示例** (使用彩色):

```html
<svg>
    <!-- 禁止使用品牌色、彩色 -->
    <rect fill="#07c160" />  <!-- 微信绿 -->
    <rect fill="#fe2c55" />  <!-- 抖音红 -->
    <rect fill="var(--color-brand-blue)" />  <!-- CSS变量 -->
</svg>
```

**✅ 正确示例** (单色灰度):

```html
<svg>
    <!-- 使用灰度色板 -->
    <rect fill="#cbd5e1" />
    <rect fill="#94a3b8" />
    <rect fill="#64748b" />
</svg>
```

#### 彩色模式 (可选)

用户可以通过工具栏开启"彩色模式",此时可以显示语义化颜色:

```css
/* 默认: 单色设计 */
.difficulty-indicator {
    background: var(--color-bg-subtle);  /* 灰色背景 */
}

/* 彩色模式: 使用语义化颜色 */
body.color-mode .difficulty-indicator.low {
    background: var(--color-semantic-strength);  /* 绿色 */
}

body.color-mode .difficulty-indicator.high {
    background: var(--color-semantic-pain);  /* 红色 */
}
```

**重要**: 彩色模式是增强功能,不应该是必需的。所有信息在单色模式下也必须清晰可辨。

#### 图标颜色规范

**默认使用单色灰度**:

```css
/* ✅ 正确: 使用文本色令牌 */
.icon {
    color: var(--color-text-secondary);  /* 灰色 */
}

.header-icon {
    color: var(--color-text-tertiary);   /* 浅灰色 */
}

/* ❌ 错误: 使用品牌色 */
.icon {
    color: var(--color-brand-accent);    /* 红色 - 违反单色原则 */
}
```

**规范**:
- 内容区图标: 使用 `--color-text-secondary`
- 次要图标: 使用 `--color-text-tertiary`
- 禁止使用品牌色 (`--color-brand-accent`, `--color-brand-blue`) 除非在彩色模式下

---

### 2. 使用设计令牌,禁止硬编码

**设计令牌是"单一真相来源"(Single Source of Truth)** - 所有视觉属性都应该使用CSS变量,而不是硬编码值。

#### ❌ 错误示例:

```css
.my-card {
    background: #ffffff;              /* 硬编码颜色 */
    color: #1a1a1a;                  /* 硬编码颜色 */
    padding: 24px;                    /* 硬编码间距 */
    border-radius: 8px;               /* 硬编码圆角 */
    font-size: 14px;                  /* 硬编码字号 */
}
```

#### ✅ 正确示例:

```css
.my-card {
    background: var(--color-bg-white);     /* 使用设计令牌 */
    color: var(--color-text-primary);      /* 使用设计令牌 */
    padding: var(--spacing-lg);            /* 使用设计令牌 */
    border-radius: var(--radius-md);       /* 使用设计令牌 (允许微圆角) */
    font-size: var(--font-size-base);      /* 使用设计令牌 */
}
```

**为什么必须使用设计令牌?**

1. **一致性**: 所有工具使用统一的颜色、间距、字号
2. **主题切换**: 主题切换时,令牌值自动更新,无需修改代码
3. **可维护性**: 修改一个令牌值,所有使用该令牌的地方都会更新
4. **可访问性**: 令牌确保对比度、字号等符合无障碍标准

### 2. 语义化命名

**使用语义化的类名,而不是描述性的类名**

#### ❌ 错误示例:

```html
<div class="box1 blue-text padding-20 big-font">
    内容
</div>
```

#### ✅ 正确示例:

```html
<div class="metric-card text-primary">
    <h3 class="metric-label">总营收</h3>
    <div class="metric-value">¥1,250,000</div>
</div>
```

**命名建议**:
- `.card` 而不是 `.white-box`
- `.btn-primary` 而不是 `.blue-button`
- `.text-muted` 而不是 `.gray-text`
- `.metric-value` 而不是`.big-number`

### 3. 移动优先,响应式设计

**所有工具必须在1024px-1920px宽度下正常显示**

```css
/* 基础样式 (默认桌面端) */
.tool-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
}

/* 中等屏幕 */
@media (max-width: 1200px) {
    .tool-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 小屏幕 */
@media (max-width: 768px) {
    .tool-grid {
        grid-template-columns: 1fr;
    }
}
```

### 4. 渐进增强

**基础功能不依赖JavaScript,JavaScript用于增强体验**

```html
<!-- 即使JS未加载,表单仍可编辑 -->
<div class="section-content" contenteditable="true" data-save-key="notes">
    默认内容
</div>

<!-- JS加载后,自动保存功能增强体验 -->
<script>
    // ModiqiApp会自动监听contenteditable的input事件并保存
</script>
```

### 5. 微交互与动效规范 (以静为美)

**核心哲学**: Modiqi工具模拟纸张工作流，因此**以静为美**。用户与内容的交互应该像在纸上书写一样直接、安静，不需要华丽的动画效果。

#### 禁止的动效

| 动效类型 | 示例 | 为什么禁止 |
|---------|------|----------|
| **悬停放大** | `transform: scale(1.05)` | 干扰视觉焦点，与纸张静态特性冲突 |
| **悬停阴影** | `:hover { box-shadow: ... }` | 纸张上的元素不会因为鼠标经过而"浮起" |
| **过渡动画** | `transition: all 0.3s` | 增加视觉噪音，分散注意力 |
| **弹跳效果** | `transition: var(--transition-bounce)` | 不符合专业工具的克制美学 |

#### ❌ 错误示例:

```css
/* 禁止：悬停时放大和加阴影 */
.card:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
}

/* 禁止：悬停时添加过渡动画 */
.button {
    transition: all var(--transition-fast);
}
.button:hover {
    background: var(--color-bg-hover);
}
```

#### ✅ 正确示例:

```css
/* 正确：无hover效果，使用focus-within */
.card {
    background: var(--color-bg-white);
    border: 1px solid var(--color-border-medium);
    /* 无box-shadow，无transition */
}

/* 正确：编辑时高亮（focus-within） */
.card:focus-within {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: -2px;
    background: var(--color-focus-bg);
}
```

#### 统一交互反馈模式: `:focus-within`

**所有可编辑容器（卡片、气泡、单元格等）都应使用 `:focus-within` 提供反馈**，而非 `:hover`。

**原因**:
1. **意图明确**: 用户点击进入编辑状态时才高亮，而非仅仅鼠标经过
2. **纸张隐喻**: 纸上书写时，你正在写的区域才会被关注
3. **无障碍**: 键盘导航时同样有效
4. **一致性**: 全局统一的交互模式，用户容易预测

**标准样式**:

```css
/* 所有可编辑容器的统一focus-within样式 */
.editable-container:focus-within {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: -2px;
    background: var(--color-focus-bg);
}
```

**应用范围**:
- `.competitor-bubble:focus-within` - 竞争格局图中的气泡
- `.competitor-card:focus-within` - 竞争者信息卡片
- `.swot-card:focus-within` - SWOT分析卡片
- `.canvas-card:focus-within` - 商业模式画布卡片
- `.journey-stage:focus-within` - 客户旅程阶段
- 所有包含 `contenteditable` 元素的容器

#### 阴影使用规范

| 元素类型 | 是否使用阴影 | 说明 |
|---------|-------------|------|
| **画布容器 (.paper-a3, .paper-a4)** | ✅ `--shadow-paper` | 模拟纸张投影在桌面上的效果 |
| **卡片 (.card, .competitor-card)** | ❌ 无阴影 | 使用边框代替阴影进行区分 |
| **气泡/标签** | ❌ 无阴影 | 使用边框代替阴影 |
| **输入框** | ❌ 无阴影 | 使用边框和focus状态 |
| **浮动工具栏** | ⚠️ 极轻微阴影(可选) | 仅用于表示浮动层级 |

#### 边框优先原则

在Modiqi设计系统中，**边框优先于阴影**用于视觉分隔：

```css
/* ✅ 正确：使用边框 */
.card {
    border: 1px solid var(--color-border-medium);
}

/* ❌ 错误：使用阴影 */
.card {
    box-shadow: var(--shadow-md);
}
```

#### 允许的简单状态变化

以下简单的状态变化是允许的（无动画）：

```css
/* 允许：输入框获焦时边框颜色变化（无transition） */
.input:focus {
    border-color: var(--color-focus-border);
    outline: 2px solid var(--color-focus-ring);
    outline-offset: -2px;
}

/* 允许：按钮点击时背景色变化（无transition） */
.button:active {
    background: var(--color-bg-warm-medium);
}
```

---



## 📁 文件结构

```
marketing-toolbox/
├── shared/                          # 共享设计系统
│   ├── css/
│   │   ├── tokens.css              # 🎨 设计令牌 (颜色、字体、间距等)
│   │   ├── base.css                # 🧱 基础样式 (Reset、工具类)
│   │   ├── components.css          # 🧩 组件库 (按钮、卡片、输入框等)
│   │   ├── canvas.css              # 📄 画布布局 (A3/A4纸张容器)
│   │   └── launcher.css            # 🏠 启动器/主页样式
│   ├── js/
│   │   └── core.js                 # ⚙️ 核心JavaScript (自动保存、主题切换、导出等)
│   ├── images/
│   │   └── modiqi-logo-r.png       # Logo
│   └── templates/                  # 📝 工具模板
│       ├── tool-template-a3.html           # A3横向模板
│       ├── tool-template-a4.html           # A4纵向模板
│       └── tool-template-a4-landscape.html # A4横向模板
│
├── strategy-toolkit/                # 战略工作台 (示例)
│   ├── index.html                   # 工作台主页
│   ├── swot-analysis.html           # SWOT分析工具
│   ├── business-model-canvas.html   # 商业模式画布
│   └── assets/
│       ├── css/
│       │   ├── swot-analysis.css    # 工具特定样式
│       │   └── business-model-canvas.css
│       └── js/
│           └── examples.js          # 示例数据
│
├── seo-toolkit/                     # SEO工作台 (待开发)
│   └── ...
│
├── docs/                            # 📚 文档
│   ├── DESIGN_SYSTEM.md             # 设计系统使用指南 (本文档)
│   ├── CONTRIBUTION_GUIDE.md        # 贡献指南
│   └── CHANGELOG.md                 # 变更日志
│
└── index.html                       # 总主页
```

---

## 🎨 颜色系统

### 颜色令牌层级

Modiqi设计系统的颜色分为**3个层级**:

```
颜色令牌层级:
┌─────────────────────────────────────────┐
│ Level 1: 基础色板 (Base Palette)        │
│ - 品牌色                                 │
│ - 中性色 (灰度)                          │
│ - 系统色 (成功/警告/错误/信息)           │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│ Level 2: 语义化令牌 (Semantic Tokens)   │
│ - --color-bg-*    (背景色)              │
│ - --color-text-*  (文本色)              │
│ - --color-border-* (边框色)             │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│ Level 3: 组件令牌 (Component Tokens)    │
│ - --color-semantic-strength (SWOT优势)  │
│ - --color-semantic-weakness (SWOT劣势)  │
│ - --color-focus-border (焦点边框)       │
└─────────────────────────────────────────┘
```

### 品牌色 (Brand Colors)

```css
--color-brand-primary: #1a1a1a;      /* 主品牌色 - 深黑色 */
--color-brand-blue: #4e609f;         /* Modiqi品牌蓝 */
--color-brand-blue-dark: #3d4c7f;    /* 品牌蓝深色 (hover) */
--color-brand-accent: #d32f2f;       /* 强调色 - 红色 */
--color-brand-accent-light: #ff6b6b; /* 强调色浅色 */
```

**使用场景**:
- `--color-brand-primary`: 主标题、logo、主要按钮
- `--color-brand-blue`: 链接、品牌标识
- `--color-brand-accent`: 重要提示、CTA按钮

### 背景色 (Background Colors)

```css
/* 主要背景 */
--color-bg-desk: #e3dad3;      /* 桌面背景 - 暖米色 (内页) */
--color-bg-desk-alt: #EAE8E3;  /* 桌面背景 - 淡暖灰 (主页/合集页) */
--color-bg-paper: #fdfbf7;     /* 纸张背景 - 象牙白 */
--color-bg-white: #ffffff;     /* 纯白背景 */

/* 次级背景 (暖色调灰阶) */
--color-bg-subtle: #f8f6f3;       /* 微暖浅灰 - 卡片/区块背景 */
--color-bg-muted: #f3f0ec;        /* 暖灰 - 次级区域 */
--color-bg-warm-light: #f5f3f0;   /* 表格行/单元格背景 */
--color-bg-warm-medium: #ebe8e4;  /* 表头/分隔区块 */
--color-bg-warm-dark: #e0dcd7;    /* 更深的暖灰背景 */

/* 交互状态背景 */
--color-bg-hover: #f1f5f9;      /* 卡片悬停 - 淡蓝灰 */
--color-bg-hover-warm: #f3f0ec; /* 卡片悬停 - 暖色调 */
```

**使用场景**:
- `--color-bg-desk`: body背景
- `--color-bg-paper`: A3/A4画布容器
- `--color-bg-white`: 卡片、输入框
- `--color-bg-subtle`: 次级区域、表格行

### 文本色 (Text Colors)

```css
--color-text-primary: #1a1a1a;    /* 主要文本 - 深黑色 */
--color-text-secondary: #666666;  /* 次要文本 - 中灰色 */
--color-text-tertiary: #888888;   /* 三级文本 - 浅灰色 */
--color-text-muted: #999999;      /* 辅助文本 - 更浅灰色 */
--color-text-disabled: #cccccc;   /* 禁用文本 - 极浅灰 */
```

**对比度要求** (WCAG AA标准):
- `--color-text-primary` on `--color-bg-white`: **14.6:1** ✅ (AAA级)
- `--color-text-secondary` on `--color-bg-white`: **7.3:1** ✅ (AA级)
- `--color-text-tertiary` on `--color-bg-white`: **4.8:1** ✅ (AA级)

### 边框色 (Border Colors)

```css
--color-border-strong: #333333;   /* 强边框 - 深灰 */
--color-border-medium: #e5e7eb;   /* 中等边框 - Cool gray 200 */
--color-border-light: #f3f4f6;    /* 浅边框 - Cool gray 100 */
--color-border-subtle: #f9fafb;   /* 极浅边框 - Cool gray 50 */

/* 语义化边框 */
--border-sem-outer: #a3a3a3;      /* 外边框 (卡片、主网格轮廓) */
--border-sem-inner: #d4d4d4;      /* 内分隔线 */
--border-sem-dashed: #dcdcdc;     /* 虚线占位符 */
--border-sem-input: transparent;  /* 输入框边框 (默认透明) */
--border-sem-input-hover: #d1d5db; /* 输入框悬停边框 */
```

### 系统状态色 (State Colors)

```css
--color-success: #52c41a;  /* 成功 - 绿色 */
--color-warning: #faad14;  /* 警告 - 橙色 */
--color-error: #ff4d4f;    /* 错误 - 红色 */
--color-info: #1890ff;     /* 信息 - 蓝色 */
```

**使用场景**:
```html
<div class="alert alert-success">操作成功!</div>
<div class="alert alert-warning">请注意...</div>
<div class="alert alert-error">发生错误!</div>
<div class="alert alert-info">温馨提示...</div>
```

### 语义化颜色 (工具专用)

#### SWOT分析专用颜色

```css
--color-semantic-strength: #e8f0e4;     /* 优势 - 柔和绿色 */
--color-semantic-weakness: #f5e6e4;     /* 劣势 - 柔和粉色 */
--color-semantic-opportunity: #e4eaf0;  /* 机会 - 柔和蓝色 */
--color-semantic-threat: #f5f0e4;       /* 威胁 - 柔和黄色 */
```

**使用示例** (swot-analysis.css):

```css
.swot-card.area-s {
    background-color: var(--color-semantic-strength);
}

.swot-card.area-w {
    background-color: var(--color-semantic-weakness);
}

.swot-card.area-o {
    background-color: var(--color-semantic-opportunity);
}

.swot-card.area-t {
    background-color: var(--color-semantic-threat);
}
```

#### 价值主张画布专用颜色

```css
--color-semantic-gain: #e6f0e8;      /* 获益 - 柔和薄荷色 */
--color-semantic-pain: #f2e4e4;      /* 痛点 - 柔和玫瑰色 */
--color-semantic-jobs: #e8eaf2;      /* 任务 - 柔和薰衣草色 */
--color-semantic-product: #f0e8f0;   /* 产品 - 柔和丁香色 */
```

#### 品牌原型专用颜色 (12种品牌原型分组)

```css
--color-archetype-independence: #eab308; /* 独立动机 - 黄色 (英雄、反叛者、魔术师) */
--color-archetype-mastery: #ef4444;      /* 掌控动机 - 红色 (创造者、统治者、照顾者) */
--color-archetype-belonging: #22c55e;    /* 归属动机 - 绿色 (情人、弄臣、凡人) */
--color-archetype-stability: #3b82f6;    /* 稳定动机 - 蓝色 (智者、纯真者、探险家) */
```

### 焦点色 (Focus Colors)

```css
--color-focus-bg: rgba(59, 130, 246, 0.08);   /* 焦点背景 - 淡蓝色半透明 */
--color-focus-ring: rgba(59, 130, 246, 0.4);  /* 焦点外环 - 蓝色半透明 */
--color-focus-border: #3b82f6;                /* 焦点边框 - 蓝色 */
```

**自动应用于** contenteditable元素:

```css
[contenteditable]:focus {
    background-color: var(--color-focus-bg);
    box-shadow: inset 2px 0 0 0 var(--color-focus-border);
    outline: none;
}
```

### 颜色使用指南

#### ✅ 正确用法:

```css
/* 使用语义化令牌 */
.my-card {
    background: var(--color-bg-white);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-light);
}

/* 按钮状态 */
.btn-primary {
    background: var(--color-brand-primary);
    color: var(--color-bg-white);
}

.btn-primary:hover {
    background: var(--color-text-secondary);
}
```

#### ❌ 错误用法:

```css
/* 禁止硬编码 */
.my-card {
    background: #ffffff;       /* ❌ 应使用 var(--color-bg-white) */
    color: #1a1a1a;           /* ❌ 应使用 var(--color-text-primary) */
    border: 1px solid #f3f4f6; /* ❌ 应使用 var(--color-border-light) */
}

/* 禁止使用RGB/RGBA (除非需要自定义透明度) */
.overlay {
    background: rgba(0, 0, 0, 0.5); /* ❌ 考虑添加设计令牌 */
}
```

**例外情况**: 当需要自定义透明度时,可以使用RGBA,但基础颜色应来自设计令牌:

```css
.overlay {
    /* 提取#1a1a1a的RGB值: rgb(26, 26, 26) */
    background: rgba(26, 26, 26, 0.8); /* ✅ 可接受 */
}

/* 更好的方式: 在tokens.css中添加透明度变体 */
--color-overlay-dark: rgba(26, 26, 26, 0.8);
```

---

## 🔤 字体系统

### 字体家族 (Font Families)

```css
--font-serif: 'Noto Serif SC', 'Songti SC', serif;      /* 衬线字体 - 用于标题 */
--font-sans: 'Noto Sans SC', 'PingFang SC', 'Inter', sans-serif; /* 无衬线字体 - 用于正文 */
--font-mono: 'SF Mono', 'Consolas', monospace;          /* 等宽字体 - 用于代码 */
```

**使用场景**:
- `--font-serif`: H1-H6标题、品牌标识、数字(营收、KPI等)
- `--font-sans`: 正文、按钮、输入框、标签
- `--font-mono`: 代码块、数据表格(可选)

### 字重 (Font Weights)

```css
--font-weight-light: 300;      /* 细体 - 用于大标题辅助文字 */
--font-weight-regular: 400;    /* 常规 - 用于正文 */
--font-weight-medium: 500;     /* 中等 - 用于标签、按钮 */
--font-weight-semibold: 600;   /* 半粗 - 用于小标题 */
--font-weight-bold: 700;       /* 粗体 - 用于主标题、强调 */
```

### 字号比例 (Type Scale)

**基于 1.25x (大三度音程) 比例**

```css
--font-size-xs: 0.65rem;    /* 10.4px - 微型文字(角标、超小说明) */
--font-size-sm: 0.75rem;    /* 12px   - 小号文字(标签、辅助文字) */
--font-size-base: 0.9rem;   /* 14.4px - 基准字号(正文、输入框) */
--font-size-md: 1rem;       /* 16px   - 中号文字(按钮、标签) */
--font-size-lg: 1.1rem;     /* 17.6px - 大号文字(小标题) */
--font-size-xl: 1.25rem;    /* 20px   - 超大文字(卡片标题) */
--font-size-2xl: 1.5rem;    /* 24px   - H2标题 */
--font-size-3xl: 1.7rem;    /* 27.2px - H1标题(A4画布) */
--font-size-4xl: 2.2rem;    /* 35.2px - H1标题(A3画布) */
```

**使用示例**:

```html
<h1 style="font-size: var(--font-size-4xl);">A3画布主标题</h1>
<h1 style="font-size: var(--font-size-3xl);">A4画布主标题</h1>
<h2 style="font-size: var(--font-size-2xl);">二级标题</h2>
<h3 style="font-size: var(--font-size-xl);">三级标题</h3>
<p style="font-size: var(--font-size-base);">正文段落</p>
<span style="font-size: var(--font-size-sm);">辅助文字</span>
<span style="font-size: var(--font-size-xs);">角标文字</span>
```

### 行高 (Line Heights)

```css
--line-height-tight: 1.1;      /* 紧凑 - 大标题 */
--line-height-snug: 1.3;       /* 紧密 - 小标题 */
--line-height-normal: 1.5;     /* 正常 - 正文 */
--line-height-relaxed: 1.6;    /* 放松 - 长文本 */
--line-height-loose: 1.8;      /* 松散 - 诗歌、引用 */
```

**可读性建议**:
- 正文 (14-16px): `line-height: 1.5-1.6`
- 小文字 (12px): `line-height: 1.4-1.5`
- 大标题 (>24px): `line-height: 1.1-1.3`

### 字间距 (Letter Spacing)

```css
--letter-spacing-tight: -0.02em;   /* 紧密 - 大标题 */
--letter-spacing-normal: 0;        /* 正常 - 正文 */
--letter-spacing-wide: 0.02em;     /* 略宽 - 小标签 */
--letter-spacing-wider: 0.05em;    /* 更宽 - 按钮、标签 */
--letter-spacing-widest: 0.15em;   /* 最宽 - 全大写文字 */
```

**使用示例**:

```css
/* 全大写标签 */
.badge {
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
}

/* 英文副标题 */
.english-subtitle {
    letter-spacing: var(--letter-spacing-wide);
}
```

### 文本转换 (Text Transform)

**适用场景**: 标题、标签、按钮等需要视觉强调的文本

**转换类型**:

```css
/* 全大写 */
text-transform: uppercase;

/* 首字母大写 */
text-transform: capitalize;

/* 全小写 */
text-transform: lowercase;

/* 无转换 */
text-transform: none;
```

**使用规范**:

| 场景 | 转换方式 | 字间距 | 示例 |
|------|---------|--------|------|
| 商业模式画布卡片标题 | `uppercase` | `0.05em` | `<h2 style="text-transform: uppercase;">协作与媒介</h2>` |
| 全大写标签/徽章 | `uppercase` | `0.15em` | `<span class="badge">NEW</span>` |
| 按钮文字 | `none` | `0.02em` | `<button>保存</button>` |
| 普通标题 | `none` | `normal` | `<h1>SWOT 分析</h1>` |

**CSS实现**:

```css
/* 商业模式画布标题 */
.canvas-grid .card-header h2 {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 1rem;
}

/* 全大写徽章 */
.badge {
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: var(--font-size-xs);
}
```

**使用原则**:
- ✅ 全大写用于需要强调的短文本(标签、徽章、紧凑标题)
- ✅ 全大写时增加字间距(0.05em-0.15em)提升可读性
- ❌ 不对长文本使用全大写(降低可读性)
- ❌ 不对中文段落使用text-transform(无效果)

**可读性建议**:
- 全大写文本长度 ≤ 20个字符
- 全大写时字号适当增大或字重加粗
- 全大写时行高适当增加

---

### 中英文标题规范 (Bilingual Titles)

**标准格式**: `中文标题 <span class="en-sub">(English Title)</span>`

**CSS类**: `.en-sub` (English Subtitle)

**样式规范**:

```css
.en-sub {
    font-size: 0.65em;                  /* 字号缩小 */
    font-weight: 400;                   /* 常规字重 */
    margin-left: var(--spacing-sm);     /* 左侧间距 */
    color: var(--color-text-tertiary);  /* 浅灰色 */
    letter-spacing: 0.02em;             /* 字间距 */
    text-transform: uppercase;          /* 全大写 */
    display: inline-block;
    font-family: var(--font-sans);      /* 无衬线字体 */
}
```

**使用示例**:

```html
<!-- 1. 页面主标题 -->
<h1>SWOT 分析 <span class="en-sub">(SWOT Analysis)</span></h1>

<!-- 2. 区块/卡片标题 -->
<h3>
    优势 <span class="en-sub">(Strengths)</span>
</h3>

<!-- 3. Meta标签 -->
<label>优先级 <span class="en-sub">(Priority)</span></label>

<!-- 4. 括号包含 (Recommended) -->
<!-- 英文部分建议用括号包裹，增加视觉分隔 -->
```

**注意事项**:
- ✅ 英文部分始终使用 `text-transform: uppercase`
- ✅ 英文部分颜色应比中文浅一级 (`--color-text-tertiary`)
- ✅ 英文部分字号应显著小于中文 (约 65%)
- ❌ 避免手动输入全大写英文，应依赖CSS转换

### 字体组合建议

#### 标题 + 正文

```css
h1, h2, h3 {
    font-family: var(--font-serif);        /* 衬线字体 */
    font-weight: var(--font-weight-bold);  /* 粗体 */
    line-height: var(--line-height-tight); /* 紧凑行高 */
}

p, li, label {
    font-family: var(--font-sans);          /* 无衬线字体 */
    font-weight: var(--font-weight-regular); /* 常规字重 */
    line-height: var(--line-height-relaxed); /* 放松行高 */
}
```

#### 数字显示 (Dashboard/KPI)

```css
.metric-value {
    font-family: var(--font-serif);        /* 衬线字体(数字更优雅) */
    font-size: var(--font-size-3xl);       /* 大号字 */
    font-weight: var(--font-weight-bold);  /* 粗体 */
    line-height: var(--line-height-tight); /* 紧凑 */
    letter-spacing: var(--letter-spacing-tight); /* 紧密 */
}
```

---

## 📐 间距系统

### 间距比例 (基于 8pt 网格)

```css
--space-0: 0;
--space-px: 1px;
--space-0-5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
```

### 语义化间距别名

```css
--spacing-xs: var(--space-1);   /* 4px  - 极小间距 */
--spacing-sm: var(--space-2);   /* 8px  - 小间距 */
--spacing-md: var(--space-4);   /* 16px - 中等间距 */
--spacing-lg: var(--space-6);   /* 24px - 大间距 */
--spacing-xl: var(--space-8);   /* 32px - 超大间距 */
--spacing-2xl: var(--space-12); /* 48px - 特大间距 */
```

### 间距使用指南

#### 组件内间距 (Component Spacing)

```css
/* 按钮内边距 */
.btn {
    padding: var(--spacing-sm) var(--spacing-md); /* 8px 16px */
}

.btn-sm {
    padding: var(--spacing-xs) var(--spacing-sm); /* 4px 8px */
}

.btn-lg {
    padding: var(--spacing-md) var(--spacing-lg); /* 16px 24px */
}

/* 卡片内边距 */
.card {
    padding: var(--spacing-lg); /* 24px */
}

/* 输入框内边距 */
.input {
    padding: var(--spacing-sm) var(--spacing-md); /* 8px 16px */
}
```

#### 布局间距 (Layout Spacing)

```css
/* 区块之间的垂直间距 */
.section {
    margin-bottom: var(--spacing-xl); /* 32px */
}

/* 卡片网格间距 */
.card-grid {
    gap: var(--spacing-lg); /* 24px */
}

/* 表单字段间距 */
.form-group {
    margin-bottom: var(--spacing-md); /* 16px */
}

/* 画布内边距 */
.paper-a3 {
    padding: var(--spacing-2xl); /* 48px */
}
```

#### 文字间距

```css
/* 标题与正文间距 */
h2 {
    margin-bottom: var(--spacing-md); /* 16px */
}

/* 段落间距 */
p {
    margin-bottom: var(--spacing-md); /* 16px */
}

/* 列表项间距 */
li {
    margin-bottom: var(--spacing-xs); /* 4px */
}
```

### 间距最佳实践

#### ✅ 使用8pt倍数

```css
/* 正确 - 8pt网格的倍数 */
.element {
    margin: var(--spacing-md);  /* 16px = 8 × 2 */
    padding: var(--spacing-lg); /* 24px = 8 × 3 */
    gap: var(--spacing-xl);     /* 32px = 8 × 4 */
}
```

#### ❌ 避免任意值

```css
/* 错误 - 任意像素值 */
.element {
    margin: 18px;  /* ❌ 不是8的倍数 */
    padding: 26px; /* ❌ 不是8的倍数 */
    gap: 14px;     /* ❌ 不是8的倍数 */
}
```

#### 间距层次

```
页面层级              推荐间距
─────────────────────────────────
同一组元素内部       4-8px   (xs-sm)
同组不同元素间       16px    (md)
不同区块间           24-32px (lg-xl)
页面级分隔           48-64px (2xl-16)
```

### 百分比内边距 (Percentage Padding)

**适用场景**: 需要根据容器大小自适应的内边距(如矩阵象限、响应式卡片)

**使用示例**:

```css
.quadrant {
    padding: 8%;  /* 相对于容器宽度 */
}

.responsive-card {
    padding: 5% 8%;  /* 垂直5%, 水平8% */
}
```

**优势**:
- ✅ 自动适应容器大小变化
- ✅ 在不同屏幕尺寸下保持比例一致
- ✅ 减少响应式断点的需求

**使用原则**:
- ✅ 用于大型容器(如象限、画布区域)
- ✅ 百分比范围: 5%-10% (过大会浪费空间)
- ❌ 不用于小型组件(如按钮、输入框) - 使用固定值
- ❌ 不用于文本内容区域 - 使用固定值确保可读性

**何时使用固定值 vs 百分比**:

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 按钮、输入框 | 固定值 (`var(--spacing-md)`) | 保持一致的点击区域 |
| 卡片内容区 | 固定值 (`var(--spacing-lg)`) | 确保文本可读性 |
| 矩阵象限 | 百分比 (`8%`) | 自适应容器大小 |
| 响应式画布 | 百分比 (`5% 8%`) | 保持比例一致 |

---

## 🧩 组件库

### 按钮 (Buttons)

#### 基础按钮

```html
<button class="btn">默认按钮</button>
```

#### 按钮变体

```html
<!-- 主要操作按钮 (每个页面/区域最多1个) -->
<button class="btn btn-primary">保存</button>

<!-- 次要操作按钮 -->
<button class="btn btn-secondary">取消</button>

<!-- 轻量操作按钮 (无明显边框) -->
<button class="btn btn-ghost">重置</button>

<!-- 危险操作按钮 -->
<button class="btn btn-danger">删除</button>
```

#### 按钮尺寸

```html
<button class="btn btn-sm">小号按钮</button>
<button class="btn">标准按钮</button>
<button class="btn btn-lg">大号按钮</button>
```

#### 带图标的按钮

```html
<button class="btn btn-primary">
    <i data-lucide="save"></i>
    保存
</button>

<button class="btn btn-secondary">
    导出
    <i data-lucide="download"></i>
</button>
```

#### 按钮状态

```html
<!-- 禁用状态 -->
<button class="btn btn-primary" disabled>保存中...</button>

<!-- 加载状态 -->
<button class="btn btn-primary">
    <span class="spinner spinner-sm"></span>
    加载中...
</button>
```

#### 按钮CSS

```css
/* 基础样式已在 components.css 中定义 */
/* 工具特定的按钮样式示例: */

.btn-export {
    background: var(--color-brand-blue);
    color: white;
}

.btn-export:hover {
    background: var(--color-brand-blue-dark);
}
```

---

### 输入框 (Inputs)

#### 标准输入框

```html
<div class="form-group">
    <label for="project-name">项目名称</label>
    <input
        type="text"
        id="project-name"
        class="input"
        placeholder="请输入项目名称"
        data-save-key="project_name"
    >
</div>
```

#### 下划线输入框 (Meta字段专用)

```html
<input
    type="text"
    class="input-underline meta-input"
    placeholder="项目名称"
    data-save-key="meta_project"
>
```

#### 文本域

```html
<div class="form-group">
    <label for="description">项目描述</label>
    <textarea
        id="description"
        class="input"
        rows="5"
        placeholder="请输入项目描述..."
        data-save-key="description"
    ></textarea>
</div>
```

#### 选择框

```html
<div class="form-group">
    <label for="priority">优先级</label>
    <select id="priority" class="input" data-save-key="priority">
        <option value="">请选择...</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
    </select>
</div>
```

#### 可编辑内容区域 (Contenteditable)

```html
<div class="section-content" contenteditable="true" data-save-key="notes">
    <p>点击此处开始编辑...</p>
    <ul>
        <li>列表项 1</li>
        <li>列表项 2</li>
    </ul>
</div>
```

---

### 卡片 (Cards)

#### 基础卡片

```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-content">
        <p>卡片内容...</p>
    </div>
</div>
```

#### 带图标的卡片

```html
<div class="card">
    <div class="card-header">
        <i data-lucide="info"></i>
        <h3 class="card-title">提示信息</h3>
    </div>
    <div class="card-content">
        <p>这是一条重要提示...</p>
    </div>
</div>
```

**卡片头部图标样式规范**:

```css
.card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.card-header .icon {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
}

.card-header h2,
.card-header h3 {
    margin: 0;
    line-height: 1.2;
}
```

**规范**:
- 图标固定尺寸: 20px × 20px
- 图标颜色: `--color-text-secondary` (符合单色原则)
- 使用 `flex-shrink: 0` 防止图标被压缩
- 图标与标题间距: 0.5rem (8px)

#### 可编辑卡片 (SWOT等工具常用)

```html
<div class="card">
    <div class="card-header">
        <i data-lucide="trending-up"></i>
        <h3>优势 <span class="en-sub">(Strengths)</span></h3>
    </div>
    <div class="card-content" contenteditable="true" data-save-key="strengths">
        <ul>
            <li>我们做得好的地方是什么?</li>
        </ul>
    </div>
</div>
```

---

### 徽章 (Badges)

```html
<span class="badge">NEW</span>
<span class="badge badge-success">已完成</span>
<span class="badge badge-warning">待审核</span>
<span class="badge badge-error">已拒绝</span>
<span class="badge badge-info">进行中</span>
```

---

### 图标 (Icons)

使用 **Lucide Icons** (https://lucide.dev/icons/)

```html
<!-- 基础图标 -->
<i data-lucide="search"></i>
<i data-lucide="settings"></i>
<i data-lucide="user"></i>

<!-- 不同尺寸 -->
<i data-lucide="check" class="icon-sm"></i>  <!-- 16px -->\n<i data-lucide="check" class="icon-md"></i>  <!-- 20px (默认) -->\n<i data-lucide="check" class="icon-lg"></i>  <!-- 24px -->\n<i data-lucide="check" class="icon-xl"></i>  <!-- 32px -->\n\n<!-- 自定义颜色 -->
<i data-lucide="alert-circle" style="color: var(--color-error);"></i>
```

**图标尺寸规范**:

| 尺寸类 | 像素值 | 使用场景 |
|--------|--------|---------|
| `icon-sm` | 16px | 紧凑布局、商业模式画布卡片标题 |
| `icon-md` | 20px | 标准尺寸、SWOT卡片标题、按钮图标 |
| `icon-lg` | 24px | 大号按钮、页面标题图标 |
| `icon-xl` | 32px | 特大图标、空状态插图 |

**CSS实现**:

```css
.icon-sm {
    width: 16px;
    height: 16px;
}

.icon-md {
    width: 20px;
    height: 20px;
}

.icon-lg {
    width: 24px;
    height: 24px;
}

.icon-xl {
    width: 32px;
    height: 32px;
}
```

**使用建议**:
- ✅ 卡片头部图标根据内容密度选择尺寸
- ✅ 紧凑布局(如商业模式画布)使用16px
- ✅ 标准布局(如SWOT分析)使用20px
- ✅ 保持同一工具内图标尺寸一致

**初始化图标** (必需):

```javascript
lucide.createIcons({
    attrs: {
        class: "icon",
        'stroke-width': 2
    }
});
```

**常用图标**:
- 搜索: `search`
- 用户: `user`, `users`
- 设置: `settings`
- 保存: `save`
- 下载: `download`
- 上传: `upload`
- 编辑: `edit`, `edit-2`, `edit-3`
- 删除: `trash`, `trash-2`, `x`
- 成功: `check`, `check-circle`
- 警告: `alert-triangle`, `alert-circle`
- 信息: `info`
- 增长: `trending-up`, `arrow-up`
- 下降: `trending-down`, `arrow-down`
- 目标: `target`
- 图表: `bar-chart`, `bar-chart-2`, `line-chart`, `pie-chart`

---

### 加载指示器 (Loading Spinners)

```html
<!-- 标准加载器 -->
<div class="spinner"></div>

<!-- 小号加载器 -->
<div class="spinner spinner-sm"></div>

<!-- 按钮中的加载器 -->
<button class="btn btn-primary">
    <span class="spinner spinner-sm"></span>
    加载中...
</button>

<!-- 保存指示器 (自动显示/隐藏) -->
<div class="save-indicator">
    <i data-lucide="loader" class="spin"></i>
</div>
```

---

### 分隔线 (Dividers)

```html
<!-- 实线 -->
<hr class="divider">

<!-- 虚线 -->
<hr class="divider divider-dashed">

<!-- 双线 -->
<hr class="divider divider-double">
```

**卡片头部虚线分隔符**:

用于卡片头部与内容的视觉分隔:

```css
.card-header {
    border-bottom: 1px dashed var(--border-sem-dashed);
    padding-bottom: 0.5rem;
    margin-bottom: 0.75rem;
}
```

**使用场景**:
- 实线 (`divider`) - 强分隔,用于主要区块间
- 虚线 (`divider-dashed`) - 弱分隔,用于卡片头部、次要区域
- 双线 (`divider-double`) - 强调分隔,用于章节结束

---

### 工具提示 (Tooltips)

```html
<button class="btn" data-tooltip="点击保存内容">
    <i data-lucide="save"></i>
</button>
```

**注意**: Tooltip功能已在 `components.css` 中通过伪元素实现,悬停时自动显示。

---

### 中心圆形元素 (Center Circle)

**适用场景**: 矩阵型工具的中心焦点元素(如SWOT分析、波士顿矩阵等)

```html
<div class="center-circle">
    <div class="circle-content" contenteditable="true" data-save-key="conclusion">
        核心结论<br><span class="en-sub">Key Takeaway</span>
    </div>
</div>
```

**CSS实现**:

```css
.center-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140px;
    height: 140px;
    background: var(--color-bg-paper);
    border: 1px solid var(--border-sem-outer);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    z-index: 2;
}

.circle-content {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-brand-primary);
    outline: none;
    padding: 1rem;
    line-height: 1.3;
}

.circle-content:focus {
    background-color: var(--color-focus-bg);
}
```

**响应式处理**:

```css
@media (max-width: 1024px) {
    .center-circle {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        margin: 1rem auto;
        width: 120px;
        height: 120px;
    }
}
```

**打印优化**:

```css
@media print {
    .center-circle {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
        border-width: 1pt;
    }
}
```

---

## 🏠 启动器页面标准 (Launcher Page Standards)

### 页面类型

**启动器页面** (Launcher Page): 工作台的主页,展示该工作台下的所有工具。

**示例**:
- `/index.html` - 总主页 (展示所有工作台)
- `/strategy-toolkit/index.html` - 战略工作台主页
- `/seo-toolkit/index.html` - SEO工作台主页

### 标准页面结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{工作台名称}} - Modiqi Workbench</title>

    <!-- Modiqi Design System -->
    <link rel="stylesheet" href="../shared/css/tokens.css">
    <link rel="stylesheet" href="../shared/css/base.css">
    <link rel="stylesheet" href="../shared/css/launcher.css">

    <!-- Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="main-container">
        <!-- Header -->
        <header class="launcher-header">
            <div class="hero-left">
                <div class="title-row">
                    <h1 class="brand-title">{{工作台名称}}</h1>
                    <span class="version-tag">{{工具数量}} TOOLS</span>
                    <button class="widescreen-toggle" id="widescreenToggle">
                        <i data-lucide="monitor"></i>
                    </button>
                </div>
                <p class="brand-subtitle">{{英文副标题}}</p>
            </div>
            <div class="hero-right">
                <a href="../index.html" class="logo-link" title="返回主页">
                    <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi" class="hero-logo">
                </a>
            </div>
        </header>

        <!-- Tool Grid -->
        <div class="launcher-grid">
            <!-- 工具卡片 -->
        </div>

        <!-- Footer -->
        <footer class="site-footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span class="copyright">Modiqi Workbench &copy; 2025</span>
                    <span class="version-info">v1.0</span>
                </div>
                <div class="footer-right">
                    <a href="#" class="footer-link">Documentation</a>
                    <span class="footer-divider">·</span>
                    <a href="#" class="footer-link">Support</a>
                    <span class="footer-divider">·</span>
                    <a href="#" class="footer-link">License</a>
                </div>
            </div>
        </footer>
    </div>

    <!-- Scripts -->
    <script>
        lucide.createIcons();

        // Widescreen Toggle
        (function () {
            const toggle = document.getElementById('widescreenToggle');
            const STORAGE_KEY = 'modiqi_widescreen';

            const isWidescreen = localStorage.getItem(STORAGE_KEY) === 'true';
            if (isWidescreen) {
                document.body.classList.add('widescreen-mode');
                updateIcon(true);
            }

            toggle.addEventListener('click', function () {
                const nowWidescreen = document.body.classList.toggle('widescreen-mode');
                localStorage.setItem(STORAGE_KEY, nowWidescreen.toString());
                updateIcon(nowWidescreen);
            });

            function updateIcon(isWide) {
                if (isWide) {
                    toggle.innerHTML = '<i data-lucide="smartphone"></i>';
                    toggle.title = '切换标准宽度 (Switch to Standard Width)';
                } else {
                    toggle.innerHTML = '<i data-lucide="monitor"></i>';
                    toggle.title = '切换宽屏模式 (Toggle Widescreen)';
                }
                lucide.createIcons();
            }
        })();
    </script>
</body>
</html>
```

### Header 标准

#### 左侧: 标题组

```html
<div class="hero-left">
    <div class="title-row">
        <h1 class="brand-title">{{工作台名称}}</h1>
        <span class="version-tag">{{工具数量}} TOOLS</span>
        <button class="widescreen-toggle" id="widescreenToggle">
            <i data-lucide="monitor"></i>
        </button>
    </div>
    <p class="brand-subtitle">{{英文副标题}}</p>
</div>
```

**规范**:
- `brand-title`: 中文工作台名称
- `version-tag`: 显示工具数量 (如 "5 TOOLS")
- `widescreen-toggle`: 宽窄切换按钮,位于版本标签后
- `brand-subtitle`: **必须使用英文**,不使用中文

#### 右侧: Logo导航

```html
<div class="hero-right">
    <a href="../index.html" class="logo-link" title="返回主页">
        <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi" class="hero-logo">
    </a>
</div>
```

**规范**:
- Logo **必须包裹在 `<a>` 标签中**,用于返回上级页面
- 主页 (`/index.html`): Logo不包裹链接
- 工作台主页 (`/xxx-toolkit/index.html`): Logo链接到 `../index.html`
- 工具页面 (`/xxx-toolkit/tool.html`): Logo链接到 `./index.html`

### Footer 标准

**标准3链接模式**:

```html
<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-left">
            <span class="copyright">Modiqi Workbench &copy; 2025</span>
            <span class="version-info">v1.0</span>
        </div>
        <div class="footer-right">
            <a href="#" class="footer-link">Documentation</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link">Support</a>
            <span class="footer-divider">·</span>
            <a href="#" class="footer-link">License</a>
        </div>
    </div>
</footer>
```

**规范**:
- 左侧: 版权信息 + 版本号
- 右侧: **固定3个链接** (Documentation · Support · License)
- 版权文字: **统一使用 "Modiqi Workbench"**,不使用工作台特定名称
- **禁止添加"返回主页"链接** - 使用Logo导航代替

**❌ 错误示例**:

```html
<!-- 错误1: 版权文字不统一 -->
<span class="copyright">SEO Workbench &copy; 2025</span>

<!-- 错误2: 添加了返回链接 -->
<a href="../index.html" class="footer-link">返回主页</a>

<!-- 错误3: 链接数量不对 -->
<a href="#" class="footer-link">Documentation</a>
<span class="footer-divider">·</span>
<a href="#" class="footer-link">Support</a>
<!-- 缺少 License 链接 -->
```

### 宽窄切换功能

**标准实现**:

```javascript
(function () {
    const toggle = document.getElementById('widescreenToggle');
    const STORAGE_KEY = 'modiqi_widescreen';

    // 加载保存的偏好
    const isWidescreen = localStorage.getItem(STORAGE_KEY) === 'true';
    if (isWidescreen) {
        document.body.classList.add('widescreen-mode');
        updateIcon(true);
    }

    // 切换事件
    toggle.addEventListener('click', function () {
        const nowWidescreen = document.body.classList.toggle('widescreen-mode');
        localStorage.setItem(STORAGE_KEY, nowWidescreen.toString());
        updateIcon(nowWidescreen);
    });

    // 更新图标
    function updateIcon(isWide) {
        if (isWide) {
            toggle.innerHTML = '<i data-lucide="smartphone"></i>';
            toggle.title = '切换标准宽度 (Switch to Standard Width)';
        } else {
            toggle.innerHTML = '<i data-lucide="monitor"></i>';
            toggle.title = '切换宽屏模式 (Toggle Widescreen)';
        }
        lucide.createIcons();
    }
})();
```

**规范**:
- 存储键: **必须使用 `modiqi_widescreen`**
- 切换类: **必须在 `document.body` 上添加 `widescreen-mode`**
- 图标切换: monitor (标准) ↔ smartphone (宽屏)
- 使用IIFE包裹,避免全局污染

**❌ 常见错误**:

```javascript
// 错误1: 存储键不统一
localStorage.getItem('widescreenMode')  // ❌
localStorage.getItem('modiqi_widescreen')  // ✅

// 错误2: 切换错误的元素
mainContainer.classList.toggle('widescreen')  // ❌
document.body.classList.toggle('widescreen-mode')  // ✅

// 错误3: 没有更新图标
// 用户无法知道当前状态
```

---

## 📄 画布布局

### 画布类型选择

| 画布类型 | 尺寸 (max-width × aspect) | 适用场景 |
|---------|--------------------------|---------|
| **A3横向** | 1400px × ~990px | 复杂矩阵型工具 (SWOT、BMC、社交媒体矩阵) |
| **A4纵向** | 794px × 1123px | 简单表单、清单、线性流程 |
| **A4横向** | 1123px × 794px | 仪表盘、数据对比、时间线 |

#### ⚠️ 重要选择规则

**默认使用 A3 横向**：所有横向布局的工具一律使用 `paper-a3`，除非内容非常简单。

```
决策流程:
┌──────────────────────────────────────┐
│ 工具方向是横向 (Landscape)？          │
└──────────────┬───────────────────────┘
               ↓
      ┌────────┴────────┐
      │                 │
      ↓ 是               ↓ 否
 使用 .paper-a3      使用 .paper-a4
                      (纵向/Portrait)
```

**为什么横向一律用 A3？**

1. **空间充裕**: A3 (1400×990px) 比 A4 横向 (1123×794px) 多出约 50% 的可用面积
2. **避免溢出**: 横向工具通常包含多列布局 + 底部区块，A4 横向容易导致内容挤压页脚
3. **打印友好**: A3 页面打印时内容不会被压缩或截断
4. **一致性**: 统一使用 A3 横向简化维护

**仅在以下情况使用 A4：**
- ✅ **纵向布局** (Portrait): 清单、表单、简历
- ✅ **内容极简**: 单列、少于 5 个输入区域
- ❌ **不要用于**: 多列网格、复杂矩阵、底部有附加区域的工具

---

### 标准页脚 (Modiqi Footer)

**所有画布工具必须包含标准页脚**，位于 `<main>` 容器底部：

```html
<main class="paper-a3">
    <header class="canvas-header">...</header>
    <div class="tool-content">...</div>
    
    <!-- ✅ 必须包含标准页脚 -->
    <footer class="modiqi-footer">
        <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi" class="footer-logo">
        <span>© 2025 Modiqi Digital Consulting</span>
    </footer>
</main>
```

**页脚规范**:

| 属性 | 值 | 说明 |
|-----|-----|-----|
| **类名** | `.modiqi-footer` | 标准页脚类 |
| **Logo 高度** | 32px (A3) / 28px (A4) | 使用 `.footer-logo` 类 |
| **边框** | `1px dashed var(--border-sem-dashed)` | 上边框虚线 |
| **间距** | `margin-top: 1.5rem` | 与内容区距离 |
| **对齐** | `justify-content: space-between` | Logo 左、文字右 |

**页脚样式 (已在 canvas.css 中定义)**:

```css
.modiqi-footer {
    margin-top: 1.5rem;
    padding-top: var(--spacing-lg);
    border-top: 1px dashed var(--border-sem-dashed);
    font-family: var(--font-serif);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    opacity: 0.6;
}

.footer-logo {
    height: 32px;
    width: auto;
    opacity: 0.5;
    mix-blend-mode: multiply;
}
```

**注意事项**:
- ❌ 不要自定义页脚样式，使用标准类即可
- ✅ 页脚会在打印时隐藏 (由 canvas.css 处理)
- ✅ 点击 Logo 可切换工具栏显隐 (由 core.js 处理)

---

### 垂直空间管理 (防止内容溢出)

**问题**: 当工具包含多行区块（如主内容 + 底部区块）时，内容可能溢出并挤压页脚。

**解决方案**: 在工具特定 CSS 中使用 **CSS Grid 覆盖** paper-a3 的默认 flex 布局。

#### 标准垂直布局模板

```css
/* 覆盖 paper-a3 的 flex 布局，使用精确的 Grid 行分配 */
.paper-a3 {
    display: grid;
    grid-template-rows: auto 1fr auto auto;  /* ← 关键：4 行布局 */
    grid-template-areas:
        "header"
        "main"
        "bottom"
        "footer";
}

/* 将子元素分配到对应的 Grid 区域 */
.paper-a3 > .canvas-header {
    grid-area: header;           /* 固定高度 */
}

.paper-a3 > .main-content {
    grid-area: main;             /* flex: 1 等价，填充剩余空间 */
    min-height: 0;               /* 允许收缩，防止溢出 */
    overflow: hidden;            /* 超出部分隐藏 */
}

.paper-a3 > .bottom-section {
    grid-area: bottom;           /* 固定高度 */
    flex-shrink: 0;              /* 防止被压缩 */
}

.paper-a3 > .modiqi-footer {
    grid-area: footer;           /* 固定高度 */
}
```

#### Grid 行分配说明

```
grid-template-rows: auto  1fr   auto    auto;
                    ↓     ↓     ↓       ↓
                 header  main  bottom  footer
                    │     │      │       │
                    └─────┼──────┼───────┘
                     固定高度    填充剩余
```

| 行 | 值 | 行为 |
|---|---|---|
| `header` | `auto` | 根据内容自动计算高度 |
| `main` | `1fr` | 填充所有剩余可用空间 |
| `bottom` | `auto` | 根据内容自动计算高度 |
| `footer` | `auto` | 根据内容自动计算高度 |

#### 关键 CSS 属性

| 属性 | 作用 |
|-----|-----|
| `min-height: 0` | 允许 Grid 项收缩，防止内容溢出容器 |
| `overflow: hidden` | 超出内容区域部分隐藏，而非溢出 |
| `flex-shrink: 0` | 防止底部区块被压缩 |

#### 完整示例 (CDP Canvas)

```html
<main class="paper-a3">
    <header class="canvas-header">...</header>
    
    <!-- 主内容区：使用 grid-area: main -->
    <div class="cdp-layout">
        <section class="data-sources">...</section>
        <section class="cdp-core">...</section>
        <section class="activation">...</section>
    </div>
    
    <!-- 底部区块：使用 grid-area: bottom -->
    <div class="bottom-section">
        <section class="governance">...</section>
        <section class="metrics">...</section>
    </div>
    
    <!-- 页脚：使用 grid-area: footer -->
    <footer class="modiqi-footer">...</footer>
</main>
```

```css
/* cdp-canvas.css */
.paper-a3 {
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    grid-template-areas:
        "header"
        "main"
        "bottom"
        "footer";
}

.cdp-layout {
    grid-area: main;
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: var(--spacing-lg);
    min-height: 0;        /* 防止溢出 */
    overflow: hidden;
}

.bottom-section {
    grid-area: bottom;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
}
```

#### 调试技巧

如内容仍溢出，按以下顺序检查：

1. **检查 Grid 行定义**: 确保 `grid-template-rows` 包含所有子元素
2. **检查 `min-height`**: 主内容区需要 `min-height: 0`
3. **检查 `overflow`**: 主内容区需要 `overflow: hidden`
4. **检查子元素高度**: 内部组件不应有固定高度导致溢出

```css
/* 调试模式：临时添加边框查看布局 */
.paper-a3 > * {
    outline: 2px solid red;
}
```

---

### Sticky Footer 底部锚定

**问题**: 当页面内容较少时，Footer 会紧跟内容显示，而不是固定在画布底部。

**原因**: `paper-a3` 和 `paper-a4` 使用 `display: flex; flex-direction: column`，但子元素没有正确设置 flex 属性来填充剩余空间。

#### 解决方案一：给最后一个内容区块设置 `flex: 1`

**适用场景**: 最后一个内容区块可以伸展填充空间

```css
/* 在工具特定 CSS 中 */
.action-section,      /* 或任何位于 footer 之前的最后一个区块 */
.main-content,
.tool-content {
    flex: 1;           /* 填充剩余空间 */
    min-height: 0;     /* 允许收缩，防止溢出 */
}
```

**HTML 结构**:

```html
<main class="paper-a3">
    <header class="canvas-header">...</header>
    <div class="section-1">...</div>
    <div class="section-2">...</div>
    <div class="action-section">  <!-- 最后一个区块：设置 flex: 1 -->
        ...
    </div>
    <footer class="modiqi-footer">...</footer>  <!-- 自动推到底部 -->
</main>
```

#### 解决方案二：给 Footer 设置 `margin-top: auto`

**适用场景**: 不希望任何内容区块伸展

```css
/* canvas.css 中已定义，无需额外设置 */
.modiqi-footer {
    margin-top: auto;  /* 自动推到容器底部 */
}
```

> ⚠️ **注意**: `margin-top: auto` 在 Flexbox 中会将元素推到容器底部。如果 `canvas.css` 中已包含此属性，通常无需额外修改。

#### 选择指南

| 场景 | 推荐方案 | 说明 |
|------|----------|------|
| 内容较少，需要最后一区块填充空间 | `flex: 1` | 如表格、卡片网格 |
| 内容较多，不确定是否溢出 | `flex: 1 + min-height: 0` | 防止溢出 |
| 内容固定，各区块高度不变 | `margin-top: auto` | 最简单 |
| 使用 Grid 布局 | `grid-template-rows: auto 1fr auto` | 见上方 Grid 章节 |

#### 完整示例

```css
/* north-star-metric.css */

/* Action Section 是 footer 前的最后一个区块 */
.action-section {
    margin-bottom: var(--spacing-md);
    flex: 1;           /* ← 关键：填充剩余空间 */
    min-height: 0;     /* ← 防止溢出 */
}
```

#### ❌ 常见错误

```css
/* 错误1：只设置 flex: 1 不设置 min-height: 0 */
.action-section {
    flex: 1;  /* 内容多时可能溢出 */
}

/* 错误2：给中间区块设置 flex: 1 */
.metrics-section {  /* 不是最后一个区块 */
    flex: 1;        /* 错误位置 */
}

/* 错误3：使用固定高度 */
.modiqi-footer {
    position: absolute;  /* ❌ 避免使用绝对定位 */
    bottom: 0;
}
```

---

### 内容溢出处理策略 (Content Overflow Strategy)

**核心矛盾**: 画布尺寸固定（模拟真实纸张），但工具内容量可能超出画布容量。

**根本原因**: 这是**内容设计问题**，而非布局问题。工具设计者必须在设计阶段评估内容量与画布容量的匹配关系。

#### 处理优先级（从高到低）

| 优先级 | 策略 | 说明 | 适用场景 | 节省空间 |
|--------|------|------|----------|----------|
| **1. 首选** | 减少内容量 | 删除冗余示例数据、精简条目 | 示例数据过多 | 20-50% |
| **2. 次选** | 压缩视觉间距 | 减小 section margin/padding | 间距有余裕 | 10-20% |
| **2.5 推荐** | 布局模式切换 | 将垂直布局转为水平紧凑布局 | 模块结构可优化 | 30-60% |
| **3. 备选** | 选择更大画布 | 从 A4 改为 A3 | 内容确实需要 | 50%+ |
| **❌ 禁止** | 截断/滚动 | overflow: hidden 截断内容 | 永不可接受 | - |

> **优先级 2.5 说明**: 布局模式切换是一种**结构性优化**，通过改变信息展示方式而非简单压缩间距来节省空间。这种方法通常比单纯减少间距更有效，且不会牺牲信息密度或可读性。

#### 决策流程图

```
内容超出画布边界?
      │
      ↓ 是
检查：示例数据是否过多?
      │
      ├─ 是 → 🔥 首选：减少示例数据条目
      │
      ↓ 否
检查：间距是否可压缩?
      │
      ├─ 是 → 压缩 section margin/padding (lg→md, md→sm)
      │
      ↓ 否/仍不足
检查：模块布局是否可优化?
      │
      ├─ 是 → ⭐ 推荐：布局模式切换 (见下方详细指南)
      │       - 垂直网格 → 水平紧凑列表
      │       - 卡片网格 → 内联紧凑行
      │       - 多行堆叠 → 单行并排
      │
      ↓ 否
检查：画布类型是否可升级?
      │
      ├─ 是 → 从 A4 改为 A3
      │
      ↓ 否
❌ 重新评估工具设计，考虑拆分为多页
```

#### 实际案例：Attribution Analysis 工具

**问题**: 5 个归因模型 + 5 行表格 + 3 条路径示例 = 溢出 32px

**解决过程**:

1. **首先尝试压缩间距**:
   ```css
   /* 压缩 section 间距 */
   .models-section { margin-bottom: var(--spacing-md); }  /* lg → md */
   .comparison-section { margin-bottom: var(--spacing-md); }  /* lg → md */
   
   /* 压缩表格间距 */
   .attribution-table th { padding: var(--spacing-sm) var(--spacing-xs); }  /* md → sm */
   .attribution-table td { padding: var(--spacing-sm) var(--spacing-xs); }  /* md → sm */
   ```

2. **仍不足，减少示例数据**:
   ```html
   <!-- 从 3 条路径减少到 2 条 -->
   <div class="path-examples">
       <div class="path-item">搜索广告 → 社交媒体 → 邮件 → 转化</div>
       <div class="path-item">社交媒体 → 搜索广告 → 转化</div>
       <!-- ❌ 删除: 邮件 → 转化（最短，代表性最弱） -->
   </div>
   ```

3. **结果**: 内容完美适配画布，footer 正确定位

---

#### ⭐ 布局模式切换详细指南 (Layout Mode Switching)

**核心思想**: 通过改变信息的**展示结构**而非简单压缩间距来节省空间。这通常比压缩间距更有效，且能保持甚至提升信息密度和可读性。

##### 常见布局转换模式

| 原始布局 | 紧凑布局 | 空间节省 | 适用场景 |
|---------|---------|---------|---------|
| **垂直卡片网格** | 水平紧凑行 | 50-70% | 类型分析、分类统计 |
| **多行堆叠卡片** | 单行并排标签 | 40-60% | KPI展示、状态指示 |
| **独立信息卡片** | 紧凑表格行 | 30-50% | 数据对比、特性列表 |
| **全宽区块** | 两栏并排 | 20-40% | 分析摘要、注释区域 |

##### 转换示例：垂直卡片网格 → 水平紧凑行

**原始布局** (占用 ~120px 高度):

```html
<!-- 5 列垂直卡片网格，每个卡片垂直堆叠 -->
<div class="type-grid">
    <div class="type-card">
        <span class="badge blog">博客</span>
        <div class="type-stats">
            <span class="stat-label">平均浏览</span>
            <span class="stat-value">8,450</span>
        </div>
        <div class="type-stats">
            <span class="stat-label">互动率</span>
            <span class="stat-value">7.2%</span>
        </div>
    </div>
    <!-- ...更多卡片 -->
</div>
```

```css
/* 原始 CSS：垂直堆叠 */
.type-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-sm);
}

.type-card {
    display: flex;
    flex-direction: column;  /* 垂直堆叠 */
    align-items: center;
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
}
```

**紧凑布局** (占用 ~45px 高度，节省约 60%):

```html
<!-- 水平紧凑行，信息内联展示 -->
<div class="type-row compact">
    <div class="type-item">
        <span class="badge blog">博客</span>
        <span class="stat-inline">
            <span class="stat-value">8,450</span>
            <span class="stat-sep">|</span>
            <span class="stat-value">7.2%</span>
        </span>
    </div>
    <!-- ...更多项目 -->
</div>
```

```css
/* 紧凑 CSS：水平内联 */
.type-row.compact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
    border-top: 1px dashed var(--border-sem-dashed);
}

.type-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.stat-inline {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
}

.stat-sep {
    color: var(--color-text-tertiary);
}

.stat-value {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
}
```

##### 紧凑布局变体规范

为常用模块提供 `.compact` 变体类：

```css
/* ========================================
   紧凑布局变体 (Compact Layout Variants)
   适用于空间受限场景
   ======================================== */

/* 类型分析紧凑模式 */
.type-analysis.compact {
    padding: var(--spacing-xs) var(--spacing-md);
}

.type-analysis.compact h3 {
    margin-bottom: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
}

.type-analysis.compact .type-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
}

.type-analysis.compact .type-card {
    flex-direction: row;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: var(--spacing-sm);
    background: transparent;
    border: none;
}

.type-analysis.compact .type-stats {
    flex-direction: row;
    gap: var(--spacing-xs);
    margin-top: 0;
}

.type-analysis.compact .stat-label {
    display: none;  /* 隐藏标签，仅显示值 */
}

.type-analysis.compact .stat-value {
    font-size: var(--font-size-sm);
}

/* KPI 卡片紧凑模式 */
.kpi-grid.compact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.kpi-card.compact {
    flex: 0 0 auto;
    padding: var(--spacing-xs) var(--spacing-sm);
}

.kpi-card.compact .kpi-icon {
    width: 28px;
    height: 28px;
}

.kpi-card.compact .kpi-value {
    font-size: var(--font-size-base);
}

/* 表格紧凑模式 */
.performance-table.compact th,
.performance-table.compact td {
    padding: 0.4rem var(--spacing-xs);
    font-size: var(--font-size-xs);
}
```

##### 决策要点

**何时使用布局模式切换**:
- ✅ 模块包含重复结构（如卡片网格、列表）
- ✅ 信息可以合并展示（如标签+值组合）
- ✅ 压缩间距后仍溢出 10%+ 
- ✅ 不影响核心信息的可读性

**何时不使用**:
- ❌ 模块已是最简结构（如单行表格）
- ❌ 用户需要详细查看每个数据点
- ❌ 改变布局会破坏信息层次

##### 实际案例：Content Performance 类型分析模块

**问题**: 5 列垂直卡片网格占用约 120px 高度，导致页面溢出 114px

**解决方案**: 使用 `.compact` 变体

```html
<!-- 添加 compact 类 -->
<div class="type-analysis compact">
    <h3><i data-lucide="pie-chart"></i> 内容类型分析</h3>
    <div class="type-grid">
        <!-- 卡片结构保持不变，CSS 自动转换为紧凑布局 -->
    </div>
</div>
```

**结果**: 模块高度从 ~120px 降至 ~50px，节省约 60% 空间

---

#### 内容量评估 (设计阶段)

在设计工具时，应预先计算各区块高度：

```
A3 画布高度: 990px
可用空间: 990px - padding (48px × 2) - header (~80px) - footer (~60px)
         = 990 - 96 - 80 - 60 ≈ 754px

各区块预估:
- Section 1: ~200px (含标题 + 内容 + margin)
- Section 2: ~350px (表格 5 行 × 50px + 标题 + padding)
- Section 3: ~300px (3 条示例 × 80px + 标题)
  总计: 850px > 754px → ❌ 超出

调整后:
- Section 3: ~220px (2 条示例 × 80px + 标题)
  总计: 770px → 仍超出 16px

进一步压缩:
- 减少 section margin: 节省 ~30px
  总计: 740px < 754px → ✅ 适配
```

#### CSS Grid 布局的空间分配

使用 Grid 精确控制各区块空间:

```css
.paper-a3 {
    display: grid;
    grid-template-rows: auto auto auto 1fr auto;
    /*                  header sect1 sect2 sect3 footer */
}

/* 关键：给 1fr 区块设置 min-height: 0 */
.path-section {
    grid-area: paths;
    min-height: 0;      /* 允许收缩 */
    overflow: hidden;   /* ⚠️ 慎用！可能截断内容 */
}
```

> ⚠️ **`overflow: hidden` 是保护措施，不是解决方案**。如果内容被截断，说明上游内容量设计有问题。

#### ❌ 常见错误

```css
/* 错误1：用滚动条"解决"溢出 */
.content-section {
    max-height: 400px;
    overflow-y: auto;   /* ❌ 破坏纸张概念，打印丢失内容 */
}

/* 错误2：用截断"隐藏"问题 */
.content-section {
    overflow: hidden;   /* ❌ 内容不可见 */
}

/* 错误3：忽视问题，让内容溢出 */
.paper-a3 {
    overflow: visible;  /* ❌ footer 被推出画布 */
}
```

#### ✅ 正确做法

```html
<!-- 设计阶段就控制内容量 -->
<div class="path-examples">
    <!-- 保留最有代表性的 2-3 条 -->
    <div class="path-item">多触点路径示例1</div>
    <div class="path-item">多触点路径示例2</div>
    <!-- 不需要展示所有可能的路径 -->
</div>
```

```css
/* 配合间距压缩 */
.section-title {
    margin: 0 0 var(--spacing-sm) 0;  /* md → sm */
}

.models-section,
.comparison-section {
    margin-bottom: var(--spacing-md);  /* lg → md */
}
```

---



### A3横向画布

```html
<main class="paper-a3">
    <header class="canvas-header">...</header>
    <div class="tool-content">
        <!-- 内容 -->
    </div>
</main>
```

**特点**:
- 宽度: 1400px (最大)
- 内边距: 48px
- 适合: 2×2、3×3网格布局

### A4纵向画布

```html
<main class="paper-a4">
    <header class="canvas-header">...</header>
    <div class="tool-content">
        <!-- 内容 -->
    </div>
</main>
```

**特点**:
- 宽度: 794px
- 高度: 1123px (1:1.414比例)
- 内边距: 48px (上下) × 60px (左右)
- 适合: 单列表单、垂直流程

### A4横向画布

```html
<main class="paper-a4 landscape">
    <header class="canvas-header">...</header>
    <div class="tool-content">
        <!-- 内容 -->
    </div>
</main>
```

**特点**:
- 宽度: 1123px
- 高度: 794px
- 适合: Dashboard、横向对比表

### 画布头部 (Canvas Header)

**标准结构**:

```html
<header class="canvas-header">
    <!-- 左侧: 标题组 -->
    <div class="title-group">
        <h1>{{TOOL_NAME_CN}}</h1>
        <span class="english-subtitle">{{TOOL_NAME_EN}}</span>
    </div>

    <!-- 右侧: Meta信息组 -->
    <div class="meta-info">
        <div class="meta-group">
            <label>项目 <span class="en-sub">(Project)</span></label>
            <input type="text" class="meta-input" placeholder="项目名称" data-save-key="meta_project">
        </div>
        <div class="meta-group">
            <label>日期 <span class="en-sub">(Date)</span></label>
            <input type="date" class="meta-input" data-save-key="meta_date">
        </div>
    </div>
</header>
```

**重要规范**:
- ❌ 标题组不使用图标 - 保持简洁
- ✅ Meta输入框使用 `placeholder` 而非 `value`
- ✅ 标题直接放在 `title-group` 内,无需额外包裹层

### 中英文标题规范 (Bilingual Title Standards)

**设计原则**: 中文为主,英文为辅,提供国际化支持和专业性。

**两种英文副标题样式**:

#### 1. 主标题英文副标题 (`.english-subtitle`)

用于页面主标题的英文翻译:

```html
<div class="title-group">
    <h1>SWOT 分析</h1>
    <span class="english-subtitle">SWOT Analysis</span>
</div>
```

**CSS样式**:

```css
.english-subtitle {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-tertiary);
    letter-spacing: var(--letter-spacing-wide);
}
```

**规范**:
- 位置: 紧跟在 `<h1>` 标题之后
- 字体: 无衬线字体 (`--font-sans`)
- 字号: 小号 (`--font-size-sm`, 12px)
- 颜色: 三级文本色 (`--color-text-tertiary`)
- 字间距: 略宽 (`--letter-spacing-wide`)

#### 2. 内联英文注释 (`.en-sub`)

用于标签、字段名、卡片标题的英文注释:

```html
<!-- Meta字段 -->
<label>项目 <span class="en-sub">(Project)</span></label>
<label>日期 <span class="en-sub">(Date)</span></label>

<!-- 卡片标题 -->
<h2>优势 <span class="en-sub">(Strengths)</span></h2>
<h3>核心结论 <span class="en-sub">(Key Takeaway)</span></h3>

<!-- 内联文本 -->
核心结论<br><span class="en-sub">Key Takeaway</span>
```

**CSS样式**:

```css
.en-sub {
    font-family: var(--font-sans);
    font-size: 0.85em;  /* 相对于父元素 */
    font-weight: var(--font-weight-regular);
    color: var(--color-text-tertiary);
    letter-spacing: var(--letter-spacing-wide);
}
```

**规范**:
- 位置: 紧跟在中文文本之后,用括号包裹
- 字号: 相对父元素 85% (`0.85em`)
- 颜色: 三级文本色 (`--color-text-tertiary`)
- 格式: 使用括号 `(English Text)` 或直接显示

**使用场景对比**:

| 场景 | 使用样式 | 示例 |
|------|---------|------|
| 页面主标题 | `.english-subtitle` | `<h1>SWOT 分析</h1><span class="english-subtitle">SWOT Analysis</span>` |
| Meta字段标签 | `.en-sub` | `<label>项目 <span class="en-sub">(Project)</span></label>` |
| 卡片标题 | `.en-sub` | `<h2>优势 <span class="en-sub">(Strengths)</span></h2>` |
| 内联文本 | `.en-sub` | `核心结论<br><span class="en-sub">Key Takeaway</span>` |

**翻译原则**:
- ✅ 使用标准的行业术语(如 SWOT, KPI, ROI)
- ✅ 保持简洁,避免冗长翻译
- ✅ 首字母大写(Title Case)
- ❌ 不使用全大写(除非是缩写词)
- ❌ 不添加额外的解释性文字

**示例**:

```html
<!-- ✅ 正确 -->
<h2>优势 <span class="en-sub">(Strengths)</span></h2>
<label>项目名称 <span class="en-sub">(Project Name)</span></label>

<!-- ❌ 错误 -->
<h2>优势 <span class="en-sub">(STRENGTHS)</span></h2>  <!-- 全大写 -->
<label>项目名称 <span class="en-sub">(project name)</span></label>  <!-- 小写 -->
<h2>优势 <span class="en-sub">(Your Strengths)</span></h2>  <!-- 添加额外词 -->
```

---

### 2×2象限网格布局 (Quadrant Grid Layout)

**适用场景**: 矩阵型分析工具(SWOT分析、波士顿矩阵、艾森豪威尔矩阵等)

**HTML结构**:

```html
<div class="quadrant-grid">
    <!-- 象限1 (左上) -->
    <div class="quadrant area-tl">
        <div class="card-header">
            <i data-lucide="trending-up"></i>
            <h2>象限标题</h2>
        </div>
        <div class="card-content" contenteditable="true" data-save-key="quadrant_1">
            内容...
        </div>
    </div>

    <!-- 象限2 (右上) -->
    <div class="quadrant area-tr">...</div>

    <!-- 象限3 (左下) -->
    <div class="quadrant area-bl">...</div>

    <!-- 象限4 (右下) -->
    <div class="quadrant area-br">...</div>

    <!-- 可选: 中心圆形元素 -->
    <div class="center-circle">
        <div class="circle-content" contenteditable="true" data-save-key="conclusion">
            核心结论
        </div>
    </div>
</div>
```

**CSS实现**:

```css
/* 2×2网格布局 */
.quadrant-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    flex: 1;
    border: 1px solid var(--border-sem-outer);
    position: relative;
    z-index: 1;
}

.quadrant {
    padding: 8%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-sem-inner);
    background: transparent;
}

/* 移除外边框重叠 */
.area-tl {
    border-top: none;
    border-left: none;
}

.area-tr {
    border-top: none;
    border-right: none;
}

.area-bl {
    border-bottom: none;
    border-left: none;
}

.area-br {
    border-bottom: none;
    border-right: none;
}

/* 焦点状态 */
.quadrant:focus-within {
    background-color: var(--color-focus-bg);
}
```

**响应式处理**:

```css
@media (max-width: 1024px) {
    .quadrant-grid {
        display: flex;
        flex-direction: column;
    }

    .quadrant {
        border: 1px solid var(--border-sem-inner);
        min-height: 200px;
        border-top: none;
    }

    .quadrant:first-child {
        border-top: 1px solid var(--border-sem-inner);
    }
}
```

**打印优化**:

```css
@media print {
    /* 强制保持网格布局 */
    .quadrant-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        grid-template-rows: 1fr 1fr !important;
        flex-direction: unset !important;
    }

    .quadrant {
        border-width: 0.5pt;
        min-height: unset !important;
        border-top: unset !important;
    }
}
```

**使用示例**: 参考 `/strategy-toolkit/swot-analysis.html`

---

### 商业模式画布网格布局 (Business Model Canvas Grid)

**适用场景**: 商业模式画布、营销策略画布等复杂多区块工具

**特点**:
- 10列精细网格,支持灵活的区块跨度
- 不等高行,适应不同内容密度
- 区块可跨越多列多行

**HTML结构**:

```html
<div class="canvas-grid">
    <!-- 区块1: 跨2列2行 -->
    <div class="card area-1">
        <div class="card-header">
            <i data-lucide="handshake"></i>
            <h2>协作与媒介 <span class="en-sub">(Partners & Media)</span></h2>
        </div>
        <div class="card-content" contenteditable="true" data-save-key="partners">
            内容...
        </div>
    </div>

    <!-- 区块2: 跨2列1行 -->
    <div class="card area-2">...</div>

    <!-- 更多区块... -->
</div>
```

**CSS实现**:

```css
/* 10列×3行网格 */
.canvas-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: 2.5fr 1.5fr 1.5fr;  /* 不等高行 */
    flex: 1;
    border: 1px solid var(--border-sem-outer);
    gap: 0;
}

/* 区块基础样式 */
.card {
    border-right: 1px solid var(--border-sem-inner);
    border-bottom: 1px solid var(--border-sem-inner);
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

/* 区块跨度定义 */
.area-1 {
    grid-column: 1 / span 2;  /* 从第1列开始,跨2列 */
    grid-row: 1 / span 2;     /* 从第1行开始,跨2行 */
}

.area-2 {
    grid-column: 3 / span 2;  /* 从第3列开始,跨2列 */
    grid-row: 1;              /* 第1行 */
}

.area-3 {
    grid-column: 5 / span 2;  /* 居中区块 */
    grid-row: 1 / span 2;
}

/* 移除边缘边框 */
.area-right-edge {
    border-right: none;
}

.area-bottom-edge {
    border-bottom: none;
}
```

**响应式处理**:

```css
@media (max-width: 1024px) {
    .canvas-grid {
        display: flex;
        flex-direction: column;
    }

    .card {
        border-right: none;
        border-bottom: 1px solid var(--border-sem-inner);
        min-height: 150px;
    }

    .card:last-child {
        border-bottom: none;
    }
}
```

**打印优化**:

```css
@media print {
    .canvas-grid {
        display: grid !important;
        grid-template-columns: repeat(10, 1fr) !important;
        grid-template-rows: 2.5fr 2.5fr 1.5fr !important;  /* 调整第2行高度 */
        flex-direction: unset !important;
    }

    .card {
        border-right: 1px solid var(--border-sem-inner) !important;
        border-bottom: 1px solid var(--border-sem-inner) !important;
        min-height: unset !important;
    }
}
```

**设计原则**:
- ✅ 使用10列网格提供最大灵活性
- ✅ 不等高行适应内容密度差异
- ✅ 打印时可调整行高以优化空间利用
- ✅ 响应式时转为单列布局

**使用示例**: 参考 `/strategy-toolkit/marketing-canvas.html`

---

## 🔄 动态内容管理

### 动态列表高度自适应

**适用场景**: 当工具允许用户动态添加/删除项目时（如预算分配器的渠道、任务列表等）

**设计原则**:
- ✅ 所有项目始终可见，无滚动条
- ✅ 根据项目数量自动调整行高
- ✅ 适配打印需求（A3/A4纸张）
- ✅ 设置合理的最大数量限制

**实现模式**:

```html
<!-- HTML结构 -->
<div class="dynamic-list-container">
    <div class="list-body" id="listBody" data-row-count="5">
        <div class="list-item">...</div>
        <div class="list-item">...</div>
        <!-- 更多项目 -->
    </div>
    <button id="addItemBtn">添加项目</button>
</div>
```

```css
/* CSS - 动态高度调整 */
.list-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.list-item {
    flex: 1;
    min-height: 0;
    padding: var(--spacing-md);
    transition: padding var(--transition-fast);
}

/* 根据项目数量调整padding */
.list-body[data-row-count="5"] .list-item {
    padding: var(--spacing-md);
}

.list-body[data-row-count="6"] .list-item,
.list-body[data-row-count="7"] .list-item {
    padding: var(--spacing-sm) var(--spacing-md);
}

.list-body[data-row-count="8"] .list-item,
.list-body[data-row-count="9"] .list-item {
    padding: var(--spacing-xs) var(--spacing-md);
}

.list-body[data-row-count="10"] .list-item {
    padding: 6px var(--spacing-md);
}
```

```javascript
// JavaScript - 更新行数属性
const MAX_ITEMS = 10;
const listBody = document.getElementById('listBody');
const addBtn = document.getElementById('addItemBtn');

function updateItemCount() {
    const count = document.querySelectorAll('.list-item').length;
    listBody.setAttribute('data-row-count', count);

    // 达到上限时隐藏添加按钮
    if (count >= MAX_ITEMS) {
        addBtn.style.display = 'none';
    } else {
        addBtn.style.display = 'flex';
    }
}

function addItem() {
    const count = document.querySelectorAll('.list-item').length;
    if (count >= MAX_ITEMS) return;

    // 创建新项目...
    updateItemCount();
}

function deleteItem(itemId) {
    // 删除项目...
    updateItemCount();
}
```

**最大数量建议**:
- A3横向画布: 10个项目
- A4纵向画布: 8个项目
- A4横向画布: 6个项目

### 删除功能设计

**删除按钮规范**:

```html
<div class="list-item">
    <div class="item-content">内容...</div>
    <button class="delete-item-btn" title="删除">
        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
    </button>
</div>
```

```css
.delete-item-btn {
    padding: 2px;
    border: none;
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all var(--transition-fast);
}

.list-item:hover .delete-item-btn {
    opacity: 1;
}

.delete-item-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
}

.delete-item-btn:active {
    transform: scale(0.9);
}

/* 打印时隐藏 */
@media print {
    .delete-item-btn {
        display: none !important;
    }
}
```

**交互规范**:
- ✅ 默认隐藏（opacity: 0）
- ✅ 鼠标悬停时显示
- ✅ Hover有背景色反馈
- ✅ Active有缩放反馈
- ✅ 打印时自动隐藏

### 添加按钮设计

```html
<button id="addItemBtn" style="padding: var(--spacing-sm) var(--spacing-md); border: 1px dashed var(--border-sem-dashed); background: transparent; color: var(--color-text-secondary); cursor: pointer; font-size: var(--font-size-sm); border-radius: var(--radius-sm); display: flex; align-items: center; gap: var(--spacing-xs);">
    <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i>
    <span>添加项目</span>
</button>
```

```css
#addItemBtn {
    transition: all var(--transition-fast);
}

#addItemBtn:hover {
    background-color: var(--color-bg-hover);
    border-color: var(--border-sem-inner);
}

#addItemBtn:active {
    transform: scale(0.98);
}

/* 打印时隐藏 */
@media print {
    #addItemBtn {
        display: none !important;
    }
}
```

**样式规范**:
- ✅ 虚线边框（dashed）
- ✅ 透明背景
- ✅ 带图标（plus-circle）
- ✅ Hover有背景色变化
- ✅ 打印时自动隐藏

---

## ⚙️ JavaScript集成

### ModiqiApp 核心库

**初始化** (必需):

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // 初始化ModiqiApp
    new ModiqiApp('your_tool_id_v1');

    // 初始化图标
    lucide.createIcons();
});
```

### 自动保存功能

**使用 `data-save-key` 属性**:

```html
<!-- 输入框自动保存 -->
<input type="text" data-save-key="project_name">

<!-- Contenteditable自动保存 -->
<div contenteditable="true" data-save-key="notes">
    可编辑内容...
</div>

<!-- Textarea自动保存 -->
<textarea data-save-key="description"></textarea>

<!-- Select自动保存 -->
<select data-save-key="priority">
    <option value="high">高</option>
</select>
```

**Storage Key格式**:

```
localStorage key = `modiqi_{toolId}_{saveKey}`

示例:
- toolId: keyword_research_v1
- saveKey: project_name
- 完整key: modiqi_keyword_research_v1_project_name
```

**手动保存数据**:

```javascript
// 获取ModiqiApp实例
const app = window.modiqiApp || new ModiqiApp('my_tool_v1');

// 手动保存
localStorage.setItem(app.storageKeyPrefix + 'my_custom_key', 'value');

// 手动加载
const value = localStorage.getItem(app.storageKeyPrefix + 'my_custom_key');
```

### 工具栏功能

ModiqiApp 自动注入工具栏,提供以下功能:

- **主题切换**: 经典 / 白板 / 暗色
- **字体缩放**: 85% / 100% / 115% / 130%
- **导出PDF**: 打开打印对话框
- **导出图片**: 导出为PNG (需要html2canvas库)
- **撤销/重做**: Ctrl+Z / Ctrl+Shift+Z
- **示例数据**: 填充示例数据 (需要examples.js)
- **清除数据**: 清空所有已保存数据

### 撤销/重做 (Undo/Redo)

**自动启用**,无需额外配置:

```
Ctrl + Z        → 撤销
Ctrl + Shift + Z → 重做
Cmd + Z (Mac)   → 撤销
Cmd + Shift + Z  → 重做
```

**历史记录限制**: 最多保存50步操作历史

### 自定义工具逻辑

**在工具特定的JS文件中**:

```javascript
// assets/js/keyword-research.js

document.addEventListener('DOMContentLoaded', () => {
    // 等待ModiqiApp初始化
    const app = window.modiqiApp || new ModiqiApp('keyword_research_v1');

    // 自定义业务逻辑
    setupKeywordAnalyzer();
    setupCompetitorTracker();
});

function setupKeywordAnalyzer() {
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.addEventListener('click', () => {
        // 自定义分析逻辑
        const keyword = document.getElementById('keyword-input').value;
        analyzeKeyword(keyword);
    });
}

function analyzeKeyword(keyword) {
    // 分析逻辑...
    console.log('分析关键词:', keyword);
}
```

### 内容填充策略

**两种策略**:

1. **引导性问题** (Guiding Questions) - 适用于战略思考工具
2. **示例数据** (Example Data) - 适用于操作执行工具

**何时使用引导性问题**:
- ✅ 战略规划工具（SWOT、STP、PEST等）
- ✅ 需要用户深度思考的工具
- ✅ 没有标准答案的开放性分析
- ✅ 帮助用户理解应该填写什么内容

**何时使用示例数据**:
- ✅ 操作执行工具（预算分配、时间规划等）
- ✅ 有明确数据格式的工具
- ✅ 需要展示工具功能的场景
- ✅ 用户可以直接修改数据开始使用

---

### 引导性问题实现

**设计原则**:
- ✅ HTML源码直接包含引导性问题
- ✅ 问题应简洁、具体、启发思考
- ✅ 使用列表格式便于阅读
- ✅ 问题以"？"结尾，明确是待回答的

**示例：SWOT Analysis**:

```html
<div class="card-content" contenteditable="true" data-save-key="strengths">
    <ul>
        <li>我们做得好的地方是什么？</li>
        <li>我们要利用哪些独特的资源？</li>
        <li>别人认为我们的优势在哪里？</li>
    </ul>
</div>
```

**示例：STP Canvas 市场细分**:

```html
<div class="segment-content" contenteditable="true" data-save-key="seg_demographic">
    <ul>
        <li>年龄、性别、收入、教育程度？</li>
        <li>家庭结构、职业特征？</li>
    </ul>
</div>
```

**引导性问题编写原则**:
- 每个维度2-3个问题
- 问题应覆盖该维度的核心要素
- 使用简洁的关键词提示
- 避免过于复杂的长句

---

### 示例数据填充

**设计原则**:
- ✅ HTML源码使用通用占位符（保持设计系统合规）
- ✅ JavaScript在页面加载时填充示例数据（提供良好用户体验）
- ✅ 示例数据应真实可信，帮助用户理解工具用途
- ✅ 用户可以直接编辑示例数据开始工作

**实现模式**:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    new ModiqiApp('your_tool_v1');
    lucide.createIcons();

    // 定义示例数据
    const demoData = {
        project_name: '示例项目名称',
        description: '这是一个示例描述，展示工具的使用方式...',
        budget: '100000',
        // ... 更多字段
    };

    // 填充示例数据
    Object.keys(demoData).forEach(key => {
        const element = document.querySelector(`[data-save-key="${key}"]`);
        if (element) {
            if (element.hasAttribute('contenteditable')) {
                element.textContent = demoData[key];
            } else {
                element.value = demoData[key];
            }
        }
    });
});
```

**示例：Budget Allocator 示例数据**:

```javascript
// 设置总预算
document.getElementById('totalBudget').value = '100000';

// 设置各渠道预算
const amountInputs = document.querySelectorAll('.amount-input');
amountInputs[0].value = '30000';  // 搜索引擎
amountInputs[1].value = '25000';  // 社交媒体
amountInputs[2].value = '20000';  // 内容营销
amountInputs[3].value = '15000';  // 电子邮件
amountInputs[4].value = '10000';  // 展示广告

// 触发计算更新
updateCalculations();
```

**注意事项**:
- 示例数据应在 `ModiqiApp` 初始化之后填充
- 填充后不会触发自动保存（避免覆盖用户已有数据）
- 如果localStorage中已有数据，ModiqiApp会自动加载，示例数据不会覆盖

---

## 🎨 主题系统

### 支持的主题

1. **经典主题** (默认) - 暖色调木桌风格
2. **白板主题** - 纯白背景,适合投影演示
3. **暗色主题** - 深色背景,适合夜间使用

### 主题切换

**用户通过工具栏切换主题**,系统自动:
1. 更新 `body` 的class
2. 保存主题偏好到localStorage
3. 更新所有设计令牌值

**主题对应的Class**:

```html
<!-- 经典主题 (无class) -->
<body></body>

<!-- 白板主题 -->
<body class="theme-whiteboard"></body>

<!-- 暗色主题 -->
<body class="theme-dark"></body>
```

### 暗色主题令牌覆盖

**在 `tokens.css` 中自动覆盖**:

```css
body.theme-dark {
    --color-bg-desk: #121212;
    --color-bg-paper: #1e1e1e;
    --color-text-primary: #e0e0e0;
    --color-text-secondary: #aaaaaa;
    /* ... */
}
```

### 工具特定的主题适配

**通常不需要额外代码**,因为设计令牌会自动更新。

**例外情况** (需要特殊处理):

```css
/* 工具特定的暗色主题覆盖 */
body.theme-dark .my-special-element {
    /* 特殊样式 */
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}
```

---

### 彩色模式 (Color Mode)

**设计原则**: 默认单色设计,用户可选择启用彩色模式以增强视觉区分。

**启用方式**: 通过工具栏"彩色模式"按钮切换,系统会在 `body` 上添加 `.color-mode` class。

**实现规范**:

```css
/* 默认: 单色设计 */
.quadrant {
    background: transparent;
}

/* 彩色模式: 使用语义化颜色 */
body.color-mode .area-s {
    background-color: var(--color-semantic-strength);
}

body.color-mode .area-w {
    background-color: var(--color-semantic-weakness);
}

body.color-mode .area-o {
    background-color: var(--color-semantic-opportunity);
}

body.color-mode .area-t {
    background-color: var(--color-semantic-threat);
}
```

**暗色主题兼容**:

彩色模式在暗色主题下应禁用,避免颜色冲突:

```css
/* 仅在非暗色主题下启用彩色模式 */
body:not(.theme-dark).color-mode .area-s {
    background-color: var(--color-semantic-strength);
}

body:not(.theme-dark).color-mode .area-w {
    background-color: var(--color-semantic-weakness);
}
```

**重要原则**:
- ✅ 彩色模式是增强功能,不应该是必需的
- ✅ 所有信息在单色模式下也必须清晰可辨
- ✅ 使用语义化颜色令牌,不硬编码颜色值
- ✅ 在暗色主题下禁用彩色模式

**可用的语义化颜色令牌**:

```css
/* SWOT分析 */
--color-semantic-strength: #e8f0e4;     /* 优势 - 柔和绿色 */
--color-semantic-weakness: #f5e6e4;     /* 劣势 - 柔和粉色 */
--color-semantic-opportunity: #e4eaf0;  /* 机会 - 柔和蓝色 */
--color-semantic-threat: #f5f0e4;       /* 威胁 - 柔和黄色 */

/* 价值主张画布 */
--color-semantic-gain: #e6f0e8;      /* 获益 - 柔和薄荷色 */
--color-semantic-pain: #f2e4e4;      /* 痛点 - 柔和玫瑰色 */
--color-semantic-jobs: #e8eaf2;      /* 任务 - 柔和薰衣草色 */
--color-semantic-product: #f0e8f0;   /* 产品 - 柔和丁香色 */

/* 品牌原型 */
--color-archetype-independence: #eab308; /* 独立动机 - 黄色 */
--color-archetype-mastery: #ef4444;      /* 掌控动机 - 红色 */
--color-archetype-belonging: #22c55e;    /* 归属动机 - 绿色 */
--color-archetype-stability: #3b82f6;    /* 稳定动机 - 蓝色 */

/* 通用语义化颜色 */
--color-semantic-highlight: #fff9e6;  /* 高亮/重点 - 柔和黄色 */
--color-semantic-neutral: #f5f5f5;    /* 中性/次要 - 浅灰色 */
```

**使用场景**:
- `--color-semantic-highlight`: 用于强调重要区块(如价值主张、核心目标)
- `--color-semantic-neutral`: 用于次要区块或背景填充

---

## 💾 数据持久化

### 自动保存机制

**触发时机**:
- 用户输入后 **500ms** 自动保存
- 使用 **debounce** 防止频繁保存

**支持的元素**:
- `<input>` (所有类型)
- `<textarea>`
- `<select>`
- `[contenteditable]`

**使用方法**:

```html
<input type="text" data-save-key="field_name">
```

### 数据格式

**存储在 localStorage**:

```javascript
// Key格式
`modiqi_{toolId}_{saveKey}`

// 值格式
纯文本字符串

// 示例
localStorage['modiqi_swot_analysis_v1_strengths'] = "<ul><li>优势1</li></ul>"
localStorage['modiqi_swot_analysis_v1_meta_project'] = "我的战略分析"
localStorage['modiqi_swot_analysis_v1_meta_date'] = "2025-01-01"
```

### 数据导出/导入

**导出数据** (手动):

```javascript
// 导出所有数据为JSON
function exportAllData(toolId) {
    const prefix = `modiqi_${toolId}_`;
    const data = {};

    for (let key in localStorage) {
        if (key.startsWith(prefix)) {
            const saveKey = key.replace(prefix, '');
            data[saveKey] = localStorage[key];
        }
    }

    return JSON.stringify(data, null, 2);
}

// 使用
const json = exportAllData('swot_analysis_v1');
console.log(json);
```

**导入数据** (手动):

```javascript
function importData(toolId, jsonString) {
    const data = JSON.parse(jsonString);
    const prefix = `modiqi_${toolId}_`;

    for (let saveKey in data) {
        localStorage[prefix + saveKey] = data[saveKey];
    }

    // 刷新页面以加载数据
    location.reload();
}

// 使用
importData('swot_analysis_v1', jsonString);
```

### 清除数据

**用户通过工具栏 "清除数据" 按钮**,系统会:
1. 弹出确认对话框
2. 清除所有 `modiqi_{toolId}_*` 的localStorage数据
3. 刷新页面

---

## 🖨️ 打印优化

### 打印样式自动优化

**在 `tokens.css` 中已配置**:

```css
@media print {
    :root {
        /* 纯白背景 */
        --color-bg-paper: #ffffff;

        /* 高对比度边框 */
        --border-sem-outer: #000000;
        --border-sem-inner: #404040;

        /* 高对比度文字 */
        --color-text-primary: #000000;
        --color-text-secondary: #333333;

        /* 移除阴影和纹理 */
        --shadow-paper: none;
        --texture-noise: none;
    }
}
```

### 工具特定的打印样式

**在工具CSS文件中添加**:

```css
@media print {
    /* 隐藏工具栏 */
    .toolbar {
        display: none !important;
    }

    /* 避免分页断裂 */
    .section {
        page-break-inside: avoid;
    }

    /* 卡片打印优化 */
    .card {
        box-shadow: none;
        border: 2px solid var(--color-border-strong);
    }

    /* 移除背景色 */
    .metric-card {
        background: white !important;
    }
}
```

### 强制布局覆盖 (Force Layout Override)

**适用场景**: 当响应式布局在打印时需要强制保持特定布局(如矩阵网格)

**问题**: 响应式CSS会在打印时将网格布局转换为单列布局,导致打印效果不佳。

**解决方案**: 使用 `!important` 在打印媒体查询中强制覆盖响应式样式。

**实现示例**:

```css
/* 响应式: 小屏幕转为单列 */
@media (max-width: 1024px) {
    .quadrant-grid {
        display: flex;
        flex-direction: column;
    }
}

/* 打印: 强制保持网格布局 */
@media print {
    .quadrant-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        grid-template-rows: 1fr 1fr !important;
        flex-direction: unset !important;
    }

    .quadrant {
        border-width: 0.5pt;
        min-height: unset !important;
        border-top: unset !important;
    }

    /* 中心元素强制绝对定位 */
    .center-circle {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
    }
}
```

**使用原则**:
- ✅ 仅在打印媒体查询中使用 `!important`
- ✅ 用于覆盖响应式样式,确保打印布局正确
- ✅ 重置响应式中设置的属性(如 `min-height`, `margin`)
- ❌ 不在常规样式中使用 `!important`

**常见需要强制覆盖的属性**:
- `display` - 强制保持网格/弹性布局
- `flex-direction` - 重置为默认方向
- `position` - 强制绝对/相对定位
- `min-height` / `max-height` - 重置高度限制
- `margin` / `padding` - 重置间距

---

### 打印时网格行高调整 (Print Grid Row Adjustment)

**适用场景**: 复杂网格布局在打印时需要优化空间利用

**问题**: 屏幕显示的行高比例在打印时可能导致空间浪费或内容溢出

**解决方案**: 在打印媒体查询中调整 `grid-template-rows` 的比例

**实现示例**:

```css
/* 屏幕显示: 第1行较高,第2行较矮 */
.canvas-grid {
    grid-template-rows: 2.5fr 1.5fr 1.5fr;
}

/* 打印: 调整第2行高度以优化空间 */
@media print {
    .canvas-grid {
        grid-template-rows: 2.5fr 2.5fr 1.5fr !important;  /* 第2行从1.5fr改为2.5fr */
    }
}
```

**调整原则**:
- ✅ 根据打印后的实际内容密度调整
- ✅ 确保所有内容在单页内完整显示
- ✅ 避免内容溢出或过度压缩
- ✅ 测试实际打印效果后微调

**常见调整场景**:

| 场景 | 屏幕行高 | 打印行高 | 原因 |
|------|---------|---------|------|
| 商业模式画布 | `2.5fr 1.5fr 1.5fr` | `2.5fr 2.5fr 1.5fr` | 第2行内容较多,需要更多空间 |
| 三行等高网格 | `1fr 1fr 1fr` | `1fr 1fr 1fr` | 无需调整 |
| 头重脚轻布局 | `3fr 1fr` | `2.5fr 1.5fr` | 平衡打印空间分配 |

**测试方法**:
1. 使用浏览器打印预览功能
2. 检查内容是否溢出或过度压缩
3. 调整fr值,重新预览
4. 确保在A3/A4纸张上完整显示

---

### 打印前检查清单

- [ ] 移除/隐藏工具栏
- [ ] 移除背景纹理
- [ ] 增强边框对比度
- [ ] 避免分页断裂 (`page-break-inside: avoid`)
- [ ] 确保文字对比度 ≥ 7:1
- [ ] 移除阴影效果
- [ ] 测试A4纸张打印效果

### 动态内容数量限制

**原则：打印文件必须在单页内完整展示，不使用滚动**

对于包含动态添加行/项的工具（如表格、列表），必须限制最大数量以确保打印效果：

**实现模式（参考 `budget-allocator.html`）**:

```javascript
const addBtn = document.getElementById('addItemBtn');
const MAX_ITEMS = 12; // 根据工具布局调整

function updateItemLimit() {
    const currentCount = container.children.length;
    if (currentCount >= MAX_ITEMS) {
        addBtn.style.display = 'none';
    } else {
        addBtn.style.display = 'flex';
    }
}

addBtn.addEventListener('click', () => {
    const currentCount = container.children.length;
    if (currentCount >= MAX_ITEMS) return;

    // 添加新项逻辑...

    updateItemLimit(); // 更新按钮显示状态
});

// 删除项时也要更新
function deleteItem() {
    // 删除逻辑...
    updateItemLimit();
}

// 初始化时检查
updateItemLimit();
```

**数量限制建议**:
- A4 纸张工具：8-10 项
- A3 纸张工具：12-15 项
- 根据每行高度和工具布局调整

**禁止使用**:
- ❌ 滚动容器 (`overflow-y: auto`)
- ❌ 弹窗提示达到限制 (`alert()`)
- ✅ 自动隐藏添加按钮（用户体验更好）

---

## ♿ 无障碍访问 (Accessibility)

### 键盘导航

**所有交互元素必须可通过键盘访问**:

```html
<!-- ✅ 正确: 按钮可聚焦 -->
<button class="btn">操作</button>

<!-- ❌ 错误: div不可聚焦 -->
<div onclick="doSomething()">操作</div>

<!-- ✅ 修复: 添加tabindex和role -->
<div tabindex="0" role="button" onclick="doSomething()">操作</div>
```

**Tab顺序**:
1. 标题/Logo (可选跳过)
2. Meta输入框
3. 主内容区域
4. 工具栏按钮

### ARIA标签

**为图标按钮添加 `aria-label`**:

```html
<!-- ❌ 错误: 屏幕阅读器无法理解 -->
<button class="btn">
    <i data-lucide="save"></i>
</button>

<!-- ✅ 正确: 添加aria-label -->
<button class="btn" aria-label="保存">
    <i data-lucide="save"></i>
</button>
```

**为表单添加 `label`**:

```html
<!-- ❌ 错误: 无label -->
<input type="text" placeholder="项目名称">

<!-- ✅ 正确: 显式label -->
<label for="project-name">项目名称</label>
<input type="text" id="project-name">

<!-- ✅ 可选: 隐式label -->
<label>
    项目名称
    <input type="text">
</label>
```

### 颜色对比度

**WCAG AA标准** (最低要求):
- 正文 (18px以下): **4.5:1**
- 大号文字 (≥18px): **3:1**

**WCAG AAA标准** (推荐):
- 正文: **7:1**
- 大号文字: **4.5:1**

**Modiqi设计系统对比度**:
| 组合 | 对比度 | 等级 |
|------|--------|------|
| `--color-text-primary` on `--color-bg-white` | 14.6:1 | AAA ✅ |
| `--color-text-secondary` on `--color-bg-white` | 7.3:1 | AAA ✅ |
| `--color-text-tertiary` on `--color-bg-white` | 4.8:1 | AA ✅ |

**检查工具**:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Lighthouse审计

### 焦点可见性

**系统已配置焦点样式**:

```css
[contenteditable]:focus {
    background-color: var(--color-focus-bg);
    box-shadow: inset 2px 0 0 0 var(--color-focus-border);
    outline: none;
}

.btn:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
}
```

**Focus-within 状态样式**:

用于当容器内部元素获得焦点时,高亮整个容器:

```css
.card:focus-within {
    background-color: var(--color-focus-bg);
}

.quadrant:focus-within {
    background-color: var(--color-focus-bg);
}

.center-circle:focus-within {
    background-color: var(--color-focus-bg);
}
```

**使用场景**:
- 卡片内有可编辑内容时,整个卡片高亮
- 矩阵象限内有可编辑内容时,整个象限高亮
- 提供更好的视觉反馈,帮助用户识别当前编辑区域

**规范**:
- ✅ 使用 `--color-focus-bg` 令牌(淡蓝色半透明)
- ✅ 不添加边框或阴影,保持简洁
- ✅ 仅用于包含可编辑内容的容器

### 语义化HTML

**使用正确的HTML标签**:

```html
<!-- ✅ 正确 -->
<header></header>
<main></main>
<section></section>
<article></article>
<nav></nav>
<footer></footer>

<!-- ❌ 错误: 全部用div -->
<div class="header"></div>
<div class="main"></div>
```

---

## ⚡ 性能优化

### 延迟加载重型库

**按需加载图表库**:

```javascript
// ❌ 错误: 首屏就加载
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// ✅ 正确: 动态加载
function loadChartLibrary() {
    return new Promise((resolve, reject) => {
        if (window.Chart) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 使用
document.getElementById('show-chart-btn').addEventListener('click', async () => {
    await loadChartLibrary();
    renderChart();
});
```

### CSS作用域

**避免全局污染**:

```css
/* ❌ 错误: 太通用,会影响其他工具 */
.card {
    background: red;
}

/* ✅ 正确: 命名空间 */
.keyword-research-tool .metric-card {
    background: var(--color-bg-white);
}

/* ✅ 更好: 使用唯一类名 */
.kr-metric-card {
    background: var(--color-bg-white);
}
```

### 图片优化

**Logo使用SVG或WebP**:

```html
<!-- ✅ SVG (矢量,体积小) -->
<img src="logo.svg" alt="Logo">

<!-- ✅ WebP (体积小,质量高) -->
<img src="logo.webp" alt="Logo">

<!-- ❌ PNG (体积大) -->
<img src="logo.png" alt="Logo">
```

**图标使用Lucide而非图片**:

```html
<!-- ✅ 使用Lucide图标 (SVG,可缩放,可自定义颜色) -->
<i data-lucide="search"></i>

<!-- ❌ 使用图片图标 -->
<img src="icon-search.png">
```

### 减少重绘/重排

**避免频繁操作DOM**:

```javascript
// ❌ 错误: 循环中修改DOM
for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    container.appendChild(div); // 100次重排
}

// ✅ 正确: 批量操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    fragment.appendChild(div);
}
container.appendChild(fragment); // 1次重排
```

---

## 🚫 禁止事项

### 1. 禁止硬编码颜色值

```css
/* ❌ 禁止 */
.my-card {
    background: #ffffff;
    color: #1a1a1a;
}

/* ✅ 使用设计令牌 */
.my-card {
    background: var(--color-bg-white);
    color: var(--color-text-primary);
}
```

### 2. 禁止硬编码间距值

```css
/* ❌ 禁止 */
.my-card {
    padding: 24px;
    margin-bottom: 32px;
}

/* ✅ 使用设计令牌 */
.my-card {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}
```

### 3. 禁止内联样式 (除非绝对必要)

```html
<!-- ❌ 禁止 -->
<div style="color: red; padding: 20px;">错误</div>

<!-- ✅ 使用CSS类 -->
<div class="alert alert-error">错误</div>
```

### 4. 禁止使用 !important (除非覆盖第三方库)

```css
/* ❌ 禁止 */
.my-card {
    background: white !important;
}

/* ✅ 提高选择器优先级 */
.tool-content .my-card {
    background: white;
}
```

### 5. 禁止自定义字体

```css
/* ❌ 禁止 */
@import url('https://fonts.googleapis.com/css2?family=Roboto');

.my-text {
    font-family: 'Roboto', sans-serif;
}

/* ✅ 使用设计系统字体 */
.my-text {
    font-family: var(--font-sans);
}
```

### 6. 禁止修改设计系统文件

```
❌ 禁止直接修改:
- shared/css/tokens.css
- shared/css/base.css
- shared/css/components.css
- shared/css/canvas.css

✅ 如需修改设计系统:
1. 提交Issue讨论
2. 通过团队评审
3. 更新版本号
4. 发布Changelog
```

### 7. 禁止使用 Emoji 表情符号

**原因**: Emoji 在不同操作系统和浏览器中显示不一致,影响视觉统一性。

```html
<!-- ❌ 禁止使用 Emoji -->
<h2>📊 数据分析</h2>
<button>✅ 确认</button>
<div>⚠️ 警告信息</div>

<!-- ✅ 使用 Lucide 字体图标 -->
<h2><i data-lucide="bar-chart"></i> 数据分析</h2>
<button><i data-lucide="check"></i> 确认</button>
<div><i data-lucide="alert-triangle"></i> 警告信息</div>
```

### 8. 禁止在彩色模式下为图标添加颜色

**原因**: 图标应保持单色,彩色模式仅通过背景色和徽章颜色体现,保持视觉克制。

```css
/* ❌ 禁止 - 彩色模式下改变图标颜色 */
body.color-mode .card-header .icon {
    color: var(--color-success);
}

/* ✅ 正确 - 图标始终保持单色 */
.card-header .icon {
    color: var(--color-text-secondary);
}

/* ✅ 彩色模式仅改变背景和徽章 */
body.color-mode .card {
    background: var(--color-bg-success-subtle);
}

body.color-mode .badge {
    background: var(--color-success);
    color: white;
}
```

### 9. 禁止使用边框色彩作为主要视觉区分

**原因**: 边框色彩(尤其是 `border-left` 粗边框)过于突兀,不符合单色优先设计原则。

```css
/* ❌ 禁止 - 使用彩色边框作为主要区分 */
body.color-mode .quadrant {
    border-left: 4px solid var(--color-success);
}

body.color-mode .card {
    border: 2px solid var(--color-brand-blue);
}

/* ✅ 正确 - 使用柔和背景色 */
body.color-mode .quadrant {
    background: var(--color-bg-success-subtle);
}

body.color-mode .card {
    background: rgba(59, 130, 246, 0.08);
}
```

**彩色模式设计原则**:
- ✅ 使用柔和的背景色调 (subtle background tints)
- ✅ 徽章可使用实心颜色 (solid color badges)
- ✅ 保持图标单色 (monochrome icons)
- ❌ 避免彩色边框 (avoid colored borders)
- ❌ 避免彩色图标 (avoid colored icons)
- ❌ 避免高饱和度颜色 (avoid high saturation colors)

### 10. 禁止使用渐变

**原因**: 渐变效果与单色优先设计原则冲突,增加视觉复杂度,不利于打印输出。

```css
/* ❌ 禁止 - 任何形式的渐变 */
.card {
    background: linear-gradient(to bottom, #ffffff, #f0f0f0);
}

.header {
    background: radial-gradient(circle, #3b82f6, #1e40af);
}

.text {
    background: linear-gradient(90deg, #10b981, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* ✅ 正确 - 使用纯色 */
.card {
    background: var(--color-bg-paper);
}

.header {
    background: var(--color-brand-blue);
}

.text {
    color: var(--color-text-primary);
}
```

**设计原则**:
- ✅ 使用纯色背景 (solid colors)
- ✅ 使用设计令牌中的颜色 (design tokens)
- ✅ 保持视觉简洁 (visual simplicity)
- ❌ 避免线性渐变 (avoid linear gradients)
- ❌ 避免径向渐变 (avoid radial gradients)
- ❌ 避免文字渐变 (avoid text gradients)

**例外情况 - 评级/进度条可视化**:

在**彩色模式**下，评级条和进度条允许使用渐变来表示状态变化（如 差→一般→良好→优秀）：

```css
/* ✅ 允许 - 彩色模式下的评级/进度条渐变 */
body:not(.theme-dark).color-mode .rating-bar {
    background: linear-gradient(to right,
        var(--color-error) 0%,
        var(--color-warning) 33%,
        var(--color-info) 66%,
        var(--color-success) 100%);
}
```

此例外仅适用于：
- 渐变仅在 `color-mode` 下启用
- 默认状态（无 `color-mode`）和暗色模式必须使用纯色
- 渐变必须使用设计令牌中的状态颜色 (`--color-error`, `--color-warning`, `--color-info`, `--color-success`)

### 11. 禁止在工具页面使用圆角

**原因**: 圆角设计过于"软件化",不符合专业文档/打印工具的定位。直角边框更专业、更正式,与纸张文档风格一致。

```css
/* ❌ 禁止 - 在工具页面使用圆角 */
.objective-card {
    border-radius: var(--radius-lg);
}

.kr-item {
    border-radius: var(--radius-md);
}

.btn-add-item {
    border-radius: var(--radius-lg);
}

/* ✅ 正确 - 使用直角边框 */
.objective-card {
    border: 1px solid var(--color-border-light);
    /* 无 border-radius */
}

.kr-item {
    background: var(--color-bg-subtle);
    /* 无 border-radius */
}

.btn-add-item {
    border: 1px dashed var(--color-border-medium);
    /* 无 border-radius */
}
```

**设计原则**:
- ✅ 使用直角边框 (sharp corners)
- ✅ 保持专业文档风格 (professional document aesthetic)
- ✅ 优化打印输出 (print-friendly)
- ❌ 避免圆角 (avoid border-radius)
- ❌ 避免过度"软件化"的视觉风格 (avoid app-like UI)

**例外情况**:
- 启动器页面 (index.html) 的工具卡片可适当使用微小圆角 (`--radius-sm`)
- 头像、徽章等特定组件可使用圆角或圆形 (`--radius-full`)

**图标使用指南**:

1. **引入 Lucide 图标库** (已在所有模板中引入):
```html
<script src="https://unpkg.com/lucide@latest"></script>
```

2. **使用图标**:
```html
<!-- 基础用法 -->
<i data-lucide="icon-name"></i>

<!-- 常用图标示例 -->
<i data-lucide="check"></i>          <!-- 确认/成功 -->
<i data-lucide="x"></i>               <!-- 关闭/取消 -->
<i data-lucide="alert-triangle"></i>  <!-- 警告 -->
<i data-lucide="info"></i>            <!-- 信息 -->
<i data-lucide="search"></i>          <!-- 搜索 -->
<i data-lucide="settings"></i>        <!-- 设置 -->
<i data-lucide="user"></i>            <!-- 用户 -->
<i data-lucide="calendar"></i>        <!-- 日历 -->
```

3. **初始化图标** (在JavaScript中):
```javascript
lucide.createIcons({
    attrs: {
        class: "icon",
        'stroke-width': 2
    }
});
```

4. **图标样式控制**:
```css
.icon {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    color: var(--color-text-secondary);
}
```

**图标资源**:
- 浏览所有可用图标: [https://lucide.dev/icons/](https://lucide.dev/icons/)
- 图标命名规范: 使用小写字母和连字符 (kebab-case)

---

## ✅ 测试清单

创建新工具后,必须通过以下检查:

### 功能测试

- [ ] **浏览器兼容性**: 在Chrome/Firefox/Safari中正常显示
- [ ] **响应式**: 在1024px-1920px宽度下正常显示
- [ ] **主题切换**: 经典/白板/暗色主题正常切换
- [ ] **数据持久化**: 输入数据刷新后保留
- [ ] **自动保存**: 输入500ms后自动保存
- [ ] **撤销/重做**: Ctrl+Z / Ctrl+Shift+Z 正常工作
- [ ] **导出PDF**: 打印预览正常
- [ ] **导出图片**: 图片导出正常(如果启用)

### 样式测试

- [ ] **无CSS硬编码**: 运行stylelint无错误
- [ ] **设计令牌使用**: 所有颜色/间距使用变量
- [ ] **字体一致性**: 使用统一字体家族
- [ ] **间距一致性**: 使用8pt网格
- [ ] **组件一致性**: 按钮/卡片/输入框样式统一

### 代码质量

- [ ] **无控制台错误**: 打开DevTools无JS错误
- [ ] **无控制台警告**: 无CSS/图片加载警告
- [ ] **图标正常加载**: 所有Lucide图标正常显示
- [ ] **代码格式化**: 使用Prettier格式化
- [ ] **注释清晰**: 关键逻辑有注释说明

### 无障碍测试

- [ ] **键盘导航**: Tab键可以访问所有交互元素
- [ ] **ARIA标签**: 图标按钮有aria-label
- [ ] **颜色对比度**: 文字对比度 ≥ 4.5:1
- [ ] **焦点可见**: 焦点状态清晰可见
- [ ] **语义化HTML**: 使用正确的HTML标签

### 性能测试

- [ ] **首屏加载**: < 3秒
- [ ] **图片优化**: 使用SVG/WebP格式
- [ ] **延迟加载**: 重型库按需加载
- [ ] **无重复请求**: 无重复加载资源

---

## ❓ FAQ (常见问题)

### Q1: 如何选择合适的画布类型?

**A**: **A3为默认**，仅简单内容用A4:
- **A3横向 (默认)** (1400px × 990px): 大多数工具 - 矩阵、仪表盘、画布、复杂布局
- **A4纵向** (794px × 1123px): 仅用于简单表单、清单、竖版线性流程
- ⚠️ **无A4横向**: 横向内容一律使用A3

### Q2: 为什么我的工具样式不生效?

**A**: 检查CSS加载顺序:
1. tokens.css (必须第一个)
2. base.css
3. components.css
4. canvas.css
5. 工具特定CSS (最后)

### Q3: 如何覆盖设计系统的默认样式?

**A**: 在工具特定CSS中使用更高优先级的选择器:

```css
/* 默认样式 (components.css) */
.btn {
    padding: var(--spacing-sm) var(--spacing-md);
}

/* 工具特定覆盖 (your-tool.css) */
.my-tool .btn {
    padding: var(--spacing-md) var(--spacing-lg);
}
```

### Q4: 数据保存在哪里?

**A**: 保存在浏览器的 localStorage,格式:

```
localStorage['modiqi_{toolId}_{saveKey}'] = value
```

**注意**: localStorage有容量限制 (通常5-10MB),不适合存储大量数据。

### Q5: 如何添加自定义主题?

**A**: 不建议添加自定义主题。如有需求,联系设计系统维护者。

如果必须添加,在tokens.css中:

```css
body.theme-custom {
    --color-bg-desk: #yourColor;
    --color-bg-paper: #yourColor;
    /* ... 覆盖所有必需的令牌 */
}
```

### Q6: 如何调试自动保存功能?

**A**: 打开浏览器DevTools:

```javascript
// 查看所有保存的数据
for (let key in localStorage) {
    if (key.startsWith('modiqi_')) {
        console.log(key, localStorage[key]);
    }
}

// 手动触发保存
const app = window.modiqiApp;
app.saveAllData();
```

### Q7: 如何禁用自动保存?

**A**: 移除 `data-save-key` 属性:

```html
<!-- 启用自动保存 -->
<input type="text" data-save-key="field_name">

<!-- 禁用自动保存 -->
<input type="text">
```

### Q8: 如何添加新的设计令牌?

**A**:
1. 在 `tokens.css` 中添加新令牌
2. 更新本文档 (DESIGN_SYSTEM.md)
3. 更新设计系统版本号
4. 发布Changelog

### Q9: 图标不显示怎么办?

**A**: 检查:
1. 是否引入了Lucide script: `<script src="https://unpkg.com/lucide@latest"></script>`
2. 是否初始化了图标: `lucide.createIcons()`
3. 图标名称是否正确: https://lucide.dev/icons/

### Q10: 如何集成图表库 (Chart.js)?

**A**: 延迟加载:

```javascript
// 1. 动态加载Chart.js
function loadChartLibrary() {
    return new Promise((resolve) => {
        if (window.Chart) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}

// 2. 使用
async function renderChart() {
    await loadChartLibrary();

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3],
            }]
        }
    });
}
```

---

## 📞 获取帮助

- **查看示例**: `/strategy-toolkit/swot-analysis.html` (最佳实践)
- **设计系统文档**: `/shared/design-guide/index.html` (可视化组件库)
- **贡献指南**: `/docs/CONTRIBUTION_GUIDE.md`
- **变更日志**: `/docs/CHANGELOG.md`
- **联系维护者**: [维护者邮箱/Slack频道]

---

**文档维护者**: Modiqi Design System Team
**最后更新**: 2025-01-01
**文档版本**: 2.1.0
