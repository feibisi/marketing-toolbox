# 营销工具箱 — 项目执行规范

继承根目录 `../AGENTS.md`；本项目已有代码和独立验证门槛。

## 启动

- 先读 `../CLAUDE.md`、本目录 `CLAUDE.md`、`HANDOFF.md`、`docs/FUNCTION_AUDIT_2026-08-13.md` 和当前相关产品文档。
- 以 `data/tools.json`、`data/workflows.json`、`data/core-tool-contracts.json` 和生成的 readiness 数据为机器清单。

## 变更

- 不直接手改可生成清单；使用对应 `*:write` 命令后检查差异。
- 新工具不得在 30 个核心工具达到发布标准前扩大受支持发布面，除非用户单独批准。
- 保持本地优先、无登录、隐私和打印导向；引入远程脚本、网络提交或持久化变化需要专项评审。
- 不把其他五个业务产品的客户或业务数据塞进营销工具箱 localStorage。

## 验证

- 常规代码变更运行 `npm run test:quality`。
- 发布候选还需运行 `npm run check:release-readiness`；当前 30 个核心工具均未达到 release，不得绕过。
- 视觉、打印、Safari/Firefox/mobile 和辅助技术未实际测试时写 `SKIP`，不能由 Chromium 静态检查替代。
- CSS 基线警告必须记录数量；不能因基线存在而忽略新增警告。

## 发布边界

- 本地质量门槛 PASS 不等于正式发布。
- 部署、域名、公开站点和第三方资源变更需要独立授权及可回滚发布证据。

