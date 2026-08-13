(() => {
    'use strict';

    const form = document.getElementById('projectForm');
    const status = document.getElementById('projectStatus');
    const evidenceForm = document.getElementById('evidenceForm');
    const evidenceStatus = document.getElementById('evidenceStatus');
    const evidenceList = document.getElementById('evidenceList');
    const store = window.ModiqiProjectStore;
    const kindLabels = { fact: '事实', assumption: '假设', to_verify: '待验证' };
    const statusLabels = { draft: '草稿', confirmed: '已确认', rejected: '已否定', needs_review: '待复核' };

    function fillProject(project) {
        for (const [key, value] of Object.entries(project)) {
            const field = form.elements.namedItem(key);
            if (field && typeof value === 'string') field.value = value;
        }
    }

    function meta(label, value, className = '') {
        const span = document.createElement('span');
        if (className) span.className = className;
        span.textContent = `${label}：${value || '未填写'}`;
        return span;
    }

    function renderEvidence(project = store.load()) {
        evidenceList.replaceChildren();
        if (!project.evidence.length) {
            const empty = document.createElement('p');
            empty.className = 'evidence-empty';
            empty.textContent = '尚无证据记录。先保存项目，再添加第一条事实、假设或待验证项。';
            evidenceList.appendChild(empty);
            return;
        }
        project.evidence.slice().reverse().forEach(item => {
            const article = document.createElement('article');
            article.className = 'evidence-item';
            const content = document.createElement('div');
            const statement = document.createElement('p');
            statement.textContent = item.statement;
            const details = document.createElement('div');
            details.className = 'evidence-meta';
            details.append(
                meta('类型', kindLabels[item.kind], 'evidence-kind'),
                meta('状态', statusLabels[item.status]),
                meta('来源', item.source),
                meta('负责人', item.owner),
                meta('复核', item.reviewDate)
            );
            content.append(statement, details);
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'evidence-remove';
            remove.setAttribute('aria-label', `删除记录：${item.statement}`);
            remove.textContent = '删除';
            remove.addEventListener('click', () => {
                renderEvidence(store.removeEvidence(item.id));
                evidenceStatus.textContent = '记录已删除。';
            });
            article.append(content, remove);
            evidenceList.appendChild(article);
        });
    }

    function load() {
        try {
            const project = store.load();
            fillProject(project);
            renderEvidence(project);
        } catch (error) {
            console.error('Invalid saved project context', error);
            status.textContent = '已有项目数据无法读取，请重新填写。';
        }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        try {
            const existing = store.load();
            const fields = Object.fromEntries(new FormData(form).entries());
            const project = store.save({ ...existing, ...fields });
            renderEvidence(project);
            status.textContent = '项目已保存在当前浏览器。';
        } catch (error) {
            status.textContent = error.message;
        }
    });

    evidenceForm.addEventListener('submit', event => {
        event.preventDefault();
        try {
            const evidence = Object.fromEntries(new FormData(evidenceForm).entries());
            const project = store.addEvidence(evidence);
            evidenceForm.reset();
            renderEvidence(project);
            evidenceStatus.textContent = '记录已添加到当前项目。';
        } catch (error) {
            evidenceStatus.textContent = error.message;
        }
    });

    load();
    lucide.createIcons();
})();
