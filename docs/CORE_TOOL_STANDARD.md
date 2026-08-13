# Core Tool Completion Standard

> [CX] 版本：1；日期：2026-08-13

## Purpose

“core” 表示正式支持面，不只是首页推荐。页面打开、能填写或有漂亮画布都不足以成为完成证据。

## Required contract

每个核心工具必须在 `data/core-tool-contracts.json` 中声明：

- `business_question`：它解决的唯一主要问题；
- `non_applicable_when`：不适用或容易误用的情况；
- `required_inputs`：开始前必须具备的输入；
- `method`：计算、分类、排序或判断方法；
- `deliverable`：可评审的输出；
- `completion_rule`：确定性的完成条件；
- `evidence_requirement`：事实、假设、待验证项和来源要求；
- `upstream` / `downstream`：工作流数据关系；
- `validation_level`：当前验证深度。

## Validation levels

| Level | Meaning |
|---|---|
| `smoke` | 页面可打开、资源和共享运行时正常 |
| `contract` | 业务问题、输入、方法、输出和完成条件已书面化 |
| `fixture` | 至少一个有效样本和一个边界样本具有确定预期 |
| `reviewed` | 领域负责人复核方法、文案和样本 |
| `release` | 浏览器、打印、导入导出、证据链和报告映射均有验收证据 |

等级只能逐级提升，不能用静态检查替代领域复核。

## UI and data requirements

1. 所有可编辑字段具有稳定键、标签和清晰单位。
2. 推导结果展示公式、口径或判断理由。
3. 关键结论必须标记为事实、假设或待验证项。
4. 证据记录至少包含陈述、来源或来源缺失说明、负责人、复核日期和状态。
5. 上游数据只能在用户确认后写入下游，不静默覆盖已有内容。
6. 重置默认只影响当前工具；项目级清除必须单独确认。
7. JSON 导入必须验证 schema 版本、大小、键和值类型。
8. 打印和报告不得隐藏来源、状态或复核日期。

## Test requirements

- 每个核心工具至少一个正常样本和一个零值、空值、极值或非法输入样本。
- 公式类工具对输入、舍入、分母为零和输出单位做断言。
- 分类/画布类工具对完成条件、证据状态和输出映射做断言。
- Playwright 验证持久化、刷新、重置、导入导出和键盘路径。
- CSS warning 总数不得高于 715；修改过的核心页面不得新增硬编码颜色。

## Machine-readable inventory

`scripts/sync_core_readiness.py` 根据工具清单、工作流和核心合同生成 `data/core-readiness.json`。普通检查验证文件没有漂移；`--require-release` 只在 30 个工具全部达到 `release` 时通过。
