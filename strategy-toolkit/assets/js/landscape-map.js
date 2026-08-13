(() => {
    'use strict';

    const IDS = ['us', 'leader', 'challenger', 'niche', 'follower', 'startup'];

    function numberValue(element, fallback) {
        const value = Number(element?.value);
        return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
    }

    function syncAlternative(id) {
        const bubble = document.querySelector(`.competitor.${id}`);
        const name = document.querySelector(`[data-save-key="comp_${id}_name"]`);
        const x = document.querySelector(`[data-save-key="alt_${id}_x"]`);
        const y = document.querySelector(`[data-save-key="alt_${id}_y"]`);
        const label = document.querySelector(`[data-alt-label="${id}"]`);
        if (!bubble || !name || !x || !y) return;
        bubble.style.left = `${numberValue(x, 50)}%`;
        bubble.style.top = `${100 - numberValue(y, 50)}%`;
        if (label) label.textContent = name.innerText.trim() || id;
    }

    function init() {
        IDS.forEach(id => {
            const name = document.querySelector(`[data-save-key="comp_${id}_name"]`);
            const x = document.querySelector(`[data-save-key="alt_${id}_x"]`);
            const y = document.querySelector(`[data-save-key="alt_${id}_y"]`);
            [name, x, y].forEach(element => element?.addEventListener('input', () => syncAlternative(id)));
            syncAlternative(id);
        });
    }

    window.ModiqiLandscapeMap = Object.freeze({ init });
})();
