# Modiqi Marketing Toolbox

FeiCode：<https://feicode.com/Modiqi-com/marketing-toolbox>

Modiqi Marketing Toolbox 是莫蒂奇长期维护的独立营销项目工作台。它面向营销顾问、品牌团队和中小企业负责人，以 144 个浏览器工具、30 个核心工具和 6 条工作流支持从诊断、决策到项目交付的过程。

项目采用 local-first 静态 Web 架构：无需账户或服务端数据库，用户数据默认保存在当前浏览器，可由用户主动导出或打印。`modiqi.com` WordPress 主站负责内容、获客、品牌说明和服务转化，不是本工具箱的运行依赖；主站不可读取工具箱画布数据，工具箱也必须在主站不可用时独立运行。

> 当前仓库记录的是本地开发与质量验证事实，不代表网站已经部署、公开发布或完成商业验证。

## 产品结构

| 层级 | 当前范围 | 支持边界 |
|---|---:|---|
| 工作流 | 6 条 | 组织核心工具和项目进度 |
| 核心工具 | 30 个 | 按完成合同、业务样本和打印交付逐步深化 |
| 扩展工具库 | 114 个 | 可发现、可使用，但不默认获得与核心工具相同的支持承诺 |
| 项目交付 | 本地项目语境、JSON、打印/PDF、图片 | 用户控制导出和分享 |

产品定位与支持分层详见 [`docs/PRODUCT_VISION_AND_DEVELOPMENT_DIRECTION.md`](docs/PRODUCT_VISION_AND_DEVELOPMENT_DIRECTION.md) 和 [`docs/CORE_TOOL_STANDARD.md`](docs/CORE_TOOL_STANDARD.md)。

## 主要入口

- `index.html`：全部工具库
- `workflows.html`：6 条核心工作流与完成进度
- `project.html`：当前项目语境
- `navigator.html`：战略分层视图
- `docs/index.html`：应用内文档入口

## 本地开发

环境要求：Node.js、npm、Python 3，以及 Playwright 支持的 Chromium 运行环境。

```bash
npm ci
npm run vendor:write
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000/`。工作流通过 HTTP `fetch()` 读取 JSON，不支持直接以 `file://` 打开。

项目没有生产构建步骤；第三方浏览器脚本由固定版本的 npm 包同步至 `shared/vendor/`，页面不得在运行时从 CDN 加载脚本。

## 质量门禁

```bash
npm run test:quality
```

该命令校验工具清单、工作流、核心工具合同、项目数据 schema、固定版本依赖、HTML 规范化、JavaScript 语法、本地引用、控件语义、CSS、浏览器运行时和桌面/移动/打印布局。具体顺序与已知债务见 [`docs/QUALITY_GATES.md`](docs/QUALITY_GATES.md)。

`npm run check:release-readiness` 是更严格的核心工具发布门禁；它只有在 30 个核心工具全部达到 `release` 时才应通过，不属于当前日常开发门禁。

## 数据与安全边界

- 表单、项目语境、证据登记和工作流进度保存在当前站点的 `localStorage`。
- 导出的 JSON、图片和 PDF 可能包含业务资料，应由使用者按项目数据管理。
- 不得在工具、提交、日志、测试夹具或截图中保存密码、API 密钥、客户个人信息或生产导出。
- WordPress 主站与工具箱只允许通过公开、版本化的目录和链接契约协作，不共享登录态、业务数据库或本地画布存储。
- 主站候选入口由 [`data/marketing-catalog.json`](data/marketing-catalog.json) 生成；全部条目当前为规划状态，不构成已发布声明。模型见 [`docs/CONTENT_DATA_MODEL.md`](docs/CONTENT_DATA_MODEL.md)。
- 发现安全问题时不要公开披露利用细节，按 [`SECURITY.md`](SECURITY.md) 处理。

项目数据模型见 [`docs/PROJECT_DATA_MODEL.md`](docs/PROJECT_DATA_MODEL.md)，架构见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 目录

```text
marketing-toolbox/
├── data/                 # 工具、工作流和合同数据
├── docs/                 # 产品、架构、设计、质量和治理资料
├── reports/              # 可复核的机器审计结果和基线
├── scripts/              # 清单、依赖、HTML 和视觉审计脚本
├── shared/               # 共享 CSS、JS、模板和固定版本依赖
├── tests/                # 静态、语法、工作流和浏览器测试
├── *-toolkit/            # 各职能工具模块
├── index.html
├── workflows.html
├── project.html
└── navigator.html
```

## 协作与维护

- 贡献流程：[`CONTRIBUTING.md`](CONTRIBUTING.md)
- 仓库治理：[`docs/REPOSITORY_GOVERNANCE.md`](docs/REPOSITORY_GOVERNANCE.md)
- FeiCode 仓库运维：[`docs/FEICODE_REPOSITORY_OPERATIONS.md`](docs/FEICODE_REPOSITORY_OPERATIONS.md)
- 长期路线：[`docs/ROADMAP.md`](docs/ROADMAP.md)
- 长期项目章程：[`docs/LONG_TERM_PROJECT_CHARTER.md`](docs/LONG_TERM_PROJECT_CHARTER.md)
- 主站增长体系：[`docs/MODIQI_COM_GROWTH_AND_CONTENT_SYSTEM.md`](docs/MODIQI_COM_GROWTH_AND_CONTENT_SYSTEM.md)
- 发布检查：[`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)
- 版本变更：[`CHANGELOG.md`](CHANGELOG.md)

许可证见 [`LICENSE`](LICENSE)。
