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

async function addEvidence(panel, fieldKey, statement) {
    const evidence = panel.locator('[data-evidence-form]');
    await evidence.locator('[name="fieldKey"]').fill(fieldKey);
    await evidence.locator('[name="statement"]').fill(statement);
    await evidence.locator('[name="kind"]').selectOption('assumption');
    await evidence.locator('[name="source"]').fill('Illustrative synthetic runtime fixture; no customer evidence');
    await evidence.locator('[name="reviewDate"]').fill('2026-08-20');
    await evidence.locator('button[type="submit"]').click();
    await expect(panel.locator('[data-evidence-status]')).toContainText('证据已登记');
}

test('SWOT evidence and handoff retain provenance for explicit downstream adoption', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/swot-analysis.html');
    const panel = page.locator('[data-workflow-panel]');
    await expect(panel).toContainText('Workflow 01 Runtime');
    await addEvidence(panel, 'strengths', 'A repeatable workshop format is available as an internal assumption.');

    const handoff = panel.locator('[data-handoff-form]');
    for (const checkbox of await handoff.locator('[name="evidenceIds"]').all()) await checkbox.check();
    await handoff.locator('[name="summary"]').fill('Prioritize evidence-led strategic workshops for the selected segment.');
    await handoff.locator('[name="unresolvedRisk"]').fill('Market size remains to verify.');
    await handoff.locator('[name="reviewDate"]').fill('2026-08-20');
    await handoff.locator('button[type="submit"]').click();
    await expect(panel.locator('[data-handoff-status]')).toContainText('SWOT 每个适用象限');
    expect(await page.evaluate(() => localStorage.getItem('modiqi_workflow_handoffs_v1'))).toBeNull();

    await addEvidence(panel, 'weaknesses', 'The acquisition baseline is not validated.');
    await addEvidence(panel, 'opportunities', 'SME planning demand remains to verify.');
    await addEvidence(panel, 'threats', 'Substitute templates may reduce willingness to pay.');
    await page.locator('[data-save-key="conclusion"]').fill('Validate one narrow evidence-led workflow before expanding the catalog.');
    for (const checkbox of await handoff.locator('[name="evidenceIds"]').all()) await checkbox.check();
    await handoff.locator('button[type="submit"]').click();
    await expect(panel.locator('[data-handoff-status]')).toContainText('交接已保存');

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('modiqi_workflow_handoffs_v1')));
    const record = stored['key:project_workflow01_runtime']['key:strategy-alignment']['key:strategy-toolkit%2Fswot-analysis.html'];
    expect(record).toMatchObject({ schemaVersion: 1, projectId: project.id, status: 'ready', owner: 'Strategy Owner' });
    expect(record.evidenceIds).toHaveLength(4);

    await page.goto('/strategy-toolkit/landscape-map.html');
    await expect(page.locator('[data-upstream]')).toContainText('Prioritize evidence-led strategic workshops');
    await page.locator('[name="adoptionNote"]').fill('Use as a hypothesis; validate against three alternatives.');
    await page.locator('[data-adopt]').click();
    await expect(page.locator('[data-adoption-status]')).toContainText('当前画布内容未被静默覆盖');
});

test('landscape method fields drive positions and block handoff until axes and sources are complete', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/landscape-map.html');
    const panel = page.locator('[data-workflow-panel]');
    await addEvidence(panel, 'axis_x', 'The selected dimensions are an internal comparison hypothesis.');
    const handoff = panel.locator('[data-handoff-form]');
    await handoff.locator('[name="evidenceIds"]').check();
    await handoff.locator('[name="summary"]').fill('Test the gap between isolated templates and reviewed workflows.');
    await handoff.locator('[name="reviewDate"]').fill('2026-08-20');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('两条轴都必须填写名称、单位和方向');
    await expect(handoff.locator('[data-handoff-status]')).toContainText('缺少来源');

    await page.locator('[data-save-key="axis_x_unit"]').fill('ordinal score 0-100');
    await page.locator('[data-save-key="axis_y_unit"]').fill('ordinal score 0-100');
    for (const id of ['us', 'leader', 'challenger', 'niche', 'follower', 'startup']) {
        await page.locator(`[data-save-key="alt_${id}_source"]`).fill('Illustrative internal hypothesis; external source pending');
    }
    await page.locator('[data-save-key="alt_us_x"]').fill('');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('有效的 X/Y 数值位置');
    await page.locator('[data-save-key="alt_us_x"]').fill('20');
    await page.locator('[data-save-key="alt_us_y"]').fill('80');
    await expect(page.locator('.competitor.us')).toHaveAttribute('style', /left: 20%; top: 20%/);
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('交接已保存');
    await page.waitForTimeout(1200);
    await page.reload();
    await expect(page.locator('[data-save-key="axis_x_unit"]')).toHaveValue('ordinal score 0-100');
    await expect(page.locator('[data-save-key="alt_us_source"]')).toHaveValue('Illustrative internal hypothesis; external source pending');
    await expect(page.locator('.competitor.us')).toHaveAttribute('style', /left: 20%; top: 20%/);
});

