# Contributing to Modiqi Marketing Toolbox

本仓库接受围绕工具正确性、可访问性、工作流连续性、打印交付、数据迁移、测试和文档的贡献。新增工具数量不是默认优先级；应优先深化 30 个核心工具并减少已记录债务。

## 开始之前

1. 阅读 [`README.md`](README.md)、[`docs/PRODUCT_VISION_AND_DEVELOPMENT_DIRECTION.md`](docs/PRODUCT_VISION_AND_DEVELOPMENT_DIRECTION.md) 和 [`docs/CORE_TOOL_STANDARD.md`](docs/CORE_TOOL_STANDARD.md)。
2. 设计或页面改动同时阅读 [`docs/DESIGN_RULES.md`](docs/DESIGN_RULES.md) 和 [`docs/GOLDEN_EXAMPLES.md`](docs/GOLDEN_EXAMPLES.md)。
3. 数据或运行时改动同时阅读 [`docs/PROJECT_DATA_MODEL.md`](docs/PROJECT_DATA_MODEL.md) 和 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。
4. 确认提交不包含凭据、客户资料、生产导出、私人截图或未经授权的品牌素材。

## 本地环境

```bash
npm ci
npm run vendor:write
python3 -m http.server 8000 --bind 127.0.0.1
```

使用 `http://127.0.0.1:8000/` 访问。不要以 `file://` 结果作为功能验证证据。

## 分支和提交

- 从最新 `main` 创建短期分支：`feature/<topic>`、`fix/<topic>`、`docs/<topic>` 或 `chore/<topic>`。
- 一个提交只处理一个可复核目的；不要顺带格式化或回退无关文件。
- 提交标题建议使用 `feat:`、`fix:`、`docs:`、`test:`、`refactor:` 或 `chore:` 前缀。
- 不直接把候选功能、未经验证的数据迁移或生成物推入 `main`。

## 改动规则

### 修改现有工具

- 保持 `data/tools.json` 与文件系统一致；清单由脚本维护，不手工制造漂移。
- 核心工具必须遵守完成合同、工作流映射、readiness 和报告输出边界。
- 新增计算或评分必须给出公式、输入边界、空值行为和业务断言。
- 不得用隐藏 `overflow`、缩小不可读字体或删除内容来消除布局告警。
- 修改 CSS 不应增加已记录的设计令牌 warning 数。
- 保持键盘操作、可见焦点、标签关联和打印可读性。

### 新增工具

新工具必须先说明目标用户、业务问题、与现有工具的差异、输入来源、输出和完成标准。除非工作流与支持责任已获确认，否则默认进入扩展工具库，不进入 30 个核心工具集合。详细模板规范见 [`docs/CONTRIBUTION_GUIDE.md`](docs/CONTRIBUTION_GUIDE.md)。

### 修改数据契约

- schema 和存储键变更必须有版本号、向后读取或显式迁移路径。
- 不得把合成数据写成真实客户、收入、订单或成效样本。
- 改动工具 ID、路径或公开目录字段时，必须提供兼容或重定向计划；不能静默复用旧 ID 表达不同含义。

### 修改主站协作内容

`modiqi.com` WordPress 主站是营销入口，不是运行依赖。此仓库只维护公开目录/链接契约和内容计划，不在这里引入 WordPress 登录、数据库连接、客户数据或发布凭据。任何线上发布、DNS 或生产配置变更不属于普通代码贡献。

## 验证

提交前至少运行与改动直接相关的检查；合并前运行完整门禁：

```bash
npm run test:quality
```

在变更说明中记录命令、退出码、验证时间和样本范围。零真实样本时不能把业务正确性写成 `PASS`。以下情况应明确区分：

- 静态/自动化门禁通过；
- 浏览器或打印人工抽样通过；
- 真实业务样本通过；
- 未验证、`SKIP` 或被外部条件 `BLOCKED`。

发布候选还需执行 [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)。`npm run check:release-readiness` 预期只在全部核心工具达到发布标准时通过。

## 合并请求内容

合并请求应包含：

1. 问题与用户影响；
2. 改动范围和未改范围；
3. 数据、兼容性、打印、隐私或安全影响；
4. 验证命令、退出码和样本数；
5. 涉及视觉变化时的代表性桌面、移动和打印证据；
6. 回滚方式与仍存在的债务。

维护者按正确性、支持边界、数据迁移、可访问性、视觉/打印结果、测试和文档进行评审。平台上的批准、合并或标签都不等同于生产部署。

## 安全问题

不要在公开 issue 或合并请求中提交漏洞利用、凭据或私人数据。请遵循 [`SECURITY.md`](SECURITY.md)。
