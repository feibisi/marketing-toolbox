(() => {
    'use strict';

    const root = document.querySelector('[data-workflow-panel]');
    if (!root || !window.ModiqiProjectStore || !window.ModiqiWorkflowStore) return;

    const workflowId = root.dataset.workflowId;
    const toolPath = root.dataset.toolPath;
    const upstreamPath = root.dataset.upstreamPath || '';
    const downstreamPath = root.dataset.downstreamPath || '';
    const project = window.ModiqiProjectStore.load();

    function escape(value) {
        const node = document.createElement('span');
        node.textContent = value || '';
        return node.innerHTML;
    }

    function escapeAttribute(value) {
        return escape(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function snapshot() {
        return Object.fromEntries([...document.querySelectorAll('[data-save-key]')].map(element => {
            const key = element.dataset.saveKey;
            const value = element.matches('input, textarea, select') ? element.value : element.innerText;
            return [key, (value || '').trim().slice(0, 1000)];
        }));
    }

    function evidenceForTool() {
        return project.evidence.filter(item => item.toolPath === toolPath);
    }

    function renderEvidence() {
        const items = evidenceForTool();
        const list = root.querySelector('[data-evidence-list]');
        list.innerHTML = items.length ? items.map(item => `
            <label class="workflow-evidence-item">
                <input type="checkbox" name="evidenceIds" value="${escapeAttribute(item.id)}">
                <span><strong>${escape(item.kind)}</strong> ${escape(item.statement)}<small>${escape(item.source)} · ${escape(item.owner || '未指定负责人')} · ${escape(item.reviewDate || '未指定复核日期')}</small></span>
            </label>`).join('') : '<p class="workflow-empty">本工具还没有证据记录。</p>';
    }

    function renderUpstream() {
        const region = root.querySelector('[data-upstream]');
        if (!upstreamPath) {
            region.hidden = true;
            return;
        }
        const handoff = window.ModiqiWorkflowStore.get(project.id, workflowId, upstreamPath);
        const adoption = window.ModiqiWorkflowStore.getAdoption(project.id, workflowId, toolPath);
        region.innerHTML = handoff ? `
            <h3>上游交接候选</h3>
            <p><strong>来源：</strong>${escape(upstreamPath)}</p>
            <p>${escape(handoff.summary)}</p>
            <p class="workflow-risk"><strong>未解决风险：</strong>${escape(handoff.unresolvedRisk || '未记录')}</p>
            <label>采用说明<textarea name="adoptionNote" rows="3" maxlength="2000">${escape(adoption?.note || '')}</textarea></label>
            <button type="button" class="workflow-button" data-adopt>确认采用为当前工具背景</button>
            <p role="status" data-adoption-status></p>` : '<h3>上游交接候选</h3><p class="workflow-empty">上游工具尚未保存交接；不会自动覆盖当前画布。</p>';
        region.querySelector('[data-adopt]')?.addEventListener('click', () => {
            window.ModiqiWorkflowStore.saveAdoption({
                projectId: project.id,
                workflowId,
                targetTool: toolPath,
                sourceTool: upstreamPath,
                note: region.querySelector('[name="adoptionNote"]').value,
            });
            region.querySelector('[data-adoption-status]').textContent = '已记录采用决定；当前画布内容未被静默覆盖。';
        });
    }

    if (!project.name) {
        root.innerHTML = '<div class="workflow-panel-card"><h2>证据与工作流交接</h2><p>请先建立本地项目，才能按项目隔离证据与交接。</p><a class="workflow-button" href="../project.html">建立项目</a></div>';
        return;
    }

    root.innerHTML = `
        <div class="workflow-panel-card">
            <p class="workflow-kicker">Workflow evidence & handoff</p>
            <h2>证据与工作流交接</h2>
            <p>项目：<strong>${escape(project.name)}</strong>。数据只保存在当前浏览器；不要录入密钥或敏感个人信息。</p>
            <div class="workflow-upstream" data-upstream></div>
            <form data-evidence-form>
                <h3>为当前工具登记证据</h3>
                <label>关联字段<input name="fieldKey" maxlength="120" placeholder="例如：strengths、axis_x"></label>
                <label>陈述<textarea name="statement" rows="3" maxlength="500" required></textarea></label>
                <div class="workflow-form-grid">
                    <label>类型<select name="kind"><option value="fact">事实</option><option value="assumption">假设</option><option value="to_verify">待验证</option></select></label>
                    <label>状态<select name="status"><option value="draft">草稿</option><option value="needs_review">待复核</option><option value="confirmed">已确认</option><option value="rejected">已否定</option></select></label>
                    <label>负责人<input name="owner" maxlength="120" value="${escapeAttribute(project.owner)}"></label>
                    <label>复核日期<input name="reviewDate" type="date"></label>
                </div>
                <label>来源或来源缺失说明<input name="source" maxlength="500" required placeholder="报告名称和日期；或明确写团队假设及缺失原因"></label>
                <button class="workflow-button" type="submit">添加证据</button>
                <p role="status" data-evidence-status></p>
            </form>
            <form data-handoff-form novalidate>
                <h3>完成检查与交接</h3>
                <div data-evidence-list></div>
                <label>优先结论 / 交付摘要<textarea name="summary" rows="4" maxlength="2000" required></textarea></label>
                <label>未解决风险或待验证项<textarea name="unresolvedRisk" rows="3" maxlength="1000"></textarea></label>
                <div class="workflow-form-grid"><label>负责人<input name="owner" maxlength="120" value="${escapeAttribute(project.owner)}" required></label><label>复核日期<input name="reviewDate" type="date" required></label></div>
                <button class="workflow-button" type="submit">检查并保存交接</button>
                <p role="status" data-handoff-status></p>
            </form>
        </div>`;

    const existing = window.ModiqiWorkflowStore.get(project.id, workflowId, toolPath);
    const handoffForm = root.querySelector('[data-handoff-form]');
    if (existing) {
        handoffForm.elements.summary.value = existing.summary;
        handoffForm.elements.unresolvedRisk.value = existing.unresolvedRisk;
        handoffForm.elements.owner.value = existing.owner;
        handoffForm.elements.reviewDate.value = existing.reviewDate;
    }

    root.querySelector('[data-evidence-form]').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const values = Object.fromEntries(new FormData(form));
        try {
            window.ModiqiProjectStore.addEvidence({ ...values, toolPath });
            project.evidence = window.ModiqiProjectStore.load().evidence;
            form.reset();
            form.elements.owner.value = project.owner;
            root.querySelector('[data-evidence-status]').textContent = '证据已登记。';
            renderEvidence();
        } catch (error) {
            root.querySelector('[data-evidence-status]').textContent = error.message;
        }
    });

    handoffForm.addEventListener('submit', event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(handoffForm));
        const evidenceIds = new FormData(handoffForm).getAll('evidenceIds');
        const issues = [];
        if (!values.summary.trim()) issues.push('需要填写优先结论。');
        if (!values.owner.trim() || !values.reviewDate) issues.push('需要负责人和复核日期。');
        if (!evidenceIds.length) issues.push('至少关联一条当前工具证据。');
        const selected = project.evidence.filter(item => evidenceIds.includes(item.id));
        if (selected.some(item => !item.source || !item.owner || !item.reviewDate)) issues.push('关联证据缺少来源、负责人或复核日期。');
        const pageSnapshot = snapshot();
        const methodIssues = window.ModiqiWorkflow01Rules?.validateHandoff({
            toolPath,
            snapshot: pageSnapshot,
            evidence: selected,
            summary: values.summary,
        }) || [];
        issues.push(...methodIssues.map(item => item.message));
        const status = root.querySelector('[data-handoff-status]');
        if (issues.length) {
            status.textContent = `未完成：${issues.join(' ')}`;
            return;
        }
        window.ModiqiWorkflowStore.save({
            projectId: project.id,
            workflowId,
            sourceTool: toolPath,
            targetTool: downstreamPath,
            summary: values.summary,
            unresolvedRisk: values.unresolvedRisk,
            owner: values.owner,
            reviewDate: values.reviewDate,
            evidenceIds,
            snapshot: pageSnapshot,
            status: 'ready',
        });
        status.textContent = downstreamPath ? `交接已保存，可由下一工具确认采用：${downstreamPath}` : '工作流最终交付已保存。';
    });

    renderEvidence();
    if (existing) existing.evidenceIds.forEach(id => {
        const input = [...handoffForm.querySelectorAll('[name="evidenceIds"]')].find(item => item.value === id);
        if (input) input.checked = true;
    });
    renderUpstream();
})();
