# Changelog

## 2.4.0 - 2026-08-13

- [CX] Renamed the project directory to `marketing-toolbox`.
- Added canonical tool/workflow manifests, project context, workflow progress, local pinned browser dependencies, and fail-closed quality gates.
- Closed known runtime links, import sanitization, control-label, button-type, keyboard, focus, duplicate-entry, and placeholder-footer defects.
- `npm run test:quality` passes; 715 CSS design-token warnings remain tracked debt.

# Modiqi 设计系统变更日志

本文档记录Modiqi数字营销工作台的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [2.5.0] - 2026-01-02

### Added (新增)

#### 🔧 代码质量工具

- **Stylelint 配置** (`.stylelintrc.json`)
  - 自动检测硬编码颜色
  - 检测禁止的 CSS 属性
  - 支持设计令牌强制使用

- **package.json** - NPM 脚本支持
  - `npm run lint:css` - CSS 规范检查
  - `npm run check:colors` - 硬编码颜色检查
  - `npm run check:radius` - border-radius 检查

#### 📚 新增文档

- **常见错误速查表** (`docs/COMMON_MISTAKES.md`)
  - TOP 10 高频错误
  - 错误检测方法
  - 修复检查清单

- **术语表** (`docs/GLOSSARY.md`)
  - 布局术语标准化
  - 组件命名规范
  - 缩写说明

- **快速入门指南** (`docs/QUICKSTART.md`)
  - 5分钟上手教程
  - 核心规则速记
  - 常用设计令牌

#### 📝 设计决策

- **DEC-0003**: 画布选择规则
  - A3 为默认画布
  - 无 A4 横向选项
  - 仅简单表单用 A4

- **DEC-0004**: 样式例外规则
  - 启动器页面允许圆角和悬停动画
  - 圆形元素全局允许 `border-radius: 50%`
  - 功能性动画允许 `transition`

### Fixed (修复)

- **恢复 launcher.css 样式**
  - 工具卡片圆角 (`12px`) 和悬停动画
  - 版本标签胶囊圆角 (`99px`)
  - 圆形预览元素 (`50%`)
  - 按钮和链接过渡效果

- **批量恢复圆形元素** (16个文件)
  - `swot-analysis.css`: `.center-circle`
  - `value-proposition.css`: `.shape-circle`, `.circle-container::before`
  - `empathy-map.css`: `.center-head`, `.head-icon`
  - `user-persona.css`: `.persona-avatar`
  - `nudge-planner.css`: `.letter-circle`
  - `attribution-model.css`: `.tp-circle`, `.add-tp-btn`
  - `kol-evaluation.css`: `.kol-avatar`
  - `community-persona.css`: `.avatar-section`
  - `ai-persona-generator.css`: `.avatar-placeholder`
  - `ai-agent-card.css`: `.agent-avatar-wrapper`, `.agent-avatar`
  - `social-listening.css`: `.dot`, `.mention-avatar`
  - `subject-line-tester.css`: `.email-avatar`
  - `quality-score.css`: `.score-circle`
  - `ad-copy-architect.css`: `.fb-avatar`

- **更新 DESIGN_RULES.md**
  - 添加详细例外情况说明
  - 区分工具页面和启动器页面规则
  - 扩展圆形元素清单 (8类 → 完整列表)

---

## [2.4.0] - 2026-01-02

### Added (新增)

#### 📚 AI 辅助开发文档系统

- **设计规则速查表** (`docs/DESIGN_RULES.md`)
  - 15条核心必遵规则
  - 禁止清单快速入口
  - 情境触发器映射表
  - 参考范例指引
  - 设计令牌速查

- **设计决策记录** (`docs/DESIGN_DECISIONS.md`)
  - 标准化决策记录格式
  - 决策索引和状态流转
  - AI 代理操作指南

- **参考范例指南** (`docs/GOLDEN_EXAMPLES.md`)
  - 按画布类型分类
  - 按功能模式分类
  - 关键代码片段提取