test('shared Workflow 01 rules reproduce valid and missing-source fixture outcomes', async ({ page }) => {
    await page.goto('/strategy-toolkit/landscape-map.html');
    const result = await page.evaluate(async () => {
        const paths = ['swot-analysis', 'landscape-map', 'business-model-canvas', 'value-proposition'];
        const output = {};
        for (const stem of paths) {
            const fixture = await fetch(`/tests/fixtures/${stem}.json`).then(response => response.json());
            output[stem] = Object.fromEntries(fixture.cases
                .filter(item => ['valid', 'missing-source'].includes(item.id))
                .map(item => [
                    item.id,
                    window.ModiqiWorkflow01Rules.validateStructured(fixture.toolPath, item.input).map(issue => issue.code),
                ]));
        }
        return output;
    });
    expect(result).toEqual({
        'swot-analysis': { valid: [], 'missing-source': ['missing_source'] },
        'landscape-map': { valid: [], 'missing-source': ['missing_source'] },
        'business-model-canvas': { valid: [], 'missing-source': [] },
        'value-proposition': { valid: [], 'missing-source': [] },
    });
});

test('business model canvas blocks handoff without nine blocks and economic bases', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/business-model-canvas.html');
    const panel = page.locator('[data-workflow-panel]');
    await addEvidence(panel, 'bmc_value', 'The model remains an illustrative internal hypothesis.');
    const handoff = panel.locator('[data-handoff-form]');
    await handoff.locator('[name="evidenceIds"]').check();
    await handoff.locator('[name="summary"]').fill('Test a fixed-scope planning workshop for one segment.');
    await handoff.locator('[name="reviewDate"]').fill('2026-08-20');
    await page.locator('[data-save-key="bmc_value"]').fill('');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('九个区块');
    await expect(handoff.locator('[data-handoff-status]')).toContainText('计量或计价口径');

    const blocks = {
        bmc_partners: 'Illustrative implementation partner',
        bmc_activities: 'Run a planning workshop',
        bmc_resources: 'Reusable diagnostic worksheet',
        bmc_value: 'A reviewed 90-day plan',
        bmc_relationships: 'Workshop plus review',
        bmc_channels: 'Professional association webinar',
        bmc_segments: 'Regional accounting firms',
        bmc_costs: 'Facilitator time',
        bmc_revenue: 'Workshop fee',
    };
    for (const [key, value] of Object.entries(blocks)) await page.locator(`[data-save-key="${key}"]`).fill(value);
    await page.locator('[data-save-key="bmc_customer_segment"]').fill('Regional accounting firms');
    await page.locator('[data-save-key="bmc_cost_basis"]').fill('hours per workshop');
    await page.locator('[data-save-key="bmc_revenue_basis"]').fill('fee per completed workshop');
    await page.locator('[data-save-key="bmc_riskiest_assumption"]').fill('The segment will pay before requesting execution support.');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('交接已保存');
});

test('value proposition canvas requires ranked customer items, mappings, and fit evidence', async ({ page }) => {
    await seedProject(page);
    await page.goto('/strategy-toolkit/business-model-canvas.html');
    await page.evaluate(projectId => window.ModiqiWorkflowStore.save({
        projectId,
        workflowId: 'strategy-alignment',
        sourceTool: 'strategy-toolkit/business-model-canvas.html',
        targetTool: 'strategy-toolkit/value-proposition.html',
        summary: 'Illustrative upstream model',
        owner: 'Strategy Owner',
        reviewDate: '2026-08-20',
        evidenceIds: ['ev-upstream-illustrative'],
        snapshot: { bmc_customer_segment: 'Regional accounting firms' },
        status: 'ready',
    }), project.id);
    await page.goto('/strategy-toolkit/value-proposition.html');
    const panel = page.locator('[data-workflow-panel]');
    await addEvidence(panel, 'customer_pains', 'Customer priorities are illustrative and require domain review.');
    const handoff = panel.locator('[data-handoff-form]');
    await handoff.locator('[name="evidenceIds"]').check();
    await handoff.locator('[name="summary"]').fill('Validate the chosen promise against the top pain.');
    await handoff.locator('[name="reviewDate"]').fill('2026-08-20');
    await page.locator('[data-save-key="customer_jobs"]').fill('');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('稳定 ID 与优先级');
    await expect(handoff.locator('[data-handoff-status]')).toContainText('FIT 关系');

    await page.locator('[data-save-key="customer_segment"]').fill('Independent retailers');
    await page.locator('[data-save-key="customer_jobs"]').fill('Decide which acquisition channels merit investment');
    await page.locator('[data-save-key="customer_pains"]').fill('Metrics are spread across several tools');
    await page.locator('[data-save-key="customer_gains"]').fill('A prioritised measurement plan with owners');
    await page.locator('[data-save-key="pain_relievers"]').fill('Facilitated channel evidence review');
    await page.locator('[data-save-key="gain_creators"]').fill('Prioritised 90-day measurement plan');
    await page.locator('[data-save-key="vpc_fit_evidence_id"]').fill('ev-illustrative-01');
    await page.locator('[data-save-key="vpc_chosen_promise"]').fill('Leave the workshop with an owned 90-day plan.');
    await page.locator('[data-save-key="vpc_unresolved_mismatch"]').fill('Willingness to pay remains unverified.');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('客户细分必须与上游');
    await page.locator('[data-save-key="customer_segment"]').fill('Regional accounting firms');
    await handoff.locator('button[type="submit"]').click();
    await expect(handoff.locator('[data-handoff-status]')).toContainText('交接已保存');
});

test('value proposition v4 example loads the current storage keys', async ({ page }) => {
    await page.goto('/strategy-toolkit/value-proposition.html');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button[title="加载范例 (Load Example)"]').evaluate(button => button.click());
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-save-key="product_name"]')).toHaveValue('Tesla Model S');
    await expect(page.locator('[data-save-key="vpc_fit_evidence_id"]')).toHaveValue('example-public-spec');
    await expect(page.locator('[data-save-key="vpc_unresolved_mismatch"]')).toHaveValue(/没有真实客户访谈/);
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
