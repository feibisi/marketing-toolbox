/**
 * Funnel Diagnosis Interaction Logic
 * Handles basic visual updates and impact calculations.
 */
class FunnelDiagnosis {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Watch for changes in the Impact Simulation box
        const impactInputs = document.querySelectorAll('.simulation-box [contenteditable]');
        impactInputs.forEach(input => {
            input.addEventListener('input', () => this.calculateImpact());
            input.addEventListener('blur', () => this.formatImpactValues());
        });

        // Watch for funnel stage edits (optional extended logic can go here)
        const stageCounts = document.querySelectorAll('.stage-count[contenteditable]');
        stageCounts.forEach(count => {
            count.addEventListener('blur', () => this.validateFunnelNumbers());
        });
    }

    /**
     * Parse currency or percentage string to float
     */
    parseValue(str) {
        return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
    }

    /**
     * Calculate Projected Revenue based on Lift
     */
    calculateImpact() {
        const currentRateEl = document.querySelector('.sim-val'); // First one is static 1.8% usually, but logic might vary
        // Actually, let's grab specific elements if we can. 
        // For now, based on structure:
        const simRows = document.querySelectorAll('.sim-row');
        if (simRows.length < 3) return;

        // Row 2: Expected Uplift
        const upliftEl = simRows[1].querySelector('.sim-val');
        // Row 3: Projected Revenue
        const resultEl = simRows[2].querySelector('.sim-val');

        if (!upliftEl || !resultEl) return;

        // Simple visual feedback only for now as base logic isn't defined
        // "Highlight" effect to show it's active
        resultEl.style.transition = 'color 0.2s';
        resultEl.style.color = 'var(--color-brand-primary)';
        setTimeout(() => {
            resultEl.style.color = '';
        }, 500);
    }

    formatImpactValues() {
        // Optional: formatting logic
    }

    validateFunnelNumbers() {
        // Placeholder: Could validate that Stage N > Stage N+1
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FunnelDiagnosis();
});
