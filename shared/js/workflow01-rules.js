(() => {
    'use strict';

    const TOOL_PATHS = Object.freeze({
        swot: 'strategy-toolkit/swot-analysis.html',
        landscape: 'strategy-toolkit/landscape-map.html',
    });
    const EVIDENCE_KINDS = new Set(['fact', 'assumption', 'to_verify']);
    const ALTERNATIVE_TYPES = new Set(['competitor', 'substitute', 'own_offer']);
    const SWOT_QUADRANTS = ['strengths', 'weaknesses', 'opportunities', 'threats'];
    const LANDSCAPE_ALTERNATIVES = ['us', 'leader', 'challenger', 'niche', 'follower', 'startup'];
    const PLACEHOLDER_CONCLUSIONS = new Set(['核心结论 key takeaway', '核心结论']);
    const MESSAGES = Object.freeze({
        missing_quadrant: 'SWOT 每个适用象限至少需要一条已关联证据。',
        missing_statement: '证据陈述不能为空。',
        invalid_kind: '证据类型必须是事实、假设或待验证。',
        missing_source: '证据或格局对象缺少来源或明确的来源缺失说明。',
        missing_owner: '证据缺少负责人。',
        missing_review_date: '证据缺少有效复核日期。',
        missing_implication: 'SWOT 需要填写一条非占位的优先战略含义。',
        missing_axis_definition: '竞争格局图的两条轴都必须填写名称、单位和方向。',
        insufficient_alternatives: '竞争格局图至少需要三个可比较对象。',
        invalid_alternative_type: '每个格局对象必须标明 competitor、substitute 或 own offer。',
        invalid_position: '每个格局对象都需要有效的 X/Y 数值位置。',
        missing_own_offer: '竞争格局图至少需要一个 own offer。',
        missing_comparator: '竞争格局图至少需要一个 competitor 或 substitute。',
        missing_gap: '竞争格局图需要写明可辩护的空白或定位结论。',
    });

    function text(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function hasSource(item) {
        return Boolean(text(item?.source) || text(item?.sourceGapReason));
    }

    function validPosition(value) {
        if (value === '' || value === null || value === undefined) return false;
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 && number <= 100;
    }

    function issue(code, details = '') {
        return { code, message: details ? `${MESSAGES[code]} ${details}` : MESSAGES[code] };
    }

    function unique(issues) {
        const seen = new Set();
        return issues.filter(item => {
            if (seen.has(item.code)) return false;
            seen.add(item.code);
            return true;
        });
    }

    function validateEvidence(item) {
        const issues = [];
        if (!text(item?.statement)) issues.push(issue('missing_statement'));
        if (!EVIDENCE_KINDS.has(item?.kind)) issues.push(issue('invalid_kind'));
        if (!hasSource(item)) issues.push(issue('missing_source'));
        if (!text(item?.owner)) issues.push(issue('missing_owner'));
        if (!/^\d{4}-\d{2}-\d{2}$/.test(item?.reviewDate || '')) issues.push(issue('missing_review_date'));
        return issues;
    }

    function validateSwot(input) {
        const issues = [];
        SWOT_QUADRANTS.forEach(key => {
            const items = input?.quadrants?.[key];
            if (!Array.isArray(items) || !items.length) {
                issues.push(issue('missing_quadrant', `缺少字段：${key}。`));
                return;
            }
            items.forEach(item => issues.push(...validateEvidence(item)));
        });
        const implication = text(input?.prioritizedImplication).replace(/\s+/g, ' ').toLowerCase();
        if (!implication || PLACEHOLDER_CONCLUSIONS.has(implication)) issues.push(issue('missing_implication'));
        return unique(issues);
    }

    function validateLandscape(input) {
        const issues = [];
        ['x', 'y'].forEach(key => {
            const axis = input?.axes?.[key] || {};
            if (!text(axis.label) || !text(axis.unit) || !text(axis.direction)) {
                issues.push(issue('missing_axis_definition', `缺少 ${key.toUpperCase()} 轴定义。`));
            }
        });
        const alternatives = Array.isArray(input?.alternatives) ? input.alternatives : [];
        if (alternatives.length < 3) issues.push(issue('insufficient_alternatives'));
        alternatives.forEach(item => {
            if (!text(item?.name)) issues.push(issue('missing_statement'));
            if (!ALTERNATIVE_TYPES.has(item?.type)) issues.push(issue('invalid_alternative_type'));
            if (!validPosition(item?.x) || !validPosition(item?.y)) issues.push(issue('invalid_position'));
            if (!hasSource(item)) issues.push(issue('missing_source'));
        });
        if (!alternatives.some(item => item?.type === 'own_offer')) issues.push(issue('missing_own_offer'));
        if (!alternatives.some(item => item?.type === 'competitor' || item?.type === 'substitute')) issues.push(issue('missing_comparator'));
        if (!text(input?.defensibleGap)) issues.push(issue('missing_gap'));
        return unique(issues);
    }

    function validateStructured(toolPath, input) {
        if (toolPath === TOOL_PATHS.swot) return validateSwot(input);
        if (toolPath === TOOL_PATHS.landscape) return validateLandscape(input);
        return [];
    }

    function swotFromPage({ snapshot, evidence }) {
        return {
            quadrants: Object.fromEntries(SWOT_QUADRANTS.map(key => [
                key,
                evidence.filter(item => item.fieldKey === key),
            ])),
            prioritizedImplication: snapshot.conclusion,
        };
    }

    function landscapeFromPage({ snapshot, summary }) {
        return {
            axes: {
                x: { label: snapshot.axis_x, unit: snapshot.axis_x_unit, direction: snapshot.axis_x_direction },
                y: { label: snapshot.axis_y, unit: snapshot.axis_y_unit, direction: snapshot.axis_y_direction },
            },
            alternatives: LANDSCAPE_ALTERNATIVES.map(id => ({
                id,
                name: snapshot[`comp_${id}_name`],
                type: snapshot[`alt_${id}_type`],
                x: snapshot[`alt_${id}_x`],
                y: snapshot[`alt_${id}_y`],
                source: snapshot[`alt_${id}_source`],
                sourceGapReason: '',
            })).filter(item => text(item.name)),
            defensibleGap: summary,
        };
    }

    function validateHandoff({ toolPath, snapshot, evidence, summary }) {
        if (toolPath === TOOL_PATHS.swot) return validateSwot(swotFromPage({ snapshot, evidence }));
        if (toolPath === TOOL_PATHS.landscape) return validateLandscape(landscapeFromPage({ snapshot, summary }));
        return [];
    }

    window.ModiqiWorkflow01Rules = Object.freeze({
        TOOL_PATHS,
        validateStructured,
        validateHandoff,
    });
})();
