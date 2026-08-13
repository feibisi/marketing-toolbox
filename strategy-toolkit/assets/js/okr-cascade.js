/**
 * OKR Cascade Logic
 * Handles dynamic addition/deletion of Objectives and Key Results.
 * Uses event delegation to support data persistence via innerHTML.
 */

// Templates
const KR_TEMPLATE = `
<div class="kr-item">
    <span class="kr-label">KR</span>
    <div class="kr-input" contenteditable="true">新关键结果...</div>
    <div class="kr-score" title="信心 (Confidence)">
        <i data-lucide="gauge"></i>
        <input type="number" min="0" max="10" value="5" class="score-input">
        <span>/10</span>
    </div>
    <button class="delete-item-btn"><i data-lucide="x"></i></button>
</div>
`;

function getObjectiveTemplate(index) {
    return `
    <div class="objective-card">
        <div class="obj-header">
            <span class="obj-label">O${index}</span>
            <div class="obj-input" contenteditable="true" data-placeholder="输入目标...">新战略目标...</div>
            <div class="obj-score-tag">
                <span class="score-val">--%</span>
            </div>
            <button class="btn-add-kr" title="添加关键结果"><i data-lucide="plus"></i></button>
            <button class="delete-item-btn" title="删除目标"><i data-lucide="x"></i></button>
        </div>

        <div class="kr-list">
            ${KR_TEMPLATE}
        </div>
    </div>
    `;
}


// Global functions exposed to HTML
window.addObjective = function () {
    const list = document.getElementById('objectiveList');
    if (!list) return;

    // Calculate next index
    const currentCount = list.querySelectorAll('.objective-card').length + 1;

    // Create temp container
    const temp = document.createElement('div');
    temp.innerHTML = getObjectiveTemplate(currentCount);
    const newObj = temp.firstElementChild;

    // Append
    list.appendChild(newObj);

    // Re-init icons for new content
    if (window.lucide) window.lucide.createIcons();

    // Trigger Save
    saveListState();
    updateLabels();
    calculateScores();
};

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('objectiveList');
    if (!list) return;

    // Initial calculation
    calculateScores();

    // 1. Event Delegation for Clicks (Add/Delete)
    list.addEventListener('click', (e) => {
        const target = e.target;

        // Handle "Add KR"
        if (target.closest('.btn-add-kr')) {
            const btn = target.closest('.btn-add-kr');
            const card = btn.closest('.objective-card');
            const krList = card.querySelector('.kr-list');

            const temp = document.createElement('div');
            temp.innerHTML = KR_TEMPLATE;
            krList.appendChild(temp.firstElementChild);

            if (window.lucide) window.lucide.createIcons();
            saveListState();
            calculateScores();
        }

        // Handle "Delete" for Objective (in header)
        if (target.closest('.obj-header .delete-item-btn')) {
            const card = target.closest('.objective-card');
            if (confirm('确定要删除此目标吗？\nAre you sure you want to delete this Objective?')) {
                card.remove();
                saveListState();
                updateLabels();
                calculateScores();
            }
        }

        // Handle "Delete" for KR (in item)
        if (target.closest('.kr-item .delete-item-btn')) {
            const item = target.closest('.kr-item');
            item.remove();
            saveListState();
            calculateScores();
        }
    });

    // 2. Event Delegation for Input (Typing + Score Change)
    list.addEventListener('input', (e) => {
        if (e.target.classList.contains('score-input')) {
            calculateScores();
        }
        debouncedSaveListState();
    });
});

/**
 * Calculates scores for all levels
 */
function calculateScores() {
    const objectives = document.querySelectorAll('.objective-card');
    let totalVisionScore = 0;
    let objectiveCount = 0;

    objectives.forEach(obj => {
        const krs = obj.querySelectorAll('.kr-item');
        let objScoreTotal = 0;
        let krCount = 0;

        krs.forEach(kr => {
            const val = parseInt(kr.querySelector('.score-input').value) || 0;
            objScoreTotal += (val * 10); // Scale 0-10 to 0-100%
            krCount++;
        });

        const objAvg = krCount > 0 ? Math.round(objScoreTotal / krCount) : 0;
        const scoreTag = obj.querySelector('.obj-score-tag .score-val');
        if (scoreTag) {
            scoreTag.textContent = `${objAvg}%`;
            updateScoreColor(scoreTag, objAvg);
        }

        totalVisionScore += objAvg;
        objectiveCount++;
    });

    const visionAvg = objectiveCount > 0 ? Math.round(totalVisionScore / objectiveCount) : 0;
    const visionScoreEl = document.querySelector('#visionScore .score-value');
    if (visionScoreEl) {
        visionScoreEl.textContent = `${visionAvg}%`;
        updateScoreColor(visionScoreEl, visionAvg);
    }
}

function updateScoreColor(el, score) {
    el.classList.remove('score-high', 'score-med', 'score-low');
    if (score >= 70) el.classList.add('score-high');
    else if (score >= 40) el.classList.add('score-med');
    else el.classList.add('score-low');
}

let saveTimeout;
function debouncedSaveListState() {
    if (window.modiqiApp) window.modiqiApp.showSaveStatus('saving');

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveListState();
    }, 1000);
}

function saveListState() {
    const list = document.getElementById('objectiveList');
    if (!list || !window.modiqiApp) return;

    const saveKey = list.getAttribute('data-save-key');
    if (saveKey) {
        const fullKey = window.modiqiApp.storageKeyPrefix + saveKey;
        localStorage.setItem(fullKey, list.innerHTML);
        window.modiqiApp.showSaveStatus('saved');
    }
}

function updateLabels() {
    const objs = document.querySelectorAll('.objective-card');
    objs.forEach((obj, index) => {
        const label = obj.querySelector('.obj-label');
        if (label) {
            label.textContent = `O${index + 1}`;
        }
    });
}


