# Marketing Toolbox v3 — 莫蒂奇数字营销工作台

莫蒂奇数字技术（苏州）有限公司（`co-modiqi`）核心在线产品与咨询交付工作台。

## 目录结构

- `methodology-kb/`：方法论知识库与业务实体静态真源（YAML/JSON），供前端、后端与内部 Agent 共同消费
- `web/`：前端应用（React 19 + Vite + TypeScript + Zod + Vitest）
- `server/`：在线服务后端（P3 阶段落地：FastAPI + SQLAlchemy + Alembic + `mtb-cli`）
- `docs/`：产品与架构说明

> 旧版 144 页静态 HTML 参考快照完整保留在远端分支 `archive/v2-restored-reference`。

## 本地开发（P0 前端工作台）

```bash
cd web
npm install
npm run dev
```

## 验证命令

```bash
cd web
npm run typecheck
npm run test
npm run build
```
