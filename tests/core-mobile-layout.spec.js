const { test, expect } = require('@playwright/test');

const workflows = require('../data/workflows.json');
const pages = [...new Set(workflows.workflows.flatMap(workflow => workflow.tools))];

async function geometry(page) {
    return page.evaluate(() => {
        const visible = element => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        };
        const clipped = [];
        document.querySelectorAll('input, textarea, select, button, [contenteditable="true"], a[href]').forEach(element => {
            if (!visible(element) || element.closest('.modiqi-toolbar')) return;
            const rect = element.getBoundingClientRect();
            let ancestor = element.parentElement;
            while (ancestor && ancestor !== document.body) {
                const style = getComputedStyle(ancestor);
                if (['hidden', 'clip'].includes(style.overflow) || ['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY)) {
                    const box = ancestor.getBoundingClientRect();
                    if (rect.right > box.right + 2 || rect.left < box.left - 2 || rect.bottom > box.bottom + 2 || rect.top < box.top - 2) {
                        clipped.push(element.getAttribute('data-save-key') || element.tagName.toLowerCase());
                        break;
                    }
                }
                ancestor = ancestor.parentElement;
            }
        });
        return {
            horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            clipped,
        };
    });
}

for (const path of pages) {
    test(`${path} has a contained mobile composition`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/${path}`);
        const result = await geometry(page);
        expect(result.horizontalOverflow).toBeLessThanOrEqual(2);
        expect(result.clipped).toEqual([]);
    });
}

for (const item of [
    ['strategy-toolkit/swot-analysis.html', '[data-save-key="strengths"]'],
    ['strategy-toolkit/landscape-map.html', '[data-save-key="card_us_strength"]'],
]) {
    test(`${item[0]} grows with long mobile content`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/${item[0]}`);
        await page.locator(item[1]).fill('这是一段用于验证移动画布增长、自动换行和编辑区域不会被纸张裁切的较长业务内容。'.repeat(8));
        const result = await geometry(page);
        expect(result.horizontalOverflow).toBeLessThanOrEqual(2);
        expect(result.clipped).toEqual([]);
    });
}
