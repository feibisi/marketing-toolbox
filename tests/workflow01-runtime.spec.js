const { test, expect } = require('@playwright/test');

const project = {
    schemaVersion: 2,
    id: 'project_workflow01_runtime',
    name: 'Workflow 01 Runtime',
    owner: 'Strategy Owner',
    brand: 'Illustrative B2B Service',
    objective: 'Validate local workflow handoffs',
    constraints: 'Illustrative fixture; no customer data',
    stage: 'strategy',
    targetDate: '',
    evidence: [],
    createdAt: '2026-08-13T00:00:00.000Z',
    updatedAt: '2026-08-13T00:00:00.000Z',
};

async function seedProject(page) {
    await page.addInitScript(value => localStorage.setItem('modiqi_project_context_v2', JSON.stringify(value)), project);
}

test('SWOT evidence and handoff retain provenance for explicit downstream adoption', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/swot-analysis.html');
    const panel = page.locator('[data-workflow-panel]');
    await expect(panel).toContainText('Workflow 01 Runtime');
    const evidence = panel.locator('[data-evidence-form]');
    await evidence.locator('[name="fieldKey"]').fill('strengths');
    await evidence.locator('[name="statement"]').fill('Current customers renew after strategy workshops');
    await evidence.locator('[name="kind"]').selectOption('fact');
    await evidence.locator('[name="source"]').fill('Illustrative public-method fixture; not customer evidence');
    await evidence.locator('[name="reviewDate"]').fill('2026-08-20');
    await evidence.locator('button[type="submit"]').click();
    await expect(panel.locator('[data-evidence-status]')).toContainText('证据已登记');

    const handoff = panel.locator('[data-handoff-form]');
    await handoff.locator('[name="evidenceIds"]').check();
    await handoff.locator('[name="summary"]').fill('Prioritize evidence-led strategic workshops for the selected segment.');
    await handoff.locator('[name="unresolvedRisk"]').fill('Market size remains to verify.');
    await handoff.locator('[name="reviewDate"]').fill('2026-08-20');
    await handoff.locator('button[type="submit"]').click();
    await expect(panel.locator('[data-handoff-status]')).toContainText('交接已保存');

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('modiqi_workflow_handoffs_v1')));
    const record = stored['key:project_workflow01_runtime']['key:strategy-alignment']['key:strategy-toolkit%2Fswot-analysis.html'];
    expect(record).toMatchObject({ schemaVersion: 1, projectId: project.id, status: 'ready', owner: 'Strategy Owner' });
    expect(record.evidenceIds).toHaveLength(1);

    await page.goto('/strategy-toolkit/landscape-map.html');
    await expect(page.locator('[data-upstream]')).toContainText('Prioritize evidence-led strategic workshops');
    await page.locator('[name="adoptionNote"]').fill('Use as a hypothesis; validate against three alternatives.');
    await page.locator('[data-adopt]').click();
    await expect(page.locator('[data-adoption-status]')).toContainText('当前画布内容未被静默覆盖');
});

test('handoff completion is blocked without evidence, owner, and review date', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/business-model-canvas.html');
    const form = page.locator('[data-handoff-form]');
    await form.locator('[name="summary"]').fill('A summary without evidence');
    await form.locator('[name="owner"]').fill('');
    await form.locator('button[type="submit"]').click();
    await expect(form.locator('[data-handoff-status]')).toContainText('未完成');
    expect(await page.evaluate(() => localStorage.getItem('modiqi_workflow_handoffs_v1'))).toBeNull();
});

test('OKR dynamic objectives persist after add and refresh', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/okr-cascade.html');
    const before = await page.locator('.objective-card').count();
    await page.evaluate(() => window.addObjective());
    await expect(page.locator('.objective-card')).toHaveCount(before + 1);
    await page.waitForTimeout(1200);
    await page.reload();
    await expect(page.locator('.objective-card')).toHaveCount(before + 1);
});

test('invalid handoff JSON does not stop a workflow page from opening', async ({ page }) => {
    await seedProject(page);
    await page.addInitScript(() => localStorage.setItem('modiqi_workflow_handoffs_v1', '{invalid'));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/strategy-toolkit/strategic-roadmap.html');
    await expect(page.locator('[data-workflow-panel]')).toContainText('证据与工作流交接');
    expect(errors).toEqual([]);
});

test('hostile workflow bucket shapes are replaced without crossing project boundaries', async ({ page }) => {
    await seedProject(page);
    await page.addInitScript(() => localStorage.setItem(
        'modiqi_workflow_handoffs_v1',
        '{"key:project_workflow01_runtime":"not-an-object","__proto__":{"polluted":true}}'
    ));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/strategy-toolkit/swot-analysis.html');
    const saved = await page.evaluate(() => window.ModiqiWorkflowStore.save({
        projectId: 'project_workflow01_runtime',
        workflowId: 'strategy-alignment',
        sourceTool: 'strategy-toolkit/swot-analysis.html',
        summary: 'Boundary-safe handoff',
        status: 'draft',
    }));
    expect(saved.summary).toBe('Boundary-safe handoff');
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => Object.prototype.polluted)).toBeUndefined();
});

test('imported project text cannot inject markup into workflow controls', async ({ page }) => {
    const hostile = {
        ...project,
        owner: 'Owner"><img data-injected src=x>',
        evidence: [{
            id: 'evidence"><img data-evidence-injected src=x>',
            statement: 'Quoted evidence',
            kind: 'fact',
            source: 'Public record',
            owner: 'Owner',
            reviewDate: '2026-08-20',
            status: 'draft',
            toolPath: 'strategy-toolkit/swot-analysis.html',
            fieldKey: 'strengths',
            createdAt: '2026-08-13T00:00:00.000Z',
            updatedAt: '2026-08-13T00:00:00.000Z',
        }],
    };
    await page.addInitScript(value => localStorage.setItem('modiqi_project_context_v2', JSON.stringify(value)), hostile);
    await page.goto('/strategy-toolkit/swot-analysis.html');
    await expect(page.locator('[data-injected], [data-evidence-injected]')).toHaveCount(0);
    await expect(page.locator('[data-evidence-form] [name="owner"]')).toHaveValue(hostile.owner);
    await expect(page.locator('[name="evidenceIds"]')).toHaveValue(hostile.evidence[0].id);
});