- **设计模式目录** (`docs/DESIGN_PATTERNS.md`)
  - 6种布局模式
  - 4种交互模式
  - 2种组件变体
  - 模式选择决策树

#### 🤖 AI 工作流自动化

- **设计规则检查工作流** (`.agent/workflows/design-check.md`)
  - CSS/HTML 修改前自动触发
  - 提交前检查清单

- **创建新工具工作流** (`.agent/workflows/new-tool.md`)
  - 标准化创建流程
  - 模板选择指南

- **记录设计决策工作流** (`.agent/workflows/record-decision.md`)
  - 规范未覆盖情况处理
  - 决策记录标准流程

- **处理溢出问题工作流** (`.agent/workflows/handle-overflow.md`)
  - 5级溢出处理优先级
  - 诊断和解决步骤

### Changed (变更)

- 文档目录结构更新，新增5个文档文件
- 创建 `.agent/workflows/` 目录用于工作流定义

---

## [未发布] - TBD

### 计划中
- 设计系统可视化文档页面 (`shared/design-guide/index.html`)
- CLI脚手架工具 (自动化创建新工具)
- Stylelint配置 (CSS代码规范检查)
- SEO工作台核心工具 (关键词研究、竞品分析)
- SEM工作台核心工具 (广告活动构建、竞价策略)
- AI工作台核心工具 (Prompt模板库、内容助手)

---

## [2.0.0] - 2025-01-01

### Added (新增)

#### 📚 文档系统
- **设计系统使用指南** (`docs/DESIGN_SYSTEM.md`)
  - 13,000+字的完整指南
  - 涵盖颜色、字体、间距、组件、布局等所有方面
  - 包含代码示例、最佳实践、禁止事项
  - 提供FAQ和故障排除指南

- **工具开发贡献指南** (`docs/CONTRIBUTION_GUIDE.md`)
  - 10,000+字的开发流程文档
  - 从规划到提交的完整6阶段流程
  - 详细的代码规范和审查清单
  - Git提交规范和分支管理指南

- **变更日志** (`docs/CHANGELOG.md`)
  - 语义化版本管理
  - 详细记录每个版本的变更

#### 📝 工具模板
- **A3横向画布模板** (`shared/templates/tool-template-a3.html`)
  - 适用于复杂矩阵型工具 (SWOT、BMC等)
  - 包含详细的内联注释和使用说明
  - 占位符系统支持快速替换

- **A4纵向画布模板** (`shared/templates/tool-template-a4.html`)
  - 适用于简单表单、清单、线性流程
  - 紧凑的头部布局,节省垂直空间
  - 包含表单组件示例

- **A4横向画布模板** (`shared/templates/tool-template-a4-landscape.html`)
  - 适用于仪表盘、数据对比、时间线
  - 包含指标卡片布局示例
  - 适合宽屏数据展示

#### 🎨 设计系统增强
- **版本管理系统**
  - tokens.css顶部添加版本号和变更日志
  - 清晰的CHANGELOG格式
  - 使用指南嵌入到CSS注释中

- **文档目录结构**
  ```
  docs/
  ├── DESIGN_SYSTEM.md      # 设计系统使用指南
  ├── CONTRIBUTION_GUIDE.md # 贡献指南
  └── CHANGELOG.md          # 变更日志 (本文件)
  ```

- **模板目录结构**
  ```
  shared/templates/
  ├── tool-template-a3.html
  ├── tool-template-a4.html
  └── tool-template-a4-landscape.html
  ```

### Changed (变更)

#### 🔧 设计令牌优化
- 优化 `tokens.css` 顶部注释,增加使用指南
- 统一命名规范,提升令牌语义化程度
- 增加设计令牌的使用场景说明

#### 📖 文档完善
- 所有HTML模板添加详细的内联注释
- 模板注释包含AI工具调用指令
- 增加占位符替换说明

### Deprecated (弃用)
- 无

### Removed (移除)
- 无

### Fixed (修复)
- 无

