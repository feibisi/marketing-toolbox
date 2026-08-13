# 📐 Modiqi 设计模式目录

> 本文档记录常见的布局模式、交互模式和组件组合模式。
> **版本**: 1.0.0 | **最后更新**: 2026-01-02

---

## 📋 模式索引

### 布局模式
- [矩阵布局 (2x2 / 3x3)](#矩阵布局)
- [卡片网格](#卡片网格)
- [表格密集型](#表格密集型)
- [时间线/阶段](#时间线阶段)
- [仪表盘](#仪表盘)
- [拖拽定位画布](#拖拽定位画布)

### 交互模式
- [focus-within 高亮](#focus-within-高亮)
- [可添加项目列表](#可添加项目列表)
- [实时计算](#实时计算)
- [拖拽排序](#拖拽排序)

### 组件变体
- [紧凑布局 (.compact)](#紧凑布局)
- [单色/彩色模式切换](#单色彩色模式切换)

---

## 🏗️ 布局模式

### 矩阵布局

**适用场景**: SWOT分析、BCG矩阵、影响力-努力矩阵

**结构**:
```html
<div class="matrix-grid">
    <div class="matrix-cell top-left">象限1</div>
    <div class="matrix-cell top-right">象限2</div>
    <div class="matrix-cell bottom-left">象限3</div>
    <div class="matrix-cell bottom-right">象限4</div>
</div>
```

**CSS**:
```css
.matrix-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--spacing-md);
}

.matrix-cell {
    background: var(--color-bg-paper);
    border: 1px solid var(--border-sem-outer);
    padding: var(--spacing-md);
}
```

**参考范例**: `strategy-toolkit/swot-analysis.html`

---

### 卡片网格

**适用场景**: KPI卡片、类型分析、功能对比

**标准布局**:
```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);  /* 或 3, 5 等 */
    gap: var(--spacing-md);
}

.grid-card {
    background: var(--color-bg-paper);
    border: 1px solid var(--border-sem-outer);
    padding: var(--spacing-md);
}
```

**紧凑变体**:
```css
.card-grid.compact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.card-grid.compact .grid-card {
    flex: 1;
    flex-direction: row;
    padding: var(--spacing-sm);
}
```

**参考范例**: `content-marketing-hub/content-performance.html`

---

### 表格密集型

**适用场景**: 数据排行、内容列表、竞品对比

**结构**:
```css
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: var(--color-bg-warm-medium);
}

.data-table th {
    padding: var(--spacing-sm);
    border-bottom: 2px solid var(--border-sem-inner);
    text-align: left;
    font-weight: var(--font-weight-semibold);
}

.data-table td {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border-sem-dashed);
}

/* 注意: 不使用 :hover 效果，使用 :focus-within */
.data-table tbody tr:focus-within {
    background: var(--color-focus-bg);
}
```

**参考范例**: `content-marketing-hub/content-performance.html`

---

### 时间线/阶段

**适用场景**: 客户旅程、销售漏斗、项目阶段

**水平时间线**:
```css
.timeline-container {
    display: flex;
    gap: var(--spacing-md);
}

.timeline-stage {
    flex: 1;
    border-right: 1px dashed var(--border-sem-dashed);
    padding-right: var(--spacing-md);
}

.timeline-stage:last-child {
    border-right: none;
}
```

**垂直时间线**:
```css
.timeline-vertical {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.timeline-item {
    position: relative;
    padding-left: var(--spacing-xl);
    border-left: 2px solid var(--border-sem-inner);
}
```

**参考范例**: `omnichannel-toolkit/customer-journey.html`

---

### 仪表盘

**适用场景**: KPI概览、数据摘要

**结构**:
```css
.dashboard-layout {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto 1fr;
    gap: var(--spacing-md);
}

.kpi-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-md);
}

.main-chart {
    grid-column: span 3;
}

.side-panel {
    grid-column: span 1;
}
```

**参考范例**: `analytics-toolkit/kpi-dashboard.html`

---

### 拖拽定位画布

**适用场景**: 竞争格局、感知图、定位矩阵

**结构**:
```html
<div class="positioning-canvas">
    <div class="axis-x"></div>
    <div class="axis-y"></div>
    <div class="draggable-item" style="left: 50%; top: 30%;">
        Item 1
    </div>
</div>
```

**CSS**:
```css
.positioning-canvas {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;  /* 或固定高度 */
    border: 1px solid var(--border-sem-outer);
}

.draggable-item {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: grab;
}

.draggable-item:active {
    cursor: grabbing;
}
```

**参考范例**: `competitive-intelligence/landscape-map.html`

---

## 🖱️ 交互模式

### focus-within 高亮

**标准实现**:
```css
/* 容器 focus-within 样式 */
.editable-container:focus-within {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: -2px;
    background: var(--color-focus-bg);
}

/* 内部编辑元素 focus 样式 */
.editable-container [contenteditable]:focus {
    outline: none;  /* 容器已有 outline */
}
```

**应用场景**:
- 卡片内含可编辑内容
- 表格单元格可编辑
- 气泡/标记可编辑

---

### 可添加项目列表

**HTML 结构**:
```html
<ul class="item-list" data-save-key="items">
    <li class="item" contenteditable="true">项目 1</li>
    <li class="item" contenteditable="true">项目 2</li>
</ul>
<button class="btn-add-item" onclick="addItem()">
    <i data-lucide="plus"></i> 添加项目
</button>
```

**CSS**:
```css
.item-list {
    list-style: none;
    padding: 0;
}

.item {
    padding: var(--spacing-sm);
    border-bottom: 1px dashed var(--border-sem-dashed);
}

.btn-add-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border: 1px dashed var(--border-sem-dashed);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
}
```

**JavaScript**:
```javascript
function addItem() {
    const list = document.querySelector('.item-list');
    const li = document.createElement('li');
    li.className = 'item';
    li.contentEditable = true;
    li.textContent = '新项目';
    list.appendChild(li);
    li.focus();
}
```

---

### 实时计算

**模式**:
```html
<input type="number" id="input1" value="100">
<input type="number" id="input2" value="20">
<div class="result" id="result">-</div>
```

```javascript
function calculate() {
    const a = parseFloat(document.getElementById('input1').value) || 0;
    const b = parseFloat(document.getElementById('input2').value) || 0;
    document.getElementById('result').textContent = (a * b).toFixed(2);
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculate);
});
```

---

### 拖拽排序

**适用场景**: 优先级排序、步骤重排、列表顺序调整

**HTML 结构**:
```html
<ul class="sortable-list" data-save-key="order">
    <li class="sortable-item" draggable="true">
        <span class="drag-handle">☰</span>
        项目 1
    </li>
    <li class="sortable-item" draggable="true">
        <span class="drag-handle">☰</span>
        项目 2
    </li>
</ul>
```

**CSS**:
```css
.sortable-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: 1px solid var(--border-sem-dashed);
    background: var(--color-bg-paper);
    cursor: grab;
}

.sortable-item:active {
    cursor: grabbing;
}

.sortable-item.dragging {
    opacity: 0.5;
}

.drag-handle {
    color: var(--color-text-tertiary);
}
```

**JavaScript 核心逻辑**:
```javascript
const list = document.querySelector('.sortable-list');

list.addEventListener('dragstart', (e) => {
    e.target.classList.add('dragging');
});

list.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
});

list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = list.querySelector('.dragging');
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement) {
        list.insertBefore(dragging, afterElement);
    } else {
        list.appendChild(dragging);
    }
});
```

---

## 🎨 组件变体

### 紧凑布局

**用途**: 当需要节省空间时，将垂直布局转换为水平布局

**触发方式**: 添加 `.compact` 类

```html
<div class="type-analysis compact">
    <!-- 内容 -->
</div>
```

**CSS 模式**:
```css
/* 标准布局 */
.component .card {
    flex-direction: column;
    padding: var(--spacing-md);
}

/* 紧凑布局 */
.component.compact .card {
    flex-direction: row;
    align-items: center;
    padding: var(--spacing-sm);
}
```

---

### 单色/彩色模式切换

**原则**: 默认单色，彩色仅在 `body.color-mode` 下启用

```css
/* 默认: 单色 */
.badge {
    background: var(--color-bg-subtle);
    color: var(--color-text-secondary);
}

/* 彩色模式 */
body.color-mode .badge.success {
    background: var(--color-semantic-strength);
}

body.color-mode .badge.warning {
    background: var(--color-semantic-threat);
}

body.color-mode .badge.danger {
    background: var(--color-semantic-weakness);
}
```

---

## 📊 模式选择决策树

```
需要展示什么类型的内容?
│
├─→ 对比/分类数据
│   ├─→ 2-4个类别 → 矩阵布局
│   └─→ 4-8个类别 → 卡片网格
│
├─→ 列表/详细数据
│   ├─→ 需要排序/筛选 → 表格
│   └─→ 只读展示 → 卡片网格或列表
│
├─→ 流程/阶段
│   ├─→ 水平空间充足 → 水平时间线
│   └─→ 垂直空间充足 → 垂直时间线
│
├─→ 位置/坐标关系
│   └─→ 拖拽定位画布
│
└─→ 综合数据概览
    └─→ 仪表盘布局
```

---

**维护者**: Modiqi Design System Team  
**关联文档**: [DESIGN_RULES.md](./DESIGN_RULES.md) | [GOLDEN_EXAMPLES.md](./GOLDEN_EXAMPLES.md)
