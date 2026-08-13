/**
 * Brand Architecture Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const modelSelect = document.getElementById('modelSelect');
    const treeContainer = document.getElementById('treeContainer');

    // Model Switching
    function updateModel() {
        const model = modelSelect.value;

        // Remove existing model classes
        treeContainer.classList.remove(
            'model-branded-house',
            'model-house-of-brands',
            'model-endorsed',
            'model-hybrid'
        );

        // Add new class
        treeContainer.classList.add(`model-${model}`);
    }

    // Init
    if (modelSelect) {
        modelSelect.addEventListener('change', updateModel);

        // Wait for core.js auto-load to potentially fill the select, then update visual
        setTimeout(() => {
            updateModel();
        }, 500);
    }

});
