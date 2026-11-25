# Server (P3 在线服务后端预留目录)

本目录将在 P3 阶段落地 Python 3.12+ / FastAPI + SQLAlchemy 2.0 + Alembic 后端，提供：
- 多租户 `workspace_id` 隔离与本地 Dev Auth / `DeerLogin` OIDC 抽象
- 三层企业营销数据图谱持久化（本地 SQLite / 生产 PostgreSQL 16）
- 乐观锁云端同步、历史版本快照与只读分享短链
- 服务端 Playwright 高清 PDF 渲染
- `cli/`（`mtb-cli` 内部 Agent 协同 CLI，强制写入 `assumption` 护栏）
- `ai`（池化推理网关代理 + `usage_ledger` 成本台账）
