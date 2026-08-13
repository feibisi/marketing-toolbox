/**
 * Content Repurposing Logic
 * Handles dynamic derivatives cards and channel switching.
 */

const DERIVATIVE_TEMPLATE = `
<div class="derivative-card">
    <div class="d-header">
        <span class="channel-tag social" onclick="cycleChannel(this)">社交媒体</span>
        <input type="text" class="d-title-input" placeholder="输入格式" value="新衍生内容">
        <button class="delete-item-btn"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
    </div>
    <div class="d-content" contenteditable="true">
        在此描述内容...
    </div>
</div>
`;

// Global exposure
window.addDerivative = function () {
    const grid = document.getElementById('derivativesGrid');
    if (!grid) return;

    const temp = document.createElement('div');
    temp.innerHTML = DERIVATIVE_TEMPLATE;
    grid.appendChild(temp.firstElementChild);

    if (window.lucide) window.lucide.createIcons();
    triggerAutoSave(grid);
};

// Channel Cycler
const CHANNELS = [
    { type: 'social', label: '社交媒体' },
    { type: 'video', label: '短视频' },
    { type: 'email', label: '邮件/私域' },
    { type: 'seo', label: 'SEO/博客' }
];

window.cycleChannel = function (el) {
    let currentType = 'social';
    // Find current type from class
    CHANNELS.forEach(c => {
        if (el.classList.contains(c.type)) currentType = c.type;
    });

    // Find next index
    let idx = CHANNELS.findIndex(c => c.type === currentType);
    let nextIdx = (idx + 1) % CHANNELS.length;
    let next = CHANNELS[nextIdx];

    // Update classes and text
    el.className = `channel-tag ${next.type}`;
    el.textContent = next.label;

    // Trigger save because HTML changed
    const card = el.closest('.derivative-card');
    triggerAutoSave(card.parentElement);
};


document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('derivativesGrid');
    if (!grid) return;

    // Event Delegation for Delete
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-item-btn');
        if (btn) {
            const card = btn.closest('.derivative-card');
            if (card) {
                if (confirm('删除此内容？')) {
                    card.remove();
                    triggerAutoSave(grid);
                }
            }
        }
    });

    // AutoSave Bubbling
    grid.addEventListener('input', () => {
        debouncedSaveGrid();
    });
});

let saveTimeout;
function debouncedSaveGrid() {
    clearTimeout(saveTimeout);
    if (window.modiqiApp) window.modiqiApp.showSaveStatus('saving');

    saveTimeout = setTimeout(() => {
        saveGrid();
    }, 1000);
}

function saveGrid() {
    const grid = document.getElementById('derivativesGrid');
    if (!grid || !window.modiqiApp) return;

    const saveKey = grid.getAttribute('data-save-key');
    if (saveKey) {
        const fullKey = window.modiqiApp.storageKeyPrefix + saveKey;
        localStorage.setItem(fullKey, grid.innerHTML);
        window.modiqiApp.showSaveStatus('saved');
    }
}

function triggerAutoSave(element) {
    saveGrid();
}
