/**
 * PPC Budget Planner Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for core to init inputs (load from localstorage)
    // We can run calc immediately or wait a tick. 
    // ModiqiApp loads data synchronously usually if it's in localstorage, 
    // but the inputs might not trigger 'input' event on load.

    // Bind events
    const inputs = [
        'inputTotalBudget',
        'inputAvgCPC',
        'inputConvRate',
        'inputAvgValue'
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateResults);
        }
    });

    // Initial calculation (delay slightly to ensure values are loaded)
    setTimeout(calculateResults, 100);
});

function calculateResults() {
    // Get values
    const budget = parseFloat(document.getElementById('inputTotalBudget').value) || 0;
    const cpc = parseFloat(document.getElementById('inputAvgCPC').value) || 0;
    const cvr = (parseFloat(document.getElementById('inputConvRate').value) || 0) / 100;
    const avgValue = parseFloat(document.getElementById('inputAvgValue').value) || 0;

    // Avoid division by zero
    if (cpc <= 0 || cvr <= 0) return;

    // --- Base Scenario ---
    const clicks = Math.floor(budget / cpc);
    const leads = Math.floor(clicks * cvr);
    const cpa = leads > 0 ? (budget / leads) : 0;
    const revenue = leads * avgValue;
    const roas = budget > 0 ? (revenue / budget) : 0;

    // Update Main Metrics
    updateText('resClicks', formatNumber(clicks));
    updateText('resLeads', formatNumber(leads));
    updateText('resCPA', formatCurrency(cpa));
    updateText('resROAS', roas.toFixed(2) + 'x');

    // --- Scenario Analysis ---

    // Conservative (-20% CVR)
    const conCVR = cvr * 0.8;
    const conLeads = Math.floor(clicks * conCVR);
    const conCPA = conLeads > 0 ? (budget / conLeads) : 0;
    const conRev = conLeads * avgValue;
    const conROAS = budget > 0 ? (conRev / budget) : 0;

    // Aggressive (+20% CVR)
    const aggCVR = cvr * 1.2;
    const aggLeads = Math.floor(clicks * aggCVR);
    const aggCPA = aggLeads > 0 ? (budget / aggLeads) : 0;
    const aggRev = aggLeads * avgValue;
    const aggROAS = budget > 0 ? (aggRev / budget) : 0;

    // Update Table
    // Base
    updateText('scenBaseCVR', (cvr * 100).toFixed(1) + '%');
    updateText('scenBaseLeads', formatNumber(leads));
    updateText('scenBaseCPA', formatCurrency(cpa));
    updateText('scenBaseRev', formatCurrency(revenue));
    updateText('scenBaseROAS', roas.toFixed(2));

    // Conservative
    updateText('scenConCVR', (conCVR * 100).toFixed(1) + '%');
    updateText('scenConLeads', formatNumber(conLeads));
    updateText('scenConCPA', formatCurrency(conCPA));
    updateText('scenConRev', formatCurrency(conRev));
    updateText('scenConROAS', conROAS.toFixed(2));

    // Aggressive
    updateText('scenAggCVR', (aggCVR * 100).toFixed(1) + '%');
    updateText('scenAggLeads', formatNumber(aggLeads));
    updateText('scenAggCPA', formatCurrency(aggCPA));
    updateText('scenAggRev', formatCurrency(aggRev));
    updateText('scenAggROAS', aggROAS.toFixed(2));
}

// Helpers
function updateText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function formatCurrency(num) {
    return '¥' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}
