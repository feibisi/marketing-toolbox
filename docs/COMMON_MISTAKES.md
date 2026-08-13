# 🚫 Modiqi 常见错误速查表

> 本文档记录 AI 代理和开发者常犯的设计错误及其修正方法。
> **版本**: 1.0.0 | **最后更新**: 2026-01-02

---

## ⚠️ 高频错误 TOP 10

### 1. ❌ 使用 border-radius

**错误代码**:
```css
.card {
    border-radius: 8px;
}
```

**正确代码**:
```css
.card {
    /* 不设置 border-radius，默认为 0 */
}
```

**例外**: 启动器页面 (`index.html`) 的工具卡片可使用 `--radius-sm`

---

### 2. ❌ 硬编码颜色值

**错误代码**:
```css
.text {
    color: #1a1a1a;
    background: #ffffff;
}
```

**正确代码**:
```css
.text {
    color: var(--color-text-primary);
    background: var(--color-bg-paper);
}
```

---

### 3. ❌ 使用 :hover 动画

**错误代码**:
```css
.card:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
}
```

**正确代码**:
```css
.card:focus-within {
    outline: 2px solid var(--color-focus-ring);
    background: var(--color-focus-bg);
}
```

---

### 4. ❌ 给卡片添加阴影

**错误代码**:
```css
.card {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

**正确代码**:
```css
.card {
    border: 1px solid var(--border-sem-outer);
    /* 只有 .paper-* 可以有阴影 */
}
```

---

### 5. ❌ 使用 transition 动画

**错误代码**:
```css
.button {
    transition: all 0.3s ease;
}
```

**正确代码**:
```css
.button {
    /* 无 transition，状态变化即时生效 */
}
```

---

### 6. ❌ 硬编码间距值

**错误代码**:
```css
.section {
    padding: 24px;
    margin-bottom: 16px;
}
```

**正确代码**:
```css
.section {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
}
```

---

### 7. ❌ 选择错误的画布类型

**错误**: 横向内容使用 A4
```html
<div class="paper-a4 landscape">  <!-- 不存在 -->
```

**正确**: 横向内容一律使用 A3
```html
<div class="paper-a3">
```

---

### 8. ❌ 图标使用品牌色

**错误代码**:
```css
.icon {
    color: var(--color-brand-blue);
}
```

**正确代码**:
```css
/* 默认：单色 */
.icon {
    color: var(--color-text-secondary);
}

/* 彩色模式下才允许 */
body.color-mode .icon {
    color: var(--color-brand-blue);
}
```

---

### 9. ❌ 忘记添加 data-save-key

**错误代码**:
```html
<div contenteditable="true">可编辑内容</div>
```

**正确代码**:
```html
<div contenteditable="true" data-save-key="field_name">可编辑内容</div>
```

---

### 10. ❌ CSS 加载顺序错误

**错误顺序**:
```html
<link rel="stylesheet" href="my-tool.css">
<link rel="stylesheet" href="../shared/css/tokens.css">
```

**正确顺序**:
```html
<link rel="stylesheet" href="../shared/css/tokens.css">
<link rel="stylesheet" href="../shared/css/base.css">
<link rel="stylesheet" href="../shared/css/components.css">
<link rel="stylesheet" href="../shared/css/canvas.css">
<link rel="stylesheet" href="assets/css/my-tool.css">
```

---

## 🔍 错误检测方法

### 1. 使用 Stylelint

```bash
# 安装依赖
npm install -D stylelint stylelint-config-standard stylelint-declaration-strict-value

# 检查单个文件
npx stylelint "**/*.css"

# 检查并修复
npx stylelint "**/*.css" --fix
```

### 2. 浏览器 DevTools 检查

```javascript
// 检查是否有硬编码颜色
document.querySelectorAll('*').forEach(el => {
    const style = getComputedStyle(el);
    if (style.color && !style.color.includes('var(')) {
        console.log('硬编码颜色:', el, style.color);
    }
});
```

### 3. 搜索禁止模式

```bash
# 搜索 border-radius
grep -r "border-radius" --include="*.css" .

# 搜索 transition
grep -r "transition:" --include="*.css" .

# 搜索硬编码颜色
grep -rE "#[0-9a-fA-F]{3,6}" --include="*.css" .
```

---

## 📋 修复检查清单

在完成任何 CSS 修改后，验证：

```markdown
- [ ] 无 border-radius（除启动器外）
- [ ] 无硬编码颜色 (#xxx)
- [ ] 无 :hover 动画
- [ ] 无 box-shadow（除 .paper-* 外）
- [ ] 无 transition
- [ ] 无硬编码间距 (px)
- [ ] 图标使用 --color-text-secondary
- [ ] 可编辑元素有 data-save-key
- [ ] CSS 按正确顺序加载
- [ ] 画布类型正确（默认 A3）
```

---

## 📝 如何添加新错误

当发现新的常见错误时：

1. 添加到本文件对应分类
2. 提供错误代码和正确代码
3. 说明例外情况（如有）
4. 如果是严重问题，更新 `DESIGN_RULES.md`

---

**维护者**: Modiqi Design System Team  
**关联文档**: [DESIGN_RULES.md](./DESIGN_RULES.md) | [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md)
