/**
 * Sales Script Builder Logic
 * Handles dynamic addition, reordering, and deletion of script modules.
 */

const MODULE_TEMPLATES = {
    intro: {
        type: 'type-intro',
        icon: 'mic',
        label: '开场白 (Opening)',
        content: `
            <p><strong>(Greet):</strong> Hi [Name], this is [My Name] from Modiqi.</p>
            <p><strong>(Hook):</strong> Reason for calling...</p>
        `
    },
    qualify: {
        type: 'type-qualify',
        icon: 'check-circle-2',
        label: '资格确认 (Qualifying)',
        content: `
            <ul class="checklist-content">
                <li><input type="checkbox"> <span contenteditable="true">Question 1?</span></li>
                <li><input type="checkbox"> <span contenteditable="true">Question 2?</span></li>
            </ul>
        `
    },
    value: {
        type: 'type-value',
        icon: 'zap',
        label: '价值主张 (Value Prop)',
        content: `
            <p>Key Benefit statement here.</p>
            <ul>
                <li>Benefit 1</li>
                <li>Benefit 2</li>
            </ul>
        `
    },
    objection: {
        type: 'type-objection',
        icon: 'shield-alert',
        label: '异议处理 (Objection)',
        content: `
            <div class="objection-grid">
                <div class="objection-trigger">
                    <span class="objection-label">If they say:</span>
                    <p contenteditable="true">"Too Expensive"</p>
                </div>
                <div class="objection-response">
                    <span class="objection-label">You say:</span>
                    <p contenteditable="true">"I understand. Let's look at the ROI..."</p>
                </div>
            </div>
        `
    },
    closing: {
        type: 'type-closing',
        icon: 'log-out',
        label: '缔结 (Closing)',
        content: `
            <p><strong>(Ask):</strong> Call to Action...</p>
        `
    }
};

const SCENARIOS = {
    cold_call: [
        { type: 'intro', label: '开场白', content: '<p><strong>(Greet):</strong> 您好，[姓名]，我是莫蒂奇咨询的[我的名字]。</p><p><strong>(Hook):</strong> 我关注到贵司近期在[某个业务领域]的动作，想跟您交流下我们在类似场景下的数字化增效方案。</p>' },
        { type: 'qualify', label: '资格确认', content: '<ul class="checklist-content"><li><input type="checkbox"> <span>目前是否有使用数字化工具？</span></li><li><input type="checkbox"> <span>团队规模是否超过 50 人？</span></li></ul>' },
        { type: 'value', label: '价值主张', content: '<p>我们帮助企业节省 30% 以上的沟通成本。具体包括：</p><ul><li>实时看板同步进度</li><li>AI 自动撰写日报</li></ul>' },
        { type: 'closing', label: '缔结', content: '<p>如果您感兴趣，下周二下午 2 点左右我们简单演示下？</p>' }
    ],
    objection: [
        { type: 'intro', label: '同理心切入', content: '<p>完全理解您的顾虑，很多我们的客户在开始前也提到过[预算/难度]的问题。</p>' },
        { type: 'objection', label: '异议处理', content: '<div class="objection-grid"><div class="objection-trigger"><span class="objection-label">客户说:</span><p>“预算已经超支了”</p></div><div class="objection-response"><span class="objection-label">您说:</span><p>“正因为预算有限，更需要我们的工具来减少隐形浪费。我们可以分阶段实施...”</p></div></div>' },
        { type: 'value', label: 'ROI 证明', content: '<p>通常在使用 3 个月后，由于效率提升带来的收益就能完全覆盖购买成本。</p>' }
    ],
    closing: [
        { type: 'value', label: '最后成交包', content: '<p>针对本周签约的客户，我们额外提供 1 对 1 的顾问交付服务。</p>' },
        { type: 'closing', label: '确认执行', content: '<p>既然方案已经达成共识，我们今天就把流程走完？</p>' }
    ]
};

