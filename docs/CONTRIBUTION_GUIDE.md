# Modiqi 工具开发贡献指南

> **文档版本**: 1.0.0
> **最后更新**: 2025-01-01
> **适用于**: 所有参与Modiqi项目开发的开发者和AI工具

---

## 📚 目录

1. [欢迎](#欢迎)
2. [开发新工具的完整流程](#开发新工具的完整流程)
3. [使用模板创建工具](#使用模板创建工具)
4. [工具开发规范](#工具开发规范)
5. [CSS样式规范](#css样式规范)
6. [JavaScript规范](#javascript规范)
7. [设计系统更新流程](#设计系统更新流程)
8. [代码审查清单](#代码审查清单)
9. [Git提交规范](#git提交规范)
10. [测试指南](#测试指南)
11. [常见问题](#常见问题)

---

## 👋 欢迎

感谢你为Modiqi数字营销工作台做出贡献!本指南将帮助你:

- ✅ 快速创建符合设计规范的新工具
- ✅ 了解代码规范和最佳实践
- ✅ 掌握团队协作流程
- ✅ 确保代码质量和一致性

**在开始前,请先阅读**: [设计系统使用指南](DESIGN_SYSTEM.md)

---

## 🚀 开发新工具的完整流程

### 阶段 1: 规划与设计 (Planning & Design)

#### 1.1 确定工具需求

**回答以下问题**:
- [ ] 工具的目标用户是谁? (初创企业 / 成长型企业 / 咨询顾问)
- [ ] 解决什么问题? (关键词研究 / 竞品分析 / ROI计算 / ...)
- [ ] 核心功能是什么? (3-5个主要功能点)
- [ ] 参考了哪些竞品或现有工具? (链接或截图)

#### 1.2 确定工具元数据

填写以下信息 (将用于模板替换):

```yaml
工具中文名称 (TOOL_NAME_CN): "关键词研究工具"
工具英文名称 (TOOL_NAME_EN): "Keyword Research Tool"
工具唯一ID (TOOL_ID): "keyword_research_v1"
工具描述 (TOOL_DESCRIPTION): "帮助您发现和分析高价值SEO关键词"
SEO关键词 (TOOL_KEYWORDS): "关键词研究,SEO,搜索优化,关键词分析"
所属工作台 (TOOLKIT_NAME): "seo-toolkit"
图标名称 (ICON_NAME): "search"
```

**工具ID命名规范**:
- 格式: `{工具名}_{版本}`
- 示例: `keyword_research_v1`, `competitor_analysis_v2`
- 规则:
  - 全小写
  - 单词间用下划线连接
  - 版本号从v1开始
  - 禁止使用中文/特殊字符

**图标选择**:
- 浏览 https://lucide.dev/icons/
- 选择与工具功能相关的图标
- 常用图标: `search`, `target`, `bar-chart`, `users`, `trending-up`

#### 1.3 选择画布类型

根据内容复杂度选择:

| 画布类型 | 适用场景 | 文件模板 |
|---------|---------|---------|
| **A3横向** | 复杂矩阵型工具 (SWOT、BMC等) | `tool-template-a3.html` |
| **A4纵向** | 简单表单、清单、线性流程 | `tool-template-a4.html` |
| **A4横向** | 仪表盘、数据对比、时间线 | `tool-template-a4-landscape.html` |

#### 1.4 绘制低保真原型

**工具**:
- Figma / Sketch / Adobe XD (推荐)
- Balsamiq / Excalidraw (快速原型)
- 纸笔草图 (最快)

**原型要求**:
- 标注区块划分 (Header / 内容区块 / Footer)
- 标注交互元素 (输入框、按钮、下拉框)
- 标注数据流向 (用户输入 → 计算/处理 → 结果展示)

**参考现有工具**:
- SWOT分析: `strategy-toolkit/swot-analysis.html`
- KPI仪表盘: `analytics-toolkit/kpi-dashboard.html`
- 用户画像: `strategy-toolkit/user-persona.html`

---

### 阶段 2: 创建工具文件 (File Creation)

#### 2.1 使用模板创建HTML

**方式A: 手动复制模板**

```bash
# 1. 进入shared/templates目录
cd shared/templates/

# 2. 根据画布类型选择模板
# - tool-template-a3.html (A3横向)
# - tool-template-a4.html (A4纵向)
# - tool-template-a4-landscape.html (A4横向)

# 3. 复制模板到目标工作台
cp tool-template-a3.html ../../seo-toolkit/keyword-research.html

# 4. 全局替换占位符 (在编辑器中)
# {{TOOL_NAME_CN}}     → 关键词研究工具
# {{TOOL_NAME_EN}}     → Keyword Research Tool
# {{TOOL_ID}}          → keyword_research_v1
# {{TOOL_DESCRIPTION}} → 帮助您发现和分析高价值SEO关键词
# {{TOOL_KEYWORDS}}    → 关键词研究,SEO,搜索优化
# {{TOOLKIT_NAME}}     → seo-toolkit
# {{ICON_NAME}}        → search
```

**方式B: 使用AI辅助创建**

如果你是AI (如Claude、GPT),请执行以下步骤:

```
1. 询问用户以下7个占位符的值:
   - TOOL_NAME_CN
   - TOOL_NAME_EN
   - TOOL_ID
   - TOOL_DESCRIPTION
   - TOOL_KEYWORDS
   - TOOLKIT_NAME
   - ICON_NAME

2. 读取合适的模板文件:
   - shared/templates/tool-template-a3.html
   - shared/templates/tool-template-a4.html
   - shared/templates/tool-template-a4-landscape.html

3. 执行全局替换,生成新文件

4. 同时创建对应的CSS文件 (见下一步)
```

#### 2.2 创建工具特定CSS

```bash
# 1. 创建CSS目录 (如果不存在)
mkdir -p seo-toolkit/assets/css

# 2. 创建CSS文件
touch seo-toolkit/assets/css/keyword-research.css
```

**初始CSS模板**:

```css
/* ============================================
   KEYWORD RESEARCH TOOL - SPECIFIC STYLES
   关键词研究工具 - 特定样式
   Version: 1.0.0
   ============================================ */

/* ========================================
   工具特定变量 (可选)
   ======================================== */

:root {
    /* 如需工具特定颜色,在此定义 */
    /* --keyword-research-primary: #4e609f; */
}

/* ========================================
   工具布局
   ======================================== */

.tool-content {
    /* 使用设计系统的间距令牌 */
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
}

/* ========================================
   工具特定组件
   ======================================== */

.keyword-input-section {
    background: var(--color-bg-white);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
}

.keyword-results {
    /* ... */
}

/* ========================================
   响应式
   ======================================== */

@media (max-width: 1200px) {
    .tool-content {
        grid-template-columns: 1fr;
    }
}

/* ========================================
   打印优化
   ======================================== */

@media print {
    .keyword-input-section {
        page-break-inside: avoid;
    }
}
```

#### 2.3 (可选) 创建工具特定JavaScript

**如果工具需要复杂交互逻辑**,创建独立的JS文件:

```bash
# 创建JS目录
mkdir -p seo-toolkit/assets/js

# 创建JS文件
touch seo-toolkit/assets/js/keyword-research.js
```

**JS文件模板**:

```javascript
/**
 * Keyword Research Tool - Specific Logic
 * 关键词研究工具 - 特定逻辑
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // 等待DOM加载
    document.addEventListener('DOMContentLoaded', () => {
        // 等待ModiqiApp初始化
        const app = window.modiqiApp || new ModiqiApp('keyword_research_v1');

        // 初始化工具特定功能
        initKeywordAnalyzer();
        initCompetitorTracker();
    });

    /**
     * 初始化关键词分析器
     */
    function initKeywordAnalyzer() {
        const analyzeBtn = document.getElementById('analyze-btn');
        if (!analyzeBtn) return;

        analyzeBtn.addEventListener('click', () => {
            const keyword = document.getElementById('keyword-input').value.trim();

            if (!keyword) {
                showError('请输入关键词');
                return;
            }

            analyzeKeyword(keyword);
        });
    }

    /**
     * 分析关键词
     * @param {string} keyword - 关键词
     */
    function analyzeKeyword(keyword) {
        // 显示加载状态
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '<div class="spinner"></div>';

        // 模拟API调用 (实际项目中替换为真实API)
        setTimeout(() => {
            const results = generateMockResults(keyword);
            displayResults(results);
        }, 1000);
    }

    /**
     * 生成模拟数据
     */
    function generateMockResults(keyword) {
        return {
            keyword: keyword,
            searchVolume: Math.floor(Math.random() * 10000),
            difficulty: Math.floor(Math.random() * 100),
            cpc: (Math.random() * 10).toFixed(2)
        };
    }

    /**
     * 显示结果
     */
    function displayResults(results) {
        const html = `
            <div class="result-card">
                <h3>${results.keyword}</h3>
                <div class="metrics">
                    <div class="metric">
                        <span class="label">搜索量</span>
                        <span class="value">${results.searchVolume.toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="label">难度</span>
                        <span class="value">${results.difficulty}</span>
                    </div>
                    <div class="metric">
                        <span class="label">CPC</span>
                        <span class="value">$${results.cpc}</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('results').innerHTML = html;
    }

    /**
     * 显示错误信息
     */
    function showError(message) {
        alert(message); // 实际项目中使用更优雅的提示方式
    }

    /**
     * 初始化竞品追踪 (示例)
     */
    function initCompetitorTracker() {
        // ...
    }

})();
```

**在HTML中引入**:

```html
<script src="assets/js/keyword-research.js"></script>
```

---

### 阶段 3: 开发内容 (Development)

#### 3.1 编辑HTML - 删除示例代码

模板中包含示例区块,请**删除**并替换为实际内容:

```html
<!-- 模板示例代码 (需要删除) -->
<div class="tool-grid">
    <div class="tool-section">
        <div class="section-header">...</div>
        <div class="section-content">示例内容</div>
    </div>
</div>

<!-- 替换为实际工具内容 -->
<div class="keyword-research-layout">
    <section class="input-section">
        <h2>输入关键词</h2>
        <input type="text" id="keyword-input" class="input" placeholder="输入关键词...">
        <button id="analyze-btn" class="btn btn-primary">分析</button>
    </section>

    <section class="results-section">
        <h2>分析结果</h2>
        <div id="results"></div>
    </section>
</div>
```

#### 3.2 使用设计系统组件

**按钮示例**:

```html
<button class="btn btn-primary">保存</button>
<button class="btn btn-secondary">取消</button>
<button class="btn btn-ghost">重置</button>
```

**输入框示例**:

```html
<input type="text" class="input" placeholder="请输入...">
<textarea class="input" rows="5"></textarea>
<select class="input">
    <option>选项1</option>
</select>
```

**卡片示例**:

```html
<div class="card">
    <div class="card-header">
        <i data-lucide="info"></i>
        <h3 class="card-title">标题</h3>
    </div>
    <div class="card-content">
        内容...
    </div>
</div>
```

#### 3.3 启用自动保存

**为需要保存的字段添加 `data-save-key`**:

```html
<!-- 输入框自动保存 -->
<input type="text" data-save-key="keyword_input">

<!-- Contenteditable自动保存 -->
<div contenteditable="true" data-save-key="notes">
    可编辑内容...
</div>

<!-- Textarea自动保存 -->
<textarea data-save-key="description"></textarea>
```

**命名规范** (data-save-key):
- 使用蛇形命名法 (snake_case)
- 语义化命名: `keyword_input`, `analysis_results`, `competitor_list`
- 避免通用名: `field1`, `data`, `temp`

#### 3.4 编写工具特定CSS

**在 `keyword-research.css` 中**:

```css
/* 使用命名空间避免样式冲突 */
.keyword-research-layout {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--spacing-xl);
}

.input-section {
    background: var(--color-bg-subtle);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
}

.results-section {
    /* 使用设计令牌 */
    background: var(--color-bg-white);
    border: 1px solid var(--color-border-light);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
}

/* 响应式 */
@media (max-width: 1024px) {
    .keyword-research-layout {
        grid-template-columns: 1fr;
    }
}

/* 打印优化 */
@media print {
    .input-section {
        display: none; /* 打印时隐藏输入区域 */
    }
}
```

**⚠️ 重要**: 只在工具CSS中写**工具特定**的样式,不要覆盖设计系统基础样式

---

### 阶段 4: 测试 (Testing)

#### 4.1 功能测试

- [ ] **浏览器测试**: Chrome / Firefox / Safari 中打开工具
- [ ] **自动保存测试**: 输入数据 → 刷新页面 → 数据保留
- [ ] **主题切换测试**: 切换经典/白板/暗色主题,检查样式
- [ ] **交互测试**: 点击所有按钮、输入框,确保功能正常
- [ ] **打印测试**: Ctrl+P 打开打印预览,检查打印效果

#### 4.2 样式测试

- [ ] **设计令牌检查**: 确保所有颜色/间距使用CSS变量
- [ ] **响应式测试**: 在1024px-1920px宽度下测试
- [ ] **间距一致性**: 检查区块间距是否符合8pt网格
- [ ] **字体一致性**: 标题使用衬线,正文使用无衬线

#### 4.3 代码质量测试

- [ ] **无Console错误**: 打开DevTools,检查Console无JS错误
- [ ] **图标加载**: 所有Lucide图标正常显示
- [ ] **HTML验证**: 使用W3C Validator验证HTML
- [ ] **CSS验证**: 运行stylelint (如果配置)

---

### 阶段 5: 集成到工作台 (Integration)

#### 5.1 更新工作台主页

编辑 `seo-toolkit/index.html`,添加工具卡片:

```html
<!-- 在 launcher-grid 中添加 -->
<a href="keyword-research.html" class="tool-card">
    <i data-lucide="search" class="paper-icon"></i>
    <div class="mini-preview">
        <div class="card-badge">NEW</div>
        <!-- SVG预览图 (可选) -->
        <svg viewBox="0 0 200 140">
            <!-- 简化的工具预览图 -->
        </svg>
    </div>
    <div class="card-meta">
        <h3 class="tool-title">关键词研究工具 <span class="en-sub">(Keyword Research)</span></h3>
        <p class="tool-desc">发现和分析高价值SEO关键词。</p>
    </div>
</a>
```

#### 5.2 更新主页工具数量

编辑 `index.html`,更新工作台的工具数量徽章:

```html
<!-- 更新 SEO Workbench 的徽章 -->
<a href="seo-toolkit/index.html" class="tool-card">
    <div class="mini-preview">
        <div class="card-badge">5 工具</div> <!-- 更新数量 -->
    </div>
    <!-- ... -->
</a>
```

#### 5.3 (可选) 创建工具使用说明

如果工具较复杂,创建使用说明文档:

```bash
# 创建文档
touch seo-toolkit/docs/keyword-research-guide.md
```

**内容结构**:

```markdown
# 关键词研究工具 使用指南

## 工具简介
[工具的目的、核心功能]

## 使用步骤
1. 输入关键词
2. 点击"分析"
3. 查看结果

## 功能说明
### 搜索量分析
[详细说明]

### 难度评估
[详细说明]

## 常见问题
Q: 如何导出数据?
A: ...

## 更新日志
- v1.0.0 (2025-01-01): 初始版本
```

---

### 阶段 6: 提交与审查 (Submission & Review)

#### 6.1 代码自查

使用 [代码审查清单](#代码审查清单) 进行自查

#### 6.2 提交Git

参见 [Git提交规范](#git提交规范)

```bash
git add seo-toolkit/keyword-research.html
git add seo-toolkit/assets/css/keyword-research.css
git add seo-toolkit/index.html
git add index.html

git commit -m "feat(seo): 添加关键词研究工具

- 实现关键词输入和分析功能
- 支持搜索量、难度、CPC数据展示
- 响应式布局,支持打印导出
- 集成到SEO工作台主页"
```

#### 6.3 请求审查 (Code Review)

- 创建Pull Request
- 添加描述和截图
- 标记相关审查者
- 等待反馈并修改

---

## 📋 工具开发规范

### 文件命名规范

| 文件类型 | 命名规则 | 示例 |
|---------|---------|------|
| HTML文件 | kebab-case | `keyword-research.html` |
| CSS文件 | kebab-case | `keyword-research.css` |
| JS文件 | kebab-case | `keyword-research.js` |
| 图片文件 | kebab-case | `keyword-icon.png` |

### 目录结构规范

```
seo-toolkit/
├── index.html                        # 工作台主页
├── keyword-research.html             # 工具页面
├── competitor-analysis.html
├── assets/
│   ├── css/
│   │   ├── keyword-research.css      # 工具特定CSS
│   │   └── competitor-analysis.css
│   ├── js/
│   │   ├── keyword-research.js       # 工具特定JS
│   │   └── examples.js               # 示例数据 (可选)
│   └── images/                       # 工具特定图片 (可选)
│       └── icon.png
└── docs/                             # 工具文档 (可选)
    └── keyword-research-guide.md
```

### HTML结构规范

**标准结构**:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TOOL_NAME_CN}} ({{TOOL_NAME_EN}})</title>

    <!-- SEO Meta -->
    <meta name="description" content="...">
    <meta name="keywords" content="...">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <!-- ... -->

    <!-- Modiqi Design System (按顺序) -->
    <link rel="stylesheet" href="../shared/css/tokens.css">
    <link rel="stylesheet" href="../shared/css/base.css">
    <link rel="stylesheet" href="../shared/css/components.css">
    <link rel="stylesheet" href="../shared/css/canvas.css">

    <!-- Tool-specific styles -->
    <link rel="stylesheet" href="assets/css/{{TOOL_ID}}.css">
</head>
<body>
    <div class="desk-background"></div>

    <main class="paper-a3"> <!-- 或 paper-a4 / paper-a4 landscape -->
        <header class="canvas-header">...</header>

        <div class="tool-content">
            <!-- 工具内容 -->
        </div>
    </main>

    <script src="../shared/js/core.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            new ModiqiApp('{{TOOL_ID}}');
            lucide.createIcons();
        });
    </script>
</body>
</html>
```

**禁止事项**:
- ❌ 不要修改 `<head>` 中CSS的加载顺序
- ❌ 不要删除 `desk-background` div
- ❌ 不要省略 `ModiqiApp` 初始化
- ❌ 不要省略 `lucide.createIcons()`

---

## 🎨 CSS样式规范

### 使用设计令牌

**✅ 正确**:

```css
.my-card {
    background: var(--color-bg-white);
    color: var(--color-text-primary);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-base);
}
```

**❌ 错误**:

```css
.my-card {
    background: #ffffff;           /* 硬编码颜色 */
    color: #1a1a1a;               /* 硬编码颜色 */
    padding: 24px;                 /* 硬编码间距 */
    border-radius: 8px;            /* 硬编码圆角 */
    font-size: 14px;               /* 硬编码字号 */
}
```

### 命名空间

**使用工具特定的类名前缀,避免全局污染**:

```css
/* ✅ 正确: 使用命名空间 */
.keyword-research-layout { }
.keyword-research-input-section { }
.keyword-research-results { }

/* ❌ 错误: 太通用,可能冲突 */
.layout { }
.input { }
.results { }
```

### BEM命名法 (可选)

```css
/* Block */
.keyword-card { }

/* Element */
.keyword-card__title { }
.keyword-card__metrics { }

/* Modifier */
.keyword-card--highlighted { }
```

### 响应式

**移动优先,使用max-width**:

```css
/* 基础样式 (默认) */
.tool-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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

### 打印样式

**隐藏不需要打印的元素**:

```css
@media print {
    /* 隐藏工具栏 */
    .toolbar {
        display: none !important;
    }

    /* 隐藏输入区域 (可选) */
    .input-section {
        display: none;
    }

    /* 避免分页断裂 */
    .section {
        page-break-inside: avoid;
    }

    /* 移除阴影 */
    .card {
        box-shadow: none;
        border: 2px solid var(--color-border-strong);
    }
}
```

---

## 💻 JavaScript规范

### 代码组织

**使用IIFE避免全局污染**:

```javascript
(function() {
    'use strict';

    // 私有变量
    let state = {
        keywords: [],
        currentKeyword: null
    };

    // 私有函数
    function init() {
        setupEventListeners();
        loadSavedData();
    }

    function setupEventListeners() {
        document.getElementById('analyze-btn').addEventListener('click', analyzeKeyword);
    }

    // 公开API (如果需要)
    window.KeywordResearchTool = {
        analyze: analyzeKeyword,
        getResults: () => state.keywords
    };

    // 初始化
    document.addEventListener('DOMContentLoaded', init);

})();
```

### ES6+ 特性

**使用现代JavaScript**:

```javascript
// ✅ 使用 const/let
const apiKey = 'xxx';
let results = [];

// ✅ 使用箭头函数
const analyzeKeyword = (keyword) => {
    return fetchKeywordData(keyword)
        .then(data => displayResults(data))
        .catch(error => showError(error));
};

// ✅ 使用模板字符串
const html = `
    <div class="result">
        <h3>${keyword}</h3>
        <p>搜索量: ${searchVolume}</p>
    </div>
`;

// ✅ 使用解构
const { keyword, searchVolume, difficulty } = data;

// ✅ 使用async/await
async function analyzeKeyword(keyword) {
    try {
        const data = await fetchKeywordData(keyword);
        displayResults(data);
    } catch (error) {
        showError(error);
    }
}
```

### 错误处理

**始终处理错误**:

```javascript
// ✅ 正确
async function fetchData(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('获取数据失败:', error);
        showError('无法加载数据,请稍后重试');
        return null;
    }
}

// ❌ 错误: 未处理错误
async function fetchData(url) {
    const response = await fetch(url);
    return await response.json(); // 可能抛出错误
}
```

### 性能优化

**防抖 (Debounce)**:

```javascript
// 延迟执行,减少频繁调用
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 使用
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce((e) => {
    performSearch(e.target.value);
}, 500));
```

**节流 (Throttle)**:

```javascript
// 限制执行频率
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 使用
window.addEventListener('scroll', throttle(() => {
    checkScrollPosition();
}, 200));
```

---

## 🔄 设计系统更新流程

**⚠️ 重要**: 设计系统文件 (`shared/css/*`) 不应随意修改

### 何时需要更新设计系统?

**合理理由**:
- ✅ 多个工具都需要某个新组件 (如"标签云"组件)
- ✅ 发现设计令牌缺失 (如需要新的语义化颜色)
- ✅ 修复设计系统的Bug (如暗色主题对比度问题)
- ✅ 改进无障碍性 (如增强焦点样式)

**不合理理由**:
- ❌ 只有一个工具需要这个样式
- ❌ 想覆盖默认样式以适应特殊需求
- ❌ 不喜欢默认样式的某些细节

### 更新流程

**Step 1: 提交Issue**

在项目仓库提交Issue,说明:
- 需要添加/修改什么?
- 为什么需要? (使用场景)
- 有哪些替代方案?
- 影响范围 (会影响哪些现有工具?)

**Step 2: 团队讨论**

- 设计系统维护者review
- 团队成员投票
- 确定是否采纳

**Step 3: 实现**

如果批准,执行以下步骤:

```bash
# 1. 创建feature分支
git checkout -b feature/design-system-tag-cloud

# 2. 修改设计系统文件
# 编辑 shared/css/components.css
# 添加新组件样式

# 3. 更新版本号
# 编辑 shared/css/tokens.css 顶部的版本注释

# 4. 更新文档
# 编辑 docs/DESIGN_SYSTEM.md
# 添加新组件的使用说明

# 5. 更新Changelog
# 编辑 docs/CHANGELOG.md

# 6. 测试影响
# 在所有现有工具中测试,确保无破坏性变更

# 7. 提交
git commit -m "feat(design-system): 添加标签云组件

- 新增 .tag-cloud 组件
- 支持多种尺寸和颜色变体
- 更新文档和示例"

# 8. 创建Pull Request
```

**Step 4: Code Review**

- 至少2位团队成员审查
- 确保无破坏性变更
- 确保文档完整

**Step 5: 发布**

- 合并到main分支
- 更新设计系统版本号
- 通知所有开发者

---

## ✅ 代码审查清单

### HTML检查

- [ ] **引入顺序正确**: tokens → base → components → canvas → tool-specific
- [ ] **Meta标签完整**: title, description, keywords, Open Graph
- [ ] **语义化HTML**: 使用正确的标签 (header, main, section, etc.)
- [ ] **无障碍**: 所有交互元素可通过键盘访问
- [ ] **ARIA标签**: 图标按钮有aria-label
- [ ] **data-save-key**: 需要保存的字段有data-save-key
- [ ] **图标初始化**: 调用了lucide.createIcons()

### CSS检查

- [ ] **无硬编码**: 所有颜色/间距/字号使用设计令牌
- [ ] **命名空间**: 工具特定样式有命名空间前缀
- [ ] **响应式**: 在1024px-1920px宽度下正常显示
- [ ] **打印优化**: 有@media print样式
- [ ] **暗色主题**: 暗色主题下正常显示
- [ ] **无!important**: 除非覆盖第三方库,不使用!important
- [ ] **无重复代码**: 可复用的样式抽取为组件

### JavaScript检查

- [ ] **无全局污染**: 使用IIFE或模块化
- [ ] **ModiqiApp初始化**: 正确初始化ModiqiApp
- [ ] **错误处理**: 所有异步操作有try-catch
- [ ] **无console.log**: 移除调试代码
- [ ] **性能优化**: 使用debounce/throttle (如适用)
- [ ] **ES6+**: 使用现代JavaScript特性
- [ ] **注释清晰**: 复杂逻辑有注释说明

### 功能测试

- [ ] **自动保存**: 输入后刷新页面,数据保留
- [ ] **主题切换**: 三种主题正常切换
- [ ] **打印**: 打印预览正常
- [ ] **导出**: PDF/图片导出正常
- [ ] **撤销/重做**: Ctrl+Z / Ctrl+Shift+Z 正常

### 文档检查

- [ ] **集成到工作台**: 在toolkit/index.html有链接
- [ ] **更新主页**: index.html工具数量已更新
- [ ] **使用说明**: 复杂工具有使用文档 (可选)

---

## 📝 Git提交规范

### Commit Message格式

使用 **约定式提交 (Conventional Commits)**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type类型**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整 (不影响功能)
- `refactor`: 重构 (既不是新功能也不是Bug修复)
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具、辅助工具变动

**scope范围**:
- `seo`: SEO工作台
- `sem`: SEM工作台
- `strategy`: 战略工作台
- `analytics`: 数据分析工作台
- `design-system`: 设计系统
- `docs`: 文档

**示例**:

```bash
# 新功能
git commit -m "feat(seo): 添加关键词研究工具"

# Bug修复
git commit -m "fix(strategy): 修复SWOT分析保存Bug"

# 文档
git commit -m "docs(design-system): 更新组件使用说明"

# 样式调整
git commit -m "style(seo): 调整关键词卡片间距"

# 重构
git commit -m "refactor(core): 重构自动保存逻辑"

# 性能优化
git commit -m "perf(analytics): 优化图表渲染性能"
```

**完整示例** (包含body):

```bash
git commit -m "feat(seo): 添加关键词研究工具

- 实现关键词输入和分析功能
- 支持搜索量、难度、CPC数据展示
- 响应式布局,支持移动端
- 集成到SEO工作台主页

Closes #123"
```

### 分支管理

**主分支**:
- `main`: 生产环境代码
- `develop`: 开发环境代码 (可选)

**功能分支**:
```bash
# 创建功能分支
git checkout -b feature/seo-keyword-research

# 开发完成后合并到main
git checkout main
git merge feature/seo-keyword-research

# 删除功能分支
git branch -d feature/seo-keyword-research
```

**命名规范**:
- `feature/工作台-工具名`: 新功能
- `fix/问题描述`: Bug修复
- `refactor/模块名`: 重构
- `docs/文档类型`: 文档更新

**示例**:
- `feature/seo-keyword-research`
- `fix/swot-save-bug`
- `refactor/autosave-logic`
- `docs/design-system-update`

---

## 🧪 测试指南

### 浏览器测试矩阵

| 浏览器 | 版本 | 优先级 |
|--------|------|--------|
| Chrome | 最新版 | 🔴 必须 |
| Firefox | 最新版 | 🟡 推荐 |
| Safari | 最新版 | 🟡 推荐 |
| Edge | 最新版 | 🟢 可选 |

### 设备测试

| 设备类型 | 分辨率 | 测试重点 |
|---------|--------|---------|
| 桌面 (大屏) | 1920×1080+ | 布局、间距 |
| 桌面 (标准) | 1366×768 | 布局、响应式 |
| 笔记本 | 1280×720 | 布局、响应式 |

**测试方法**:
```javascript
// Chrome DevTools: Ctrl+Shift+M 切换设备模式
// 手动调整窗口大小
// 检查布局是否正常
```

### 功能测试用例

**自动保存测试**:
```
1. 打开工具
2. 在输入框输入"测试数据"
3. 等待500ms
4. 刷新页面
5. 验证: 输入框显示"测试数据"
```

**主题切换测试**:
```
1. 打开工具
2. 点击工具栏的主题切换按钮
3. 验证: 主题切换到白板模式
4. 再次点击
5. 验证: 主题切换到暗色模式
6. 再次点击
7. 验证: 主题切换回经典模式
```

**打印测试**:
```
1. 打开工具
2. 按Ctrl+P
3. 验证: 打印预览中工具栏隐藏
4. 验证: 内容居中,无多余空白
5. 验证: 文字清晰,对比度足够
```

### 性能测试

**使用Chrome DevTools Lighthouse**:

```bash
1. 打开工具页面
2. 打开DevTools (F12)
3. 切换到Lighthouse标签
4. 选择"性能"、"无障碍"、"最佳实践"、"SEO"
5. 点击"生成报告"
6. 目标:
   - 性能: > 90分
   - 无障碍: > 90分
   - 最佳实践: > 90分
   - SEO: > 90分
```

---

## ❓ 常见问题

### Q1: 如何在AI (Claude/GPT) 中使用这个指南?

**A**: AI可以按以下步骤辅助开发:

```
Step 1: AI读取模板文件
- shared/templates/tool-template-a3.html
- shared/templates/tool-template-a4.html
- shared/templates/tool-template-a4-landscape.html

Step 2: AI询问用户占位符值
- TOOL_NAME_CN, TOOL_NAME_EN, TOOL_ID, etc.

Step 3: AI执行全局替换
- 生成新的HTML文件

Step 4: AI创建对应的CSS文件
- 基于工具类型生成初始CSS

Step 5: AI更新工作台主页
- 添加工具卡片到toolkit/index.html

Step 6: AI提示用户测试
- 浏览器测试、功能测试、样式测试
```

### Q2: 模板中的示例代码需要全部删除吗?

**A**: 是的,模板中的示例代码仅用于演示,开发时应该:
1. 保留HTML结构 (head, main, canvas-header)
2. 删除 `.tool-content` 内的所有示例区块
3. 替换为实际工具内容

### Q3: 如何处理工具特定的设计令牌?

**A**: 在工具CSS文件中定义:

```css
/* keyword-research.css */
:root {
    --kr-primary: var(--color-brand-blue); /* 复用设计系统颜色 */
    --kr-highlight: #ffd700; /* 工具特定颜色 */
}

.keyword-card--highlighted {
    background: var(--kr-highlight);
}
```

### Q4: 可以修改shared/css/下的文件吗?

**A**: 通常不可以。只有在以下情况下才修改:
1. 发现设计系统Bug
2. 团队讨论后一致同意
3. 通过正式的设计系统更新流程

### Q5: 如何调试自动保存功能?

**A**: 使用浏览器DevTools:

```javascript
// Console中查看所有保存的数据
for (let key in localStorage) {
    if (key.startsWith('modiqi_')) {
        console.log(key, localStorage[key]);
    }
}

// 手动触发保存
window.modiqiApp.saveAllData();

// 清空数据
window.modiqiApp.clearAllData();
```

### Q6: 工具需要API调用,如何处理CORS?

**A**: 三种方案:
1. **后端代理**: 创建后端API代理 (推荐)
2. **JSONP**: 仅适用于支持JSONP的API
3. **CORS Anywhere**: 开发环境临时方案 (不推荐生产使用)

### Q7: 如何集成第三方图表库?

**A**: 延迟加载:

```javascript
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

// 使用
document.getElementById('show-chart-btn').addEventListener('click', async () => {
    await loadChartLibrary();
    renderChart();
});
```

### Q8: 工具可以使用外部字体吗?

**A**: 不建议。应该使用设计系统提供的字体:
- 标题: `var(--font-serif)` (Noto Serif SC)
- 正文: `var(--font-sans)` (Noto Sans SC)

### Q9: 如何实现工具间的数据共享?

**A**: 使用localStorage + 统一命名空间:

```javascript
// 工具A保存数据
localStorage.setItem('modiqi_shared_project_name', 'My Project');

// 工具B读取数据
const projectName = localStorage.getItem('modiqi_shared_project_name');
```

### Q10: 开发过程中遇到问题怎么办?

**A**:
1. 查阅 `docs/DESIGN_SYSTEM.md`
2. 参考现有工具代码 (`strategy-toolkit/swot-analysis.html`)
3. 查看设计系统文档页面 (如果有)
4. 在团队Slack/Discord提问
5. 提交Issue到GitHub仓库

---

## 📞 获取帮助

- **设计系统文档**: `/docs/DESIGN_SYSTEM.md`
- **示例工具**: `/strategy-toolkit/swot-analysis.html`
- **设计系统可视化文档**: `/shared/design-guide/index.html` (即将推出)
- **问题反馈**: [GitHub Issues]
- **团队沟通**: [Slack/Discord频道]

---

**文档维护者**: Modiqi Development Team
**最后更新**: 2025-01-01
**文档版本**: 1.0.0