### Security (安全)
- 无

---

## [1.0.0] - 2024-12-01

### Added (新增)

#### 🎨 设计系统核心
- **设计令牌系统** (`shared/css/tokens.css`)
  - 完整的颜色系统 (品牌色、背景色、文本色、边框色、状态色)
  - 语义化颜色 (SWOT专用、价值主张专用、品牌原型专用)
  - 焦点色系统
  - 字体系统 (字族、字重、字号、行高、字间距)
  - 间距系统 (基于8pt网格)
  - 布局令牌 (纸张尺寸、容器宽度、z-index)
  - 边框系统 (宽度、圆角、样式)
  - 阴影系统 (sm/md/lg/xl + 纸张阴影)
  - 过渡动画系统
  - 图标尺寸
  - 纸张纹理 (Noise Texture)

- **基础样式系统** (`shared/css/base.css`)
  - CSS Reset
  - 全局排版样式 (h1-h6, p, a, ul, ol)
  - 表单元素样式
  - Contenteditable样式
  - 选择文字样式
  - 滚动条样式 (WebKit)
  - 无障碍样式 (skip-link, sr-only, focus-visible)
  - 工具类 (display, flexbox, text, spacing, etc.)
  - 动画关键帧 (spin, fadeIn, fadeOut, slideUp)

- **组件库** (`shared/css/components.css`)
  - 按钮 (btn, btn-primary, btn-secondary, btn-ghost, btn-danger)
  - 输入框 (input, input-underline)
  - 徽章 (badge, badge-success/warning/error/info)
  - 卡片 (card, card-header, card-title, card-content)
  - 图标 (icon, icon-sm/md/lg/xl)
  - 分隔线 (divider, divider-dashed, divider-double)
  - 工具提示 (tooltip)
  - 加载指示器 (spinner, save-indicator)

- **画布布局系统** (`shared/css/canvas.css`)
  - 桌面背景 (desk-background)
  - A3横向画布 (paper-a3)
  - A4纵向画布 (paper-a4)
  - A4横向画布 (paper-a4 landscape)
  - 画布头部 (canvas-header)
  - 画布底部 (canvas-footer)
  - 纸张纹理叠加

- **启动器样式** (`shared/css/launcher.css`)
  - 主页/工作台启动器布局
  - 工具卡片样式
  - 网格布局

#### ⚙️ JavaScript核心库
- **ModiqiApp类** (`shared/js/core.js`)
  - 自动保存功能 (debounce 500ms)
  - 主题切换 (经典/白板/暗色)
  - 字体缩放 (85% / 100% / 115% / 130%)
  - 工具栏渲染
  - Meta字段自动填充
  - 品牌标识注入
  - 底部信息注入
  - 撤销/重做 (Ctrl+Z / Ctrl+Shift+Z)
  - 导出PDF (打印)
  - 导出图片 (html2canvas)

