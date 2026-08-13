# Quality Gates

> [CX] 更新：2026-08-13

## 唯一入口

```bash
npm install
npm run test:quality
```

## 顺序与失败含义

| 命令 | 验证内容 | 失败时处理 |
|---|---|---|
| `npm run check:manifest` | 144 个工具页面和 30 个 core 标记与文件系统一致 | 修正页面或重新生成清单 |
| `npm run check:workflows` | 6 条工作流无重复且恰好覆盖 30 个 core 工具 | 修正 `data/workflows.json` |
| `npm run check:core` | 30 个核心工具、工作流映射、完成合同与 readiness 清单一致 | 修正 `data/core-tool-contracts.json` 后执行 `npm run core:write` |
| `npm run check:project-schema` | 项目 schema v2、v1 迁移与证据字段合同 | 修正 schema、store 或页面加载链 |
| `npm run check:marketing-catalog` | 144 个主站目录候选、30/114 内容分层、6 个工作流入口和公开数据边界 | 修正工具/工作流源清单后运行 `npm run marketing-catalog:write` |
| `npm run check:layout` | 重新测量 144 个工具的桌面/移动布局和 30 个核心打印布局，并逐项对比视觉债务基线 | 查看 `docs/VISUAL_LAYOUT_AUDIT_2026-08-13.md`；不得用隐藏 overflow 消除信号 |
| `npm run check:vendor` | 3 个浏览器库与锁定 npm 包字节一致，HTML 无远程脚本 | 执行 `npm run vendor:write` 后复核 |
| `npm run check:a11y-normalized` | 已发布 HTML 没有待应用的基线标签、按钮类型或点击语义变更 | 执行规范化写入并评审差异 |
| `npm run test:js` | 独立及内联 JavaScript 可被 Node 解析 | 修复语法错误 |
| `npm run test:static` | 本地引用、重复 ID、控件标签、按钮类型和入口重复链接 | 修复具体页面 |
| `npm run lint:css` | CSS 无阻断级规则错误 | 修复 error；warning 进入设计债务基线 |
| `npm run test:runtime` | 发布页面无 pageerror/本地 4xx，持久化和项目工作流可用 | 查看 Playwright error context |

单独的 `npm run check:release-readiness` 是预期失败的发布门禁：只有 30 个核心工具全部达到 `release` 时才通过，当前不包含在开发期 `test:quality` 中。

## 当前已知非阻断债务

Stylelint 仍报告 715 个设计令牌 warning，主要是旧工具中的硬编码颜色。warning 不等于已解决；新增或修改 CSS 不应增加该数字。应按核心工作流顺序逐页迁移到 `shared/css/tokens.css`，每批记录下降值。

## 边界

- `node --check` 只证明语法可解析，不证明业务计算正确。
- 页面打开烟测不覆盖每个按钮、打印版式、视觉对比度和真实业务数据。
- 本地门禁不证明生产部署、DNS、CDN、浏览器矩阵或外部链接可用。
