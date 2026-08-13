# 主站营销内容与工具目录数据模型

## 1. 边界

Marketing Toolbox 是独立应用，`modiqi.com` WordPress 主站是内容、获客和服务转化入口。两者不共享登录、客户数据、画布内容、`localStorage`、数据库或后台权限。

仓库只输出一份可公开的目录契约：[`data/marketing-catalog.json`](../data/marketing-catalog.json)。它描述工具与工作流如何被主站发现和链接，不表示对应 WordPress 页面已经发布。

## 2. 单一真源与生成关系

```text
data/tools.json ─────┐
                     ├─ scripts/sync_marketing_catalog.py
data/workflows.json ─┘              │
                                    └─ data/marketing-catalog.json
```

- 工具身份、路径和层级以 `data/tools.json` 为准。
- 工作流成员关系以 `data/workflows.json` 为准。
- 不直接手改生成文件；运行 `npm run marketing-catalog:write`。
- `npm run check:marketing-catalog` 检查生成漂移、数量、唯一性、文件存在性和边界字段。
- 结构规范见 [`data/marketing-catalog.schema.json`](../data/marketing-catalog.schema.json)。

## 3. 当前目录策略

| 对象 | 数量 | 主站内容级别 | 当前发布声明 |
|---|---:|---|---|
| 核心工具 | 30 | `authoritative`：完整资源页 | `planned` |
| 扩展工具 | 114 | `directory`：简明目录条目 | `planned` |
| 工作流 | 6 | 工作流中心页 | `planned` |

所有条目当前都是规划记录；工具箱运行域名仍为 `null`，直到存在经过验证的部署事实。主站候选路径采用 `/tools/{module}/{slug}/`，避免同名工具发生 URL 冲突。

## 4. WordPress 内容记录

主站实现时，建议每个资源记录至少具备以下字段。它们属于 WordPress 内容治理，不写入工具箱运行数据：

| 字段 | 用途 |
|---|---|
| `tool_id` / `workflow_id` | 与目录契约稳定关联 |
| `content_status` | `planned`、`draft`、`review`、`approved`、`published`、`retired` |
| `canonical_url` | 获批并发布后的规范地址 |
| `search_intent` | 用户问题和搜索意图，不等同于关键词堆叠 |
| `audience` | 适用角色、团队和业务阶段 |
| `problem` / `outcome` | 页面解决的问题与可交付结果 |
| `method_summary` | 方法来源、边界和不适用条件 |
| `tool_url` | 独立工具运行地址；发布前为空 |
| `workflow_ids` | 所属工作流，可多值 |
| `service_paths` | 相关服务页，可多值 |
| `evidence_refs` | 来源、案例或验证材料引用 |
| `owner` / `reviewer` | 内容责任人与领域复核人 |
| `reviewed_at` / `review_due_at` | 最近复核与下一复核时间 |
| `schema_type` | 页面使用的结构化数据类型 |
| `locale` | 语言与地区版本 |

## 5. 内容对象不是一对一复制

- 工具资源页回答“这个工具解决什么、何时使用、如何开始”。
- 文章回答具体问题、场景、案例或方法；一篇文章可以关联多个工具。
- 工作流页连接一组工具及其顺序、输入和产出。
- 服务落地页按客户目标和交付方案组织，不按每张画布机械生成。
- 扩展工具先保留目录条目，只有在搜索需求、使用数据或服务交付证明价值后才升级为完整资源页。

## 6. 版本与同步

1. 工具或工作流变更后先更新各自清单。
2. 运行 `npm run marketing-catalog:write` 并提交生成差异。
3. WordPress 同步程序只读取公开字段，并记录所用 `schema_version` 和仓库版本。
4. 主站发布状态不得反向覆盖工具箱清单；发布事实由 WordPress 自己记录。
5. 删除或改名工具时先保留旧 `tool_id` 与 URL 映射，完成重定向和引用审计后再退休。

## 7. 隐私与分析

目录契约不得包含用户填写内容、项目文件、个人信息、广告账户数据或密钥。跨站分析只传递页面、工具 ID、工作流 ID、来源渠道和同意状态等最小事件字段；不得把画布正文作为事件属性或 URL 参数。

建议的公共事件名为：

- `tool_resource_view`
- `tool_launch_click`
- `workflow_view`
- `workflow_start_click`
- `tool_complete`
- `export_complete`
- `service_cta_click`

事件必须附带版本化字典、同意策略、保存期限和数据负责人；在这些条件未建立前，只保留匿名、必要且可关闭的最小测量。
