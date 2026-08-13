const { test, expect } = require('@playwright/test');
const manifest = require('../data/tools.json');

const pages = ['index.html', 'navigator.html', 'workflows.html', 'project.html', 'docs/index.html', 'docs/support.html', 'report-generator/index.html', ...manifest.tools.map(tool => tool.path)];

for (const path of pages) {
    test(`${path} opens without local failures`, async ({ page }) => {
        const pageErrors = [];
        const localFailures = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        page.on('response', response => {
            const url = new URL(response.url());
            if (url.hostname === '127.0.0.1' && response.status() >= 400) {
                localFailures.push(`${response.status()} ${url.pathname}`);
            }
        });
        await page.goto(`/${path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(250);
        expect(pageErrors, pageErrors.join('\n')).toEqual([]);
        expect(localFailures, localFailures.join('\n')).toEqual([]);
        await expect(page.locator('body')).toBeVisible();
    });
}

test('shared persistence saves multiple fields and select values', async ({ page }) => {
    await page.goto('/analytics-toolkit/attribution-model.html');
    await page.locator('#totalValue').fill('1200');
    await page.locator('#modelA_select').selectOption({ index: 1 });
    await page.locator('#modelB_select').selectOption({ index: 2 });
    await page.waitForTimeout(700);
    const saved = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key]) => key.startsWith('modiqi_attribution_modeler_'))));
    expect(Object.keys(saved).length).toBeGreaterThanOrEqual(3);
});

test('project context and workflow progress persist', async ({ page }) => {
    await page.goto('/project.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[name="name"]').fill('Runtime Test Project');
    await page.locator('#projectForm button[type="submit"]').click();
    await expect(page.locator('#projectStatus')).toContainText('项目已保存');
    const project = await page.evaluate(() => JSON.parse(localStorage.getItem('modiqi_project_context_v2')));
    expect(project.schemaVersion).toBe(2);
    expect(project.name).toBe('Runtime Test Project');
    await page.goto('/workflows.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#projectSummary')).toContainText('Runtime Test Project');
    const firstToggle = page.locator('.workflow-toggle').first();
    await firstToggle.click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('modiqi_workflow_progress_v1') || '{}'));
    expect(Object.values(stored)).toContain(true);
});

test('legacy project migrates and evidence keeps provenance', async ({ page }) => {
    await page.goto('/project.html');
    await page.evaluate(() => {
        localStorage.removeItem('modiqi_project_context_v2');
        localStorage.setItem('modiqi_project_context_v1', JSON.stringify({
            name: 'Legacy Project',
            owner: 'Runtime Owner',
            stage: 'strategy',
        }));
    });
    await page.reload();
    await expect(page.locator('[name="name"]')).toHaveValue('Legacy Project');
    await page.locator('#evidenceForm [name="statement"]').fill('搜索流量比上月增长 12%');
    await page.locator('#evidenceForm [name="kind"]').selectOption('fact');
    await page.locator('#evidenceForm [name="source"]').fill('Analytics export 2026-08-01');
    await page.locator('#evidenceForm button[type="submit"]').click();
    await expect(page.locator('#evidenceStatus')).toContainText('记录已添加');
    const project = await page.evaluate(() => JSON.parse(localStorage.getItem('modiqi_project_context_v2')));
    expect(project.schemaVersion).toBe(2);
    expect(project.evidence).toHaveLength(1);
    expect(project.evidence[0]).toMatchObject({
        kind: 'fact',
        source: 'Analytics export 2026-08-01',
        status: 'draft',
    });
});

test('mobile canvas toolbar is contained and expands on demand', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/strategy-toolkit/swot-analysis.html');
    const toolbar = page.locator('.modiqi-toolbar');
    const toggle = toolbar.locator('.btn-mobile-toolbar');
    const home = toolbar.locator('button[title*="Home"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(home).toBeHidden();
    const collapsedBox = await toolbar.boundingBox();
    expect(collapsedBox.x).toBeGreaterThanOrEqual(0);
    expect(collapsedBox.x + collapsedBox.width).toBeLessThanOrEqual(390);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(home).toBeVisible();
    const expandedBox = await toolbar.boundingBox();
    expect(expandedBox.x).toBeGreaterThanOrEqual(0);
    expect(expandedBox.x + expandedBox.width).toBeLessThanOrEqual(390);
});
