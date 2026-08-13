/**
 * Measurement Plan Logic
 * Handles dynamic row addition/deletion for the matrix.
 */

const ROW_TEMPLATE = `
<div class="matrix-row">
    <div class="col col-objective" contenteditable="true"></div>
    <div class="col col-strategy" contenteditable="true"></div>
    <div class="col col-kpi" contenteditable="true">
        <ul><li></li></ul>
    </div>
    <div class="col col-segment" contenteditable="true">
        <ul><li></li></ul>
    </div>
    <button class="delete-item-btn"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
</div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const listBody = document.getElementById('planRows');
    const btnAdd = document.getElementById('btnAddRow');

    if (!listBody || !btnAdd) return;

    // Add Row
    btnAdd.addEventListener('click', () => {
        const temp = document.createElement('div');
        temp.innerHTML = ROW_TEMPLATE;
        listBody.appendChild(temp.firstElementChild);

        if (window.lucide) window.lucide.createIcons();
        triggerAutoSave(listBody);
    });

    // Event Delegation for Delete
    listBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-item-btn');
        if (btn) {
            const row = btn.closest('.matrix-row');
            if (row) {
                if (confirm('确定要删除这一行吗？')) {
                    row.remove();
                    triggerAutoSave(listBody);
                }
            }
        }
    });

    // Input Bubbling for AutoSave
    // This allows us to capture changes in any contenteditable cell
    listBody.addEventListener('input', () => {
        debouncedSaveList();
    });
});

/**
 * Autosave Logic
 */
let saveTimeout;
function debouncedSaveList() {
    clearTimeout(saveTimeout);
    if (window.modiqiApp) window.modiqiApp.showSaveStatus('saving');

    saveTimeout = setTimeout(() => {
        saveList();
    }, 1000);
}

function saveList() {
    const listBody = document.getElementById('planRows');
    if (!listBody || !window.modiqiApp) return;

    const saveKey = listBody.getAttribute('data-save-key');
    if (saveKey) {
        const fullKey = window.modiqiApp.storageKeyPrefix + saveKey;
        localStorage.setItem(fullKey, listBody.innerHTML);
        window.modiqiApp.showSaveStatus('saved');
    }
}

function triggerAutoSave(element) {
    saveList();
}
