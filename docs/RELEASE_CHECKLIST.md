# Release Checklist

> [CX] 更新：2026-08-13

## 候选版本

- [ ] `data/tools.json` 已由 `npm run manifest:write` 更新并评审
- [ ] 新工具已明确标记 `core` 或 `library`，没有默认进入核心集
- [ ] `npm run vendor:write` 后没有未提交的依赖漂移
- [ ] `npm run test:quality` 退出码为 0
- [ ] Stylelint warning 数未超过已记录基线
- [ ] 6 条工作流、项目保存、JSON 导入导出、打印/PDF、图片导出完成手动抽样
- [ ] 至少用 Chromium 和 Safari 抽样核心工作流
- [ ] 不含密钥、客户敏感数据、测试导出文件和 Playwright 产物
- [ ] `docs/FUNCTION_AUDIT_2026-08-13.md` 或新日期审计已更新

## 发布前授权

- [ ] 已确认目标环境与负责人
- [ ] 已确认备份、版本号、回滚目录或上一版本
- [ ] 已获得部署授权
- [ ] DNS、证书、生产配置和权限变更另行审批
- [ ] 已按 `docs/FEICODE_REPOSITORY_OPERATIONS.md` 区分源码仓库、候选版本、FeiCode Release 和网站部署证据

## 发布后

- [ ] 实际发布产物与候选版本校验一致
- [ ] 根入口、工作流、项目页、一个核心工具和报告生成器返回 200
- [ ] 浏览器控制台无阻断错误
- [ ] 记录发布时间、版本、验证样本、失败项和回滚结果

未执行发布时只能写“本地候选通过”，不能写“已上线”。
