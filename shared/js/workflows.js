(() => {
    'use strict';
    const PROGRESS_KEY = 'modiqi_workflow_progress_v1';
    const grid = document.getElementById('workflowGrid');

    function readJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
        catch (error) { console.error(`Invalid local data: ${key}`, error); return fallback; }
    }

    async function render() {
        const [workflowResponse, toolResponse] = await Promise.all([fetch('data/workflows.json'), fetch('data/tools.json')]);
        if (!workflowResponse.ok || !toolResponse.ok) throw new Error('Workflow data could not be loaded');
        const workflows = await workflowResponse.json();
        const tools = await toolResponse.json();
        const toolMap = new Map(tools.tools.map(tool => [tool.path, tool]));
        const progress = readJSON(PROGRESS_KEY, {});
        const project = window.ModiqiProjectStore.load();
        document.getElementById('projectSummary').textContent = project.name ? `当前项目：${project.name}${project.brand ? ` · ${project.brand}` : ''}` : '尚未设置项目；完成状态仍会本地保存。';

        grid.replaceChildren(...workflows.workflows.map(workflow => {
            const card = document.createElement('article');
            card.className = 'workspace-card';
            const completed = workflow.tools.filter(path => progress[path]).length;
            const heading = document.createElement('h2');
            heading.textContent = workflow.title;
            const description = document.createElement('p');
            description.textContent = workflow.description;
            const meter = document.createElement('div');
            meter.className = 'workflow-progress';
            meter.setAttribute('aria-label', `已完成 ${completed}/${workflow.tools.length}`);
            meter.innerHTML = `<span style="width:${completed / workflow.tools.length * 100}%"></span>`;
            const list = document.createElement('ol');
            list.className = 'workflow-list';
            workflow.tools.forEach((path, index) => {
                const tool = toolMap.get(path);
                const item = document.createElement('li');
                item.className = `workflow-item${progress[path] ? ' done' : ''}`;
                const number = document.createElement('span');
                number.textContent = String(index + 1).padStart(2, '0');
                const link = document.createElement('a');
                link.href = path;
                link.textContent = tool ? tool.title : path;
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'workflow-toggle';
                toggle.setAttribute('aria-label', `${progress[path] ? '标记未完成' : '标记完成'}：${link.textContent}`);
                toggle.textContent = progress[path] ? '✓' : '○';
                toggle.addEventListener('click', () => {
                    progress[path] = !progress[path];
                    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
                    render().catch(showError);
                });
                item.append(number, link, toggle);
                list.appendChild(item);
            });
            card.append(heading, description, meter, list);
            return card;
        }));
        lucide.createIcons();
    }

    function showError(error) {
        console.error(error);
        grid.textContent = '工作流数据加载失败。请通过本地 HTTP 服务打开项目并刷新。';
    }

    render().catch(showError);
})();
