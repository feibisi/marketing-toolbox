# 🌟 Modiqi 参考范例指南 (Golden Examples)

> 本文档列出经过审核的"黄金标准"工具，作为新工具开发的参考模板。
> **版本**: 1.0.0 | **最后更新**: 2026-01-02

---

## 📋 范例索引

### 按画布类型

| 画布类型 | 参考工具 | 文件路径 |
|---------|---------|---------:|
| **A3 横向 (默认)** | SWOT 分析 | `strategy-toolkit/swot-analysis.html` |
| **A3 横向** | KPI 仪表盘 | `analytics-toolkit/kpi-dashboard.html` |
| **A4 纵向** | 邮件主题测试器 | `email-toolkit/subject-line-tester.html` |

> **注**: 横向内容一律使用 A3，没有 A4 横向选项。

### 按功能模式

| 功能模式 | 参考工具 | 学习重点 |
|---------|---------|---------|
| **矩阵布局** | SWOT分析 | 2x2网格、象限样式 |
| **表格密集型** | 内容效果分析 | 表格样式、紧凑布局 |
| **卡片网格** | RFM分析 | 卡片间距、Badge |
| **拖拽交互** | 竞争格局图 | 绝对定位、拖拽API |
| **时间线** | 客户旅程地图 | 阶段容器、流程指示 |
| **计算器** | ROI计算器 | 输入验证、实时计算 |
| **可视化图表** | 漏斗诊断 | Chart.js集成 |

> **路径说明**: 客户旅程地图在 `omnichannel-toolkit/customer-journey.html`，ROI计算器在 `analytics-toolkit/roi-calculator.html`

---

## 🎯 推荐参考范例详情

### 1. SWOT 分析 (矩阵布局标杆)

**路径**: `strategy-toolkit/swot-analysis.html`

**学习重点**:
- A3画布标准结构
- 2x2矩阵网格布局
- 语义化颜色应用 (color-mode)
- 可添加项目的交互模式
- focus-within 样式实现

**关键代码片段**:
```css
/* 矩阵网格 */
.swot-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

/* 语义色（仅color-mode下） */
body.color-mode .swot-card.area-s {
    background: var(--color-semantic-strength);
}
```

---

### 2. 内容效果分析 (表格密集型标杆)

**路径**: `content-marketing-hub/content-performance.html`

**学习重点**:
- 表格样式标准
- 紧凑布局变体 (`.compact`)
- 溢出处理策略
- KPI 卡片网格
- Badge 使用规范

**关键代码片段**:
```css
/* 表格样式 */
.performance-table th {
    padding: var(--spacing-sm);
    background: var(--color-bg-warm-medium);
    border-bottom: 2px solid var(--border-sem-inner);
}

/* 紧凑布局变体 */
.type-analysis.compact .type-card {
    flex-direction: row;
    align-items: center;
}
```

---

### 3. 竞争格局图 (拖拽交互标杆)

**路径**: `competitive-intelligence/landscape-map.html`

**学习重点**:
- 坐标轴可视化
- 拖拽定位实现
- 气泡/标记样式
- 绝对定位容器
- focus-within 高亮

**关键代码片段**:
```css
/* 可拖拽气泡 */
.competitor-bubble {
    position: absolute;
    cursor: grab;
}

.competitor-bubble:focus-within {
    outline: 2px solid var(--color-focus-ring);
    background: var(--color-focus-bg);
}
```

---

### 4. RFM 分析 (卡片网格标杆)

**路径**: `analytics-toolkit/rfm-analysis.html`

**学习重点**:
- 卡片网格布局
- Badge 颜色规范
- 评分/等级显示
- 数据输入验证

**关键代码片段**:
```css
/* 卡片网格 */
.rfm-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
}

/* 等级Badge */
.segment-badge {
    background: var(--color-bg-subtle);
    border: 1px solid var(--border-sem-inner);
}
```

---

### 5. 客户旅程地图 (时间线标杆)

**路径**: `omnichannel-toolkit/customer-journey.html`

**学习重点**:
- 水平阶段容器
- 阶段间连接线
- 触点条目样式
- 情绪曲线(可选)

**关键代码片段**:
```css
/* 阶段容器 */
.journey-stages {
    display: flex;
    gap: var(--spacing-md);
}

.journey-stage {
    flex: 1;
    border-right: 1px dashed var(--border-sem-dashed);
}
```

---

## 🔍 如何使用参考范例

### 场景1: 创建新工具

1. **确定画布类型** → 选择对应模板
2. **确定功能模式** → 查看功能模式表
3. **打开参考工具** → 复制结构骨架
4. **按需调整** → 参考关键代码片段

### 场景2: 解决特定问题

```
遇到表格样式问题？
    → 打开 content-performance.css
    → 搜索 .performance-table

遇到拖拽定位问题？
    → 打开 landscape-map.js
    → 搜索 drag 相关函数
```

### 场景3: 实现新交互模式

1. 检查是否有类似范例
2. 如有 → 参考实现
3. 如无 → 询问用户确认方案 → 实现后记录到 `DESIGN_DECISIONS.md`

---

## ✅ 范例审核标准

一个工具要成为"黄金范例"，必须满足：

- [ ] 通过 `DESIGN_RULES.md` 所有检查项
- [ ] 无控制台错误/警告
- [ ] 响应式布局正确
- [ ] 打印输出正常
- [ ] 用户已确认审核通过

---

## 📥 如何添加新范例

当发现一个工具成为某个模式的最佳实践时：

1. **确认工具通过所有审核**
2. **添加到本文件对应分类**
3. **提取关键代码片段**
4. **说明学习重点**

---

**维护者**: Modiqi Design System Team  
**关联文档**: [DESIGN_RULES.md](./DESIGN_RULES.md) | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
