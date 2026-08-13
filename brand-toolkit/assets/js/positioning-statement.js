/**
 * Positioning Statement Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fieldTarget = document.querySelector('[data-save-key="pos_target"]');
    const fieldNeed = document.querySelector('[data-save-key="pos_need"]');
    const fieldCategory = document.querySelector('[data-save-key="pos_category"]');
    const fieldBenefit = document.querySelector('[data-save-key="pos_benefit"]');
    const fieldComp = document.querySelector('[data-save-key="pos_comp"]');
    const fieldDiff = document.querySelector('[data-save-key="pos_diff"]');

    const previewEl = document.getElementById('statementPreview');

    // Update Preview Function
    function updatePreview() {
        const target = fieldTarget.innerText.trim() || '[Target Audience]';
        const need = fieldNeed.innerText.trim() || '[Core Need]';
        const category = fieldCategory.innerText.trim() || '[Category]';
        const benefit = fieldBenefit.innerText.trim() || '[Key Benefit]';
        const comp = fieldComp.innerText.trim() || '[Competitor]';
        const diff = fieldDiff.innerText.trim() || '[Differentiator]';

        // Construct the statement HTML
        previewEl.innerHTML = `
            For <span class="highlight">${target}</span> who <span class="highlight">${need}</span>, 
            the <span class="highlight">${category}</span> 
            that <span class="highlight">${benefit}</span>. 
            Unlike <span class="highlight">${comp}</span>, 
            our product <span class="highlight">${diff}</span>.
        `;
    }

    // Event Listeners
    const fields = [fieldTarget, fieldNeed, fieldCategory, fieldBenefit, fieldComp, fieldDiff];

    fields.forEach(field => {
        if (field) {
            field.addEventListener('input', updatePreview);
            // Also update on blur to handle pasted content or initial load delays
            field.addEventListener('blur', updatePreview);
        }
    });

    // Initial run (wait for auto-load to finish)
    setTimeout(updatePreview, 600);
});
