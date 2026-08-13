# Quickstart

> [CX] 版本：2.4.0；更新：2026-08-13

## 使用工具箱

```bash
cd /Users/feibisi-studio/Projects/modiqi-com/marketing-toolbox
npm install
npm run vendor:write
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000/`。先在 `project.html` 填写非敏感项目语境，再从 `workflows.html` 进入核心工具。数据保存在当前浏览器；清理站点数据前先从工具栏导出 JSON。

## 修改现有工具

1. 在 `data/tools.json` 确认页面等级与标题。
2. 复用 `shared/css/tokens.css`、`shared/css/base.css`、`shared/css/components.css` 和 `shared/js/core.js`。
3. 控件必须有可编程标签；普通按钮明确写 `type="button"`。
4. 非原生点击元素优先改成 `<button>` 或 `<a>`；无法改时补 `role="button"`、`tabindex="0"` 和键盘行为。
5. 保存字段使用稳定、唯一的 `data-save-key`。
6. 不从 CDN 加载可执行脚本；依赖通过固定版本 npm 包进入 `shared/vendor/`。
7. 运行 `npm run test:quality`。

## 新增工具

当前方向是先完善 30 个核心工具，不默认扩充工具数量。确需新增时：

```bash
cp shared/templates/tool-template-a3.html <module>-toolkit/<tool-name>.html
# 完成模板变量、样式、逻辑和入口链接
npm run manifest:write
npm run check:workflows
npm run test:quality
```

若工具尚未达到支持标准，在清单中保持 `library`/`legacy`，不得直接加入核心工作流。

## 关键文档

- `ARCHITECTURE.md`：页面、数据和共享运行时边界
- `QUALITY_GATES.md`：门禁及 PASS/FAIL 含义
- `RELEASE_CHECKLIST.md`：候选、授权、发布后验证
- `DESIGN_RULES.md`：设计规则
- `CONTRIBUTION_GUIDE.md`：贡献规范