#### 🎯 战略工作台 (Strategy Workbench)
- 24个核心战略工具:
  - 客户旅程地图 (Customer Journey)
  - SWOT分析 (SWOT Analysis)
  - 商业模式画布 (Business Model Canvas)
  - 精益画布 (Lean Canvas)
  - 营销画布 (Marketing Canvas)
  - 用户画像 (User Persona)
  - 共情地图 (Empathy Map)
  - 价值主张画布 (Value Proposition)
  - 竞品分析 (Competitor Analysis)
  - 波特五力模型 (Porter's Five Forces)
  - 品牌棱镜 (Brand Prism)
  - 品牌原型 (Brand Archetypes)
  - STP画布 (Segmentation-Targeting-Positioning)
  - 营销组合4P (Marketing Mix 4P)
  - 内容日历 (Content Calendar)
  - OKR模板 (OKR Template)
  - 影响力-努力矩阵 (Impact-Effort Matrix)
  - 销售漏斗 (Sales Funnel)
  - 增长漏斗 (Growth Funnel)
  - KOL评估 (KOL Evaluation)
  - ROI计算器 (ROI Calculator)
  - CLV计算器 (Customer Lifetime Value Calculator)
  - 预算分配器 (Budget Allocator)
  - SEO规划器 (SEO Planner)
  - 社交媒体矩阵 (Social Media Matrix)

#### 📊 数据分析工作台 (Analytics Workbench)
- 5个核心分析工具:
  - KPI仪表盘 (KPI Dashboard)
  - 归因模型 (Attribution Model)
  - 群组分析 (Cohort Analysis)
  - 漏斗诊断 (Funnel Diagnosis)
  - A/B测试规划器 (A/B Test Planner)

#### 🎨 品牌工作台 (Brand Workbench)
- 5个品牌建设工具:
  - 品牌信息框架 (Brand Messaging Framework)
  - 品牌故事 (Brand Story)
  - 视觉识别 (Visual Identity)
  - 触点地图 (Touchpoint Map)

#### 📱 社交媒体工作台 (Social Workbench)
- 4个社交运营工具:
  - 社群画像 (Community Persona)
  - 内容创意矩阵 (Content Idea Matrix)
  - 互动策略 (Engagement Strategy)
  - 危机剧本 (Crisis Playbook)

#### 💼 销售工作台 (Sales Workbench)
- 5个销售支持工具:
  - 潜客评分 (Lead Scoring)
  - 报价计算器 (Quote Calculator)
  - 成交检查清单 (Closing Checklist)
  - 竞争战卡 (Competitive Battlecard)

#### 🎨 主题系统
- **经典主题** (默认)
  - 暖色调木桌背景 (#e3dad3)
  - 象牙白纸张 (#fdfbf7)
  - 纸张纹理叠加

- **白板主题** (body.theme-whiteboard)
  - 纯白背景 (#f0f2f5)
  - 适合投影演示

- **暗色主题** (body.theme-dark)
  - 深色背景 (#121212)
  - 深色纸张 (#1e1e1e)
  - 高对比度文字

- **打印优化**
  - 纯白背景
  - 高对比度边框和文字
  - 移除阴影和纹理

#### 🌐 主页系统
- **总主页** (`index.html`)
  - 9个工作台卡片展示
  - SVG图形预览
  - 工具数量徽章
  - 宽屏模式切换

- **工作台主页** (各toolkit/index.html)
  - 工具卡片网格
  - 工具预览图
  - 返回总主页链接

### Changed (变更)
- 无

### Deprecated (弃用)
- 无

### Removed (移除)
- 无

### Fixed (修复)
- 无

### Security (安全)
- 无

---

## 版本号说明

遵循 **语义化版本 2.0.0** (Semantic Versioning):

格式: `主版本号.次版本号.修订号` (MAJOR.MINOR.PATCH)

- **主版本号 (MAJOR)**: 不兼容的API变更
  - 例: 删除设计令牌、重大重构

- **次版本号 (MINOR)**: 向下兼容的功能新增
  - 例: 新增工具、新增组件、新增设计令牌

- **修订号 (PATCH)**: 向下兼容的问题修复
  - 例: Bug修复、样式微调、文档更新

---

## 变更类型说明

- **Added** (新增): 新功能、新组件、新工具
- **Changed** (变更): 现有功能的变更
- **Deprecated** (弃用): 即将删除的功能 (保留1个版本)
- **Removed** (移除): 已删除的功能
- **Fixed** (修复): Bug修复
- **Security** (安全): 安全问题修复

---

## 维护者

**Modiqi Design System Team**

- 负责设计系统维护和更新
- 审查设计系统相关的Pull Request
- 发布新版本和Changelog

---

## 贡献

如需贡献或报告问题:

1. 阅读 [贡献指南](CONTRIBUTION_GUIDE.md)
2. 查看 [设计系统文档](DESIGN_SYSTEM.md)
3. 提交Issue到GitHub仓库
4. 创建Pull Request

---

**最后更新**: 2025-01-01
**文档版本**: 1.0.0
