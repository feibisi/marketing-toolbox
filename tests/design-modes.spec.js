const { test, expect } = require('@playwright/test');

const fixedCanvases = [
    { path: 'strategy-toolkit/swot-analysis.html', paper: 'a3-landscape' },
    { path: 'strategy-toolkit/business-model-canvas.html', paper: 'a3-landscape' },
    { path: 'strategy-toolkit/landscape-map.html', paper: 'a3-landscape' },
    { path: 'strategy-toolkit/value-proposition.html', paper: 'a3-landscape' },
    { path: 'behavior-toolkit/customer-journey.html', paper: 'a3-landscape' },
    { path: 'strategy-toolkit/stp-canvas.html', paper: 'a3-landscape' },
    { path: 'brand-toolkit/jtbd-canvas.html', paper: 'a3-landscape' },
    { path: 'brand-toolkit/brand-positioning-map.html', paper: 'a3-landscape' },
    { path: 'customer-toolkit/user-persona.html', paper: 'a4-portrait' },
    { path: 'behavior-toolkit/empathy-map.html', paper: 'a4-portrait' },
];

for (const { path, paper: expectedPaper } of fixedCanvases) {
    test(`${path} preserves the desktop paper contract`, async ({ page }) => {
        await page.goto(`/${path}`);
        const result = await page.evaluate(() => {
            const paper = document.querySelector('main[data-output-format="single-sheet"]');
            const rect = paper.getBoundingClientRect();
            return {
                kind: document.body.dataset.toolKind,
                paper: document.body.dataset.paperContract,
                ratio: rect.width / rect.height,
                overflow: getComputedStyle(paper).overflow,
                supportUiInside: Boolean(paper.querySelector('.workflow-panel-shell, .workspace-support-panel')),
            };
        });
        expect(result.kind).toBe('fixed-canvas');
        expect(result.paper).toBe(expectedPaper);
        if (expectedPaper === 'a3-landscape') {
            expect(result.ratio).toBeGreaterThan(1.39);
            expect(result.ratio).toBeLessThan(1.44);
        } else {
            expect(result.ratio).toBeGreaterThan(0.69);
            expect(result.ratio).toBeLessThan(0.72);
        }
        expect(result.overflow).toBe('hidden');
        expect(result.supportUiInside).toBe(false);
    });
}

for (const path of ['strategy-toolkit/okr-cascade.html', 'strategy-toolkit/strategic-roadmap.html']) {
    test(`${path} is explicitly a continuous worksheet`, async ({ page }) => {
        await page.goto(`/${path}`);
        await expect(page.locator('body')).toHaveAttribute('data-tool-kind', 'worksheet');
        await expect(page.locator('main')).toHaveAttribute('data-output-format', 'multi-page');
    });
}

test('ROI separates calculator behavior from its result summary contract', async ({ page }) => {
    await page.goto('/analytics-toolkit/roi-calculator.html');
    await expect(page.locator('body')).toHaveAttribute('data-tool-kind', 'calculator');
    await expect(page.locator('main')).toHaveAttribute('data-output-format', 'result-summary');
});

test('mobile presentation identifies itself as editing mode', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/strategy-toolkit/swot-analysis.html');
    const label = await page.evaluate(() => getComputedStyle(document.body, '::after').content);
    expect(label).toContain('移动编辑模式');
});