function loadScenario(key) {
    if (!confirm('加载预设将清空当前话术内容，确定吗？')) return;

    const container = document.getElementById('scriptFlow');
    container.innerHTML = '';

    const scenario = SCENARIOS[key];
    if (!scenario) return;

    scenario.forEach(item => {
        const template = MODULE_TEMPLATES[item.type];
        const div = document.createElement('section');
        div.className = `script-module ${template.type}`;
        div.innerHTML = `
            <div class="module-header">
                <div class="module-label"><i data-lucide="${template.icon}"></i> ${item.label || template.label}</div>
                <div class="module-actions no-print">
                    <button class="btn-icon" onclick="moveModuleUp(this)"><i data-lucide="arrow-up"></i></button>
                    <button class="btn-icon" onclick="moveModuleDown(this)"><i data-lucide="arrow-down"></i></button>
                    <button class="btn-icon btn-delete" onclick="deleteModule(this)"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <div class="module-content" contenteditable="true">
                ${item.content}
            </div>
        `;
        container.appendChild(div);
    });

    lucide.createIcons();
    if (window.modiqiApp) window.modiqiApp.saveAllItems();
}


function showAddMenu() {
    const menu = document.getElementById('addMenu');
    menu.classList.toggle('hidden');
}

function addModule(typeKey) {
    const container = document.getElementById('scriptFlow');
    const template = MODULE_TEMPLATES[typeKey];

    if (!template) return;

    const div = document.createElement('section');
    div.className = `script-module ${template.type}`;
    div.innerHTML = `
        <div class="module-header">
            <div class="module-label"><i data-lucide="${template.icon}"></i> ${template.label}</div>
            <div class="module-actions no-print">
                <button class="btn-icon" onclick="moveModuleUp(this)"><i data-lucide="arrow-up"></i></button>
                <button class="btn-icon" onclick="moveModuleDown(this)"><i data-lucide="arrow-down"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteModule(this)"><i data-lucide="trash-2"></i></button>
            </div>
        </div>
        <div class="module-content" contenteditable="true">
            ${template.content}
        </div>
    `;

    container.appendChild(div);
    lucide.createIcons({ root: div });

    // Hide menu
    document.getElementById('addMenu').classList.add('hidden');

    // Auto-scroll logic if needed
    div.scrollIntoView({ behavior: 'smooth' });
}

function deleteModule(btn) {
    if (confirm('Delete this module?')) {
        const module = btn.closest('.script-module');
        module.remove();
    }
}

function moveModuleUp(btn) {
    const module = btn.closest('.script-module');
    const prev = module.previousElementSibling;
    if (prev) {
        module.parentNode.insertBefore(module, prev);
    }
}

function moveModuleDown(btn) {
    const module = btn.closest('.script-module');
    const next = module.nextElementSibling;
    if (next) {
        module.parentNode.insertBefore(next, module);
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('addMenu');
    const btn = e.target.closest('.btn-primary'); // The Add button

    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && !btn) {
        menu.classList.add('hidden');
    }
});

/* =========================================
   Simulation Logic (Teleprompter)
   ========================================= */
let simModules = [];
let currentSimIndex = 0;

function startSimulation() {
    const modules = document.querySelectorAll('.script-module');
    if (modules.length === 0) {
        alert('脚本为空，请先添加模块。\nScript is empty.');
        return;
    }

    // Capture current state
    simModules = Array.from(modules).map(m => {
        // Extract plain text label (remove icon text if needed, but innerText is usually fine)
        let label = m.querySelector('.module-label').innerText.trim();
        let content = m.querySelector('.module-content').innerHTML;
        
        return {
            label: label,
            content: content
        };
    });

    currentSimIndex = 0;
    const overlay = document.getElementById('simulationOverlay');
    overlay.classList.remove('hidden');
    
    // Trigger animation
    requestAnimationFrame(() => {
        renderSimSlide();
    });
    
    // Key listeners
    document.addEventListener('keydown', handleSimKeys);
}

function endSimulation() {
    const overlay = document.getElementById('simulationOverlay');
    overlay.classList.add('hidden');
    document.removeEventListener('keydown', handleSimKeys);
}

