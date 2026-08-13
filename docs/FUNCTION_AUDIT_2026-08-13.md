# Marketing Toolbox 功能审计（2026-08-13）

> [CX] 审计对象：`/Users/feibisi-studio/Projects/modiqi-com/marketing-toolbox`

## 结论

**本地候选质量门禁：PASS。** 该结论只覆盖本报告列出的静态、语法、依赖与浏览器烟测，不代表生产部署，也不等同于 144 个工具的每条业务公式均已由领域样本验证。

## 发布面

- 文件系统共有 174 个 HTML。
- 当前发布检查覆盖 165 个 HTML：根入口、工作流、项目设置、2 个浏览器文档页、报告生成器、14 个当前模块入口和 144 个工具页面。
- 9 个文件不在发布面：2 个源模板、1 个内部设计指南和 6 个战略入口历史候选版本。
- `data/tools.json` 是 144 个工具的规范清单，其中 30 个标记为 core。
- `data/workflows.json` 用 6 条工作流恰好覆盖 30 个 core 工具，无重复和漏项。

## 已关闭问题

1. 项目目录改为英文 `marketing-toolbox`，已修正文档中的旧目录树和审计路径。
2. 修复销售入口、MD5、favicon、examples 动态加载等本地断链；165 个发布页面共 1,605 个本地引用通过检查。
3. Lucide、html2canvas、SortableJS 固定版本并复制到 `shared/vendor/`；全部 HTML 不再执行远程 CDN 脚本，Google Fonts 阻塞依赖已移除。
4. 强化导入文件限制与数据结构验证；恢复的富文本会移除脚本、危险嵌入、表单、SVG/MathML、事件属性和危险 URL。
5. 844 个发布面表单控件均具有 label、`aria-label` 或 `aria-labelledby`；静态按钮明确类型。
6. 61 个非原生点击目标补充键盘语义，共享运行时支持 Enter/Space；全局 `:focus-visible` 覆盖旧页面的 outline reset。
7. 删除模块入口的 4 个重复工具卡；42 个占位页脚链接改为真实文档、支持和许可证目标。
8. CSS lint 从 81 errors / 715 warnings 降到 0 errors / 715 warnings；禁用“所有圆角都报错”的错误规则，只阻止 `transition: all`。
9. 新增项目语境、工作流完成状态、工具栏项目入口和 6 条核心工作流，跨页面使用同一 localStorage 导出范围。
10. npm 依赖审计最初发现 7 个开发依赖问题，执行兼容升级后使用官方 registry 复核为 0 vulnerabilities。

## 自动验证证据

| 检查 | 结果 | 样本 |
|---|---|---|
| 工具清单 | PASS | 144 tools / 30 core |
| 工作流完整性 | PASS | 6 workflows / 30 unique core tools |
| 本地浏览器依赖 | PASS | 3 pinned assets |
| HTML 规范化 | PASS | 165 published pages |
| JavaScript 语法 | PASS | 206 standalone/inline samples |
| 静态页面审计 | PASS | 165 pages / 1,605 local references / 844 controls |
| CSS lint | PASS with debt | 0 errors / 715 warnings |
| Playwright | PASS | 153 tests；151 页面打开检查 + 2 个持久化/工作流场景 |
| npm audit | PASS | 0 known vulnerabilities，官方 npm registry |

## 保留债务与未验证边界

### Medium

- 715 个 Stylelint warning 仍表示旧 CSS 中存在硬编码颜色或未使用设计令牌；门禁阻止 error，但 warning 需要按 6 条工作流逐批下降。
- 大多数工具只完成“页面打开、无 pageerror、无本地 4xx”的运行时验证；计算公式、动态增删、导入导出、图片/PDF、打印分页需要按核心工具建立业务样本断言。
- 浏览器自动化只使用 Chromium；Safari、Firefox、移动端和辅助技术实测尚未执行。
- `shared/js/core.js` 仍是跨 144 个工具的单体共享运行时，后续修改应优先增加回归测试再拆分。

### Low / SKIP

- 3 个外部 Cravatar 图片 URL 未联网逐个验证；失败时只影响头像展示。
- 2 个模板和 6 个历史入口版本不属于发布面；若未来直接发布，必须先纳入清单与门禁。
- 项目当前不是 Git 仓库，因此提交历史泄密扫描和基于 commit 的发布追溯记为 SKIP。
- 未执行生产、VM、DNS、CDN 或权限变更。

## 建议的开发顺序

1. 用真实业务样本为 30 个核心工具补计算和输出断言。
2. 按工作流清理 715 个设计令牌 warning，并记录每批下降值。
3. 为核心工具增加事实/假设/来源/复核日期字段，让报告只引用有证据的结论。
4. 建立带版本的数据 schema 与迁移测试，再扩展跨工具字段。
5. 完成 Chromium + Safari 的打印、JSON、PNG、PDF 手动回归后再考虑部署。
6. 账户、云同步和多人协作应作为独立项目，在权限、留存和审计模型明确后评估。
