# FeiCode Repository Operations

> [CX] 更新：2026-08-13  
> 本文保存 Marketing Toolbox 的仓库身份、日常协作和可复核验收。在完整 `modiqi-com` 工作区中，组织级建仓、凭据轮换与故障判定以父目录 `../docs/operations/feicode-repository-runbook.md` 为真源；独立克隆本仓库时，以本文的项目级边界为准并向 FeiCode 组织 owner 升级组织级操作。

## 仓库身份

| 项目 | 值 |
| --- | --- |
| FeiCode URL | `https://feicode.com/Modiqi-com/marketing-toolbox` |
| `full_name` | `Modiqi-com/marketing-toolbox` |
| 可见性 | public |
| 默认分支 | `main` |
| 本地 remote | `ssh://git@feicode.com/Modiqi-com/marketing-toolbox.git` |
| 已验证 SSH principal | `wapuu` |
| 已验证仓库权限 | `owner` |

这些权限和平台字段是 2026-08-13 的证据快照；变更前必须实时复核。仓库发布不表示网站部署，也不表示 30 个核心工具达到 release readiness。

## 日常协作

1. 从 `main` 同步后创建短期分支；功能、修复和数据迁移通过合并请求评审。
2. push 前运行改动范围对应的测试；常规代码改动至少运行 `npm run test:quality`。
3. remote 必须保持为上表的无凭据 SSH URL。PAT 不用于 Git remote。
4. 不运行会显示请求头、URL rewrite 或环境秘密的 trace。`GIT_TRACE=0` 不是可靠关闭方式，必须取消设置 trace 变量。
5. 平台分支保护尚无本项目已验证记录；在真实 GET/API 证据前不得写“main 已保护”。即使平台暂未保护，也不应直接向 `main` 推送未评审功能。
6. `scripts/push_feicode_initial.sh` 仅保留为首次推送/灾难恢复门禁，不用于普通提交。

## 权限或访问失败

- `ssh -T` 成功只证明 SSH principal，不证明仓库存在或该 principal 可写。
- 匿名 API 404 与 `ls-remote` 失败需分别记录；不要把其中一个替代另一个。
- 建组织仓库需要组织 owner/admin 能力。普通 `write:repository` 或现有仓库写权限不自动获得建仓权限。
- 同一 PAT 已失败、已暴露或已撤销后停止重试；将唯一解除条件交给组织 owner 或 Linuxjoy FeiCode 运维任务。
- 凭据事故只记录：已撤销/已轮换、scope、凭据引用路径和证据引用位置。禁止复制 token。

## 验收矩阵

### 仓库存在但仍为空

- 匿名 API：HTTP 200，`full_name` 与可见性正确，`default_branch=main`，`empty=true`。
- SSH：principal 符合预期。
- Git：`ls-remote` 退出 0，ref count 为 0。
- 权限：成员、团队或仓库 permission API 证明具备首次推送权限。
- 没有 `main` SHA、branch/ref API 为 404 是空仓正常状态，不得伪造已推送证据。

### 仓库已有源码

```bash
test "$(git remote get-url origin)" = \
  'ssh://git@feicode.com/Modiqi-com/marketing-toolbox.git'
test "$(git branch --show-current)" = main
test -z "$(git status --porcelain)"
test "$(git rev-parse HEAD)" = \
  "$(GIT_CONFIG_GLOBAL=/dev/null git ls-remote origin refs/heads/main | awk '{print $1}')"
test "$(GIT_CONFIG_GLOBAL=/dev/null git ls-remote --symref origin HEAD | awk '/^ref:/ {print $2; exit}')" = \
  refs/heads/main
```

另用匿名 API 核验 HTTP 200、`full_name=Modiqi-com/marketing-toolbox`、`private=false`、`default_branch=main`、`empty=false`。API、SSH、Git SHA 和权限是四组独立证据，不互相替代。

## 已完成事故记录

- 一次本地 Git 诊断输出曾暴露旧 `wapuu` PAT；旧项已撤销，替换项已轮换。
- 轮换 scope：`read:organization,write:issue,write:repository,read:user`。
- 凭据只保留受控引用，不在本仓库记录值。
- 含凭据的全局 Git URL rewrite 已删除；本仓库 remote 为无凭据 SSH URL。

该记录用于防止重复事故，不表示未来所有操作都应使用相同 scope。新动作按最小权限重新判断。