function renderSimSlide() {
    if (currentSimIndex < 0) currentSimIndex = 0;
    if (currentSimIndex >= simModules.length) currentSimIndex = simModules.length - 1;

    const mod = simModules[currentSimIndex];
    if (!mod) return;

    const labelEl = document.getElementById('simLabel');
    const contentEl = document.getElementById('simContent');
    const container = contentEl.closest('.sim-card');

    // Fade out
    container.classList.remove('active');

    setTimeout(() => {
        labelEl.innerText = mod.label;
        // Strip contenteditable to prevent interaction in sim mode
        contentEl.innerHTML = mod.content.replace(/contenteditable="true"/g, '').replace(/contenteditable/g, '');
        
        // Update meta
        document.getElementById('simCounter').innerText = `${currentSimIndex + 1} / ${simModules.length}`;
        const pct = ((currentSimIndex) / (simModules.length - 1 || 1)) * 100; // 0 to 100 based on steps
        document.getElementById('simProgress').style.width = `${Math.max(5, pct)}%`;

        // Fade in
        container.classList.add('active');
    }, 150); // Small delay for transition
}

function nextSlide() {
    if (currentSimIndex < simModules.length - 1) {
        currentSimIndex++;
        renderSimSlide();
    }
}

function prevSlide() {
    if (currentSimIndex > 0) {
        currentSimIndex--;
        renderSimSlide();
    }
}

function handleSimKeys(e) {
    const overlay = document.getElementById('simulationOverlay');
    if (overlay.classList.contains('hidden')) return;

    switch(e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            prevSlide();
            break;
        case 'Escape':
            endSimulation();
            break;
    }
}

/* =========================================
   Data Interoperability
   ========================================= */

function importPersonaRisks() {
    // 1. Check Strategic Clipboard
    // The core.js app instance isn't globally exposed as 'app', but we can access localStorage directly 
    // or through window.modiqiApp if available.
    
    // We'll read raw from localStorage for simplicity or use the helper if we can find it.
    // 'modiqi_strategic_clipboard' is the key.
    
    const clipboardRaw = localStorage.getItem('modiqi_strategic_clipboard');
    if (!clipboardRaw) {
        alert('战略剪贴板为空。请先去 [用户画像卡] 或 [SWOT分析] 生成数据。\nClipboard is empty.');
        return;
    }

    const clipboard = JSON.parse(clipboardRaw);
    
    // We look for 'customer_pains' (from Persona) or 'swot_weaknesses'/'swot_threats' (from SWOT)
    const pains = clipboard.customer_pains || clipboard.swot_threats || clipboard.swot_weaknesses;
    
    if (!pains) {
        alert('未找到痛点或威胁数据。\nNo pains/threats found in clipboard.');
        return;
    }

    // 2. Format as modules
    // Pains are usually HTML <ul><li>...</li></ul> strings.
    // We want to create an "Objection Handling" module for each detected item, or one big one.
    
    // Let's create one "Imported Objections" module
    const container = document.getElementById('scriptFlow');
    
    const div = document.createElement('section');
    div.className = 'script-module type-objection';
    div.innerHTML = `
        <div class="module-header">
            <div class="module-label"><i data-lucide="shield-alert"></i> 导入的痛点/异议 (Imported Risks)</div>
            <div class="module-actions no-print">
                 <button class="btn-icon" onclick="moveModuleUp(this)"><i data-lucide="arrow-up"></i></button>
                 <button class="btn-icon" onclick="moveModuleDown(this)"><i data-lucide="arrow-down"></i></button>
                 <button class="btn-icon btn-delete" onclick="deleteModule(this)"><i data-lucide="trash-2"></i></button>
            </div>
        </div>
        <div class="module-content">
            <p><strong>针对用户画像中的痛点进行预埋：</strong></p>
            <div class="objection-grid">
               <div class="objection-trigger">
                   <span class="objection-label">潜在痛点 (Pain Point)</span>
                   ${pains}
               </div>
               <div class="objection-response" contenteditable="true">
                   <span class="objection-label">应对策略 (Response Script)</span>
                   <p>I understand that [Pain] is a concern. Here is how we solve it...</p>
               </div>
            </div>
        </div>
    `;
    
    container.appendChild(div);
    lucide.createIcons();
    
    // Scroll to it
    div.scrollIntoView({behavior: "smooth"});
    
    alert('痛点已导入为异议模块！\nPains imported as Objection module.');
}
