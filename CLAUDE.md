# 营销工具箱 — 项目事实

## 项目概览

营销工具箱是静态、本地优先、可打印的营销工作台，项目路径为 `modiqi-com/marketing-toolbox`。

版本：`2.4.0`。技术形态为 HTML、CSS、JavaScript、Python 清单/审计脚本和 Playwright 测试；没有应用服务器或数据库。

## 当前产品面

- `data/tools.json`：144 个工具页面，其中 30 个核心工具。
- `data/workflows.json`：6 条工作流，覆盖 30 个不同核心工具。
- 项目上下文 schema v2，包含事实、假设、待核验和来源要求。
- 当前 readiness：30 个核心工具处于 `smoke`，0 个处于 `release`。

## 主要入口

- `index.html`：主入口。
- `navigator.html`：工具导航。
- `project.html`：项目上下文。
- `workflows.html`：工作流进度。
- `docs/PRODUCT_VISION_AND_DEVELOPMENT_DIRECTION.md`：产品方向。
- `docs/CORE_TOOL_STANDARD.md`：核心工具完成标准。
- `HANDOFF.md`：最近交接和验证结果。

## 命令

```bash
npm run test:quality
npm run check:release-readiness
npm run test:static
npm run test:runtime
npm run lint:css
```

## 已知状态

- 最近 `npm run test:quality` 记录为 PASS，154 个 Playwright 测试通过。
- 仍有 715 个 CSS design-token 基线警告。
- 业务公式断言、完整打印/导出交互、Safari、Firefox、移动端和真实辅助技术测试未完成。
- 30 个核心工具的 contract method 仍是待领域复核的草案占位。
- 本目录不是已确认的独立 Git 仓库，没有提交、分支或正式发布证据。

## 数据边界

- 浏览器本地存储用于项目上下文和工作流进度。
- 工具箱不承担跨飞、鹏追、鲨仓、橙黑或可追的业务系统职责。
- 工具箱质量门槛和其他五个产品的商业验证互不替代。

