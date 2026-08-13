---
description: 处理溢出问题 - 当页面内容超出画布时使用
---

# 处理溢出问题工作流

此工作流在页面内容超出画布边界时触发。

## 触发条件

当发现以下情况时触发：
- 页面出现滚动条（不应该有）
- 内容被截断
- 用户报告"内容超出页面"
- JavaScript 检测到 `scrollHeight > offsetHeight`

## 诊断步骤

### 1. 测量溢出量

在浏览器中执行 JavaScript：

```javascript
(() => {
  const paper = document.querySelector('.paper-a3, .paper-a4');
  const overflow = paper.scrollHeight - paper.offsetHeight;
  console.log({
    paperHeight: paper.offsetHeight,
    scrollHeight: paper.scrollHeight,
    overflow: overflow,
    overflowPercent: (overflow / paper.offsetHeight * 100).toFixed(1) + '%'
  });
})()
```

### 2. 定位溢出来源

检查各模块高度：

```javascript
(() => {
  const modules = document.querySelectorAll('[class*="grid"], [class*="container"], section');
  modules.forEach(m => {
    console.log(m.className, m.offsetHeight + 'px');
  });
})()
```

## 处理策略优先级

按以下优先级选择处理策略：

| 优先级 | 策略 | 适用条件 | 节省空间 |
|--------|------|---------|---------|
| **P1** | 压缩间距 | 溢出 <50px | 10-30px |
| **P2** | 字号降级 | 文本密集区域 | 20-50px |
| **P2.5** | 布局模式切换 | 结构可转换 | 50-150px |
| **P3** | 隐藏次要信息 | 有明确次要内容 | 50-100px |
| **P4** | 画布升级 | 最后手段 | 全部 |

### 策略详解

#### P1: 压缩间距

```css
/* 将 margin/padding 从 --spacing-lg 降级到 --spacing-md */
.module { margin-bottom: var(--spacing-md); }  /* 原: --spacing-lg */

/* 将 gap 从 --spacing-md 降级到 --spacing-sm */
.grid { gap: var(--spacing-sm); }  /* 原: --spacing-md */
```

#### P2: 字号降级

```css
/* 将标题从 base 降级到 sm */
.section-title { font-size: var(--font-size-sm); }  /* 原: base */
```

#### P2.5: 布局模式切换

```css
/* 垂直卡片 → 水平行 */
.card-grid.compact {
    display: flex;
    flex-direction: row;
}

.card-grid.compact .card {
    flex-direction: row;
    align-items: center;
}
```

#### P3: 隐藏次要信息

```css
/* 使用 @media print 或 .compact 类隐藏 */
.compact .secondary-info { display: none; }
```

#### P4: 画布升级

```html
<!-- 从 A4 升级到 A3 -->
<div class="paper-a3">  <!-- 原: paper-a4 -->
```

## 执行步骤

### 1. 阅读设计规则
// turbo
```
view_file docs/DESIGN_RULES.md
```

### 2. 根据溢出量选择策略

| 溢出量 | 推荐策略 |
|--------|---------|
| 1-30px | P1 压缩间距 |
| 30-50px | P1 + P2 |
| 50-100px | P2.5 布局切换 |
| 100-200px | P2.5 + P3 |
| >200px | P4 画布升级 |

### 3. 实施修改

按选定策略修改 CSS。

### 4. 验证结果

再次执行诊断 JavaScript，确认：
- `overflow` 为 0 或负数
- 页面视觉效果正常
- 内容可读性未严重下降

### 5. 记录决策（如使用新策略）

如果使用了规范中未记录的策略，执行 `/record-decision` 工作流。

## 常见溢出模式及解决方案

| 溢出模式 | 典型原因 | 推荐解决 |
|---------|---------|---------|
| 表格行太多 | 数据过多 | 分页或限制显示行数 |
| 卡片网格太高 | 卡片垂直堆叠 | 切换水平布局 (.compact) |
| 头部太大 | 标题+描述过长 | 压缩头部间距 |
| 模块间距过大 | 间距令牌选择不当 | 降级间距令牌 |

## 注意事项

- 优先使用低优先级策略，保留设计完整性
- 布局切换前先检查 `.compact` 变体是否已存在
- 画布升级是**最后手段**，需要用户确认
- 所有修改必须通过设计规则检查

## 完成确认

工作流完成后：
1. 使用 browser_subagent 截图验证最终效果
2. 执行诊断 JavaScript 确认溢出已解决
3. 向用户报告：
   - 原始溢出量
   - 使用的策略
   - 最终溢出量（应为0或负数）
