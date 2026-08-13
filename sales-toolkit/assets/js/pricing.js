/**
 * Pricing Tier Architect Logic
 * Handles interactive pricing models and layout states.
 */

const pricingState = {
    billing: 'monthly', // 'monthly' | 'yearly'
    discount: 20 // percent
};

document.addEventListener('DOMContentLoaded', () => {
    initPricingLogic();
    initDynamicLists();
    loadSavedState();
});

function initPricingLogic() {
    const toggle = document.getElementById('billingToggle');
    const discountInput = document.getElementById('discountInput');

    // Toggle Handler
    toggle.addEventListener('change', (e) => {
        pricingState.billing = e.target.checked ? 'yearly' : 'monthly';
        updatePrices();
    });

    // Discount Handler
    discountInput.addEventListener('input', (e) => {
        pricingState.discount = parseInt(e.target.value) || 0;
        if (pricingState.billing === 'yearly') {
            updatePrices();
        }
    });

    // Reset Logic button (optional dev helper)
    document.getElementById('btnResetRecommended')?.addEventListener('click', () => {
        alert(`Current State: ${pricingState.billing}, Discount: ${pricingState.discount}%`);
    });
}

function updatePrices() {
    const amounts = document.querySelectorAll('.amount');
    const periods = document.querySelectorAll('.period');

    amounts.forEach((el, index) => {
        const baseMonthly = parseFloat(el.dataset.monthly);
        if (!baseMonthly) return;

        let finalPrice;
        if (pricingState.billing === 'monthly') {
            finalPrice = baseMonthly;
        } else {
            // Yearly = Monthly * 12 * (1 - discount)
            finalPrice = baseMonthly * 12 * ((100 - pricingState.discount) / 100);
        }

        // Format: No decimals for large numbers usually, or standard localized
        el.textContent = Math.round(finalPrice).toLocaleString();
    });

    // Update labels
    periods.forEach(el => {
        el.textContent = pricingState.billing === 'monthly' ? '/月' : '/年';
    });
}

function setRecommended(tierId) {
    // UI Update
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.classList.remove('is-recommended');
    });
    document.getElementById(tierId).classList.add('is-recommended');

    // Save
    if (window.modiqiApp) {
        window.modiqiApp.saveData('pricing_recommended_tier', tierId);
    }
}

// Reuse Dynamic List logic (similar to okr/measurement)
function initDynamicLists() {
    document.body.addEventListener('click', (e) => {
        // Add Item
        if (e.target.closest('.btn-add-item')) {
            const btn = e.target.closest('.btn-add-item');
            const list = btn.previousElementSibling;
            if (list && list.classList.contains('dynamic-list')) {
                const li = document.createElement('li');
                li.className = 'list-item';
                li.innerHTML = `
                    <i data-lucide="check" class="check-icon"></i>
                    <span contenteditable="true">新特性 (New Feature)</span>
                    <button class="delete-item-btn" contenteditable="false"><i data-lucide="trash-2"></i></button>
                `;
                list.appendChild(li);
                lucide.createIcons(); // Refresh icons for new item
            }
        }

        // Delete Item
        if (e.target.closest('.delete-item-btn')) {
            const item = e.target.closest('.list-item');
            item.remove();
        }
    });
}

function loadSavedState() {
    // Load Recommended Tier
    // We need to wait for ModiqiApp to load data? 
    // ModiqiApp loads data on init. But we don't have a direct callback here unless we hook into core.
    // For now, simpler: check localStorage directly if needed, or rely on auto-restore for contenteditable.
    // But 'class' selection isn't auto-saved by core.js 'data-save-key' unless we map it.

    // Custom restore for Recommended Tier
    const savedTier = localStorage.getItem('modiqi_sales_pricing_v1_pricing_recommended_tier');
    if (savedTier) {
        // Clean quotes if stored as JSON string
        const cleanId = savedTier.replace(/"/g, '');
        const target = document.getElementById(cleanId);
        if (target) {
            setRecommended(cleanId);
        }
    }
}
