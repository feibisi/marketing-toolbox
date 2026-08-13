(() => {
    'use strict';

    const TOOL_PATHS = Object.freeze({
        swot: 'strategy-toolkit/swot-analysis.html',
        landscape: 'strategy-toolkit/landscape-map.html',
        businessModel: 'strategy-toolkit/business-model-canvas.html',
        valueProposition: 'strategy-toolkit/value-proposition.html',
        okr: 'strategy-toolkit/okr-cascade.html',
        roadmap: 'strategy-toolkit/strategic-roadmap.html',
    });
    const EVIDENCE_KINDS = new Set(['fact', 'assumption', 'to_verify']);
    const ALTERNATIVE_TYPES = new Set(['competitor', 'substitute', 'own_offer']);
    const SWOT_QUADRANTS = ['strengths', 'weaknesses', 'opportunities', 'threats'];
    const LANDSCAPE_ALTERNATIVES = ['us', 'leader', 'challenger', 'niche', 'follower', 'startup'];
    const PLACEHOLDER_CONCLUSIONS = new Set(['核心结论 key takeaway', '核心结论']);
    const PLACEHOLDER_FRAGMENTS = [
        '关键供应商', '生产制造', '实体资产', '我们为客户解决什么问题', '专属服务', '线上商城',
        '我们为谁创造价值', '最重要的固有成本', '客户愿意为什么付费', '列出你的所有产品功能',
        '如何帮助客户实现愿望', '如何减轻客户的痛苦', '客户试图完成什么工作', '客户想要什么结果', '风险与障碍',
    ];
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
        missing_bmc_block: '商业模式画布九个区块都需要填写具体内容。',
        missing_economic_basis: '成本结构和收入来源都需要填写计量或计价口径。',
        missing_customer_segment: '需要明确一个客户细分。',
        missing_riskiest_assumption: '需要明确当前风险最高的商业假设。',
        unranked_customer_item: '客户任务、痛点和获益都需要稳定 ID 与优先级。',
        unmapped_response: '每个痛点缓释或获益创造响应都必须映射到客户项。',
        missing_fit_evidence: '至少一条 FIT 关系需要关联证据 ID。',
        missing_promise: '需要选择一个可验证的价值承诺。',
        missing_mismatch: '需要记录尚未解决的价值匹配缺口。',
        segment_mismatch: '价值主张的客户细分必须与上游商业模式画布一致，或先返回上游修订。',
        missing_okr_context: 'OKR 需要明确客户细分、目标和上游战略链接。',
        invalid_kr_metric: '每条关键结果都需要稳定 ID、结果陈述、基线、目标、单位、截止日期、负责人和来源。',
        activity_only_kr: '关键结果必须描述可衡量结果，不能只是活动或任务。',
        roadmap_unmapped_outcome: '每项举措必须映射到上游 OKR 的关键结果 ID。',
        roadmap_dependency_missing: '路线图依赖必须引用当前路线图中存在的举措 ID。',
        roadmap_dependency_cycle: '路线图存在循环依赖，必须调整举措顺序。',
        invalid_date_window: '路线图举措需要有效的开始和结束日期，且开始日期不能晚于结束日期。',
        invalid_initiative: '每项路线图举措都需要稳定 ID、名称、负责人和决策门。',
    });

    function text(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function hasSource(item) {
        return Boolean(text(item?.source) || text(item?.sourceGapReason));
    }

    function meaningful(value) {
        const normalized = text(value).replace(/\s+/g, ' ');
        return Boolean(normalized) && !PLACEHOLDER_FRAGMENTS.some(fragment => normalized.includes(fragment));
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

    function populatedList(value) {
        return Array.isArray(value) && value.length > 0 && value.every(item => {
            const statement = typeof item === 'string' ? item : item?.item || item?.statement;
            return meaningful(statement);
        });
    }

    function validateBusinessModel(input) {
        const issues = [];
        const blocks = input?.blocks || {};
        const required = ['partners', 'activities', 'resources', 'valuePropositions', 'relationships', 'channels', 'customerSegments', 'costStructure', 'revenueStreams'];
        if (required.some(key => !populatedList(blocks[key]))) issues.push(issue('missing_bmc_block'));
        ['costStructure', 'revenueStreams'].forEach(key => {
            if ((blocks[key] || []).some(item => !text(item?.basis))) issues.push(issue('missing_economic_basis'));
        });
        if (!text(input?.customerSegment)) issues.push(issue('missing_customer_segment'));
        if (!text(input?.riskiestAssumption)) issues.push(issue('missing_riskiest_assumption'));
        return unique(issues);
    }

    function validateValueProposition(input) {
        const issues = [];
        if (!text(input?.customerSegment)) issues.push(issue('missing_customer_segment'));
        const customerIds = new Set();
        ['jobs', 'pains', 'gains'].forEach(key => {
            const items = input?.[key];
            if (!Array.isArray(items) || !items.length) {
                issues.push(issue('unranked_customer_item'));
                return;
            }
            items.forEach(item => {
                if (!text(item?.id) || !meaningful(item?.statement) || !Number.isInteger(Number(item?.rank)) || Number(item.rank) < 1) {
                    issues.push(issue('unranked_customer_item'));
                } else {
                    customerIds.add(item.id);
                }
            });
        });
        const responses = Array.isArray(input?.responses) ? input.responses : [];
        if (!responses.length || responses.some(item => !meaningful(item?.statement) || !customerIds.has(item?.mapsTo))) {
            issues.push(issue('unmapped_response'));
        }
        const links = Array.isArray(input?.fitLinks) ? input.fitLinks : [];
        if (!links.some(item => text(item?.evidenceId) && customerIds.has(item?.customerItemId))) {
            issues.push(issue('missing_fit_evidence'));
        }
        if (!text(input?.chosenPromise)) issues.push(issue('missing_promise'));
        if (!text(input?.unresolvedMismatch)) issues.push(issue('missing_mismatch'));
        return unique(issues);
    }

    function validDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
        const parsed = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }

    function validateOkr(input) {
        const issues = [];
        if (!text(input?.customerSegment) || !meaningful(input?.objective) || !text(input?.strategyLink)) {
            issues.push(issue('missing_okr_context'));
        }
        const keyResults = Array.isArray(input?.keyResults) ? input.keyResults : [];
        if (!keyResults.length) issues.push(issue('invalid_kr_metric'));
        keyResults.forEach(item => {
            const baseline = item?.baseline;
            const target = item?.target;
            if (!text(item?.id) || !meaningful(item?.statement) || baseline === '' || target === '' ||
                !Number.isFinite(Number(baseline)) || !Number.isFinite(Number(target)) || !text(item?.unit) ||
                !validDate(item?.dueDate) || !text(item?.owner) || !text(item?.source)) {
                issues.push(issue('invalid_kr_metric'));
            }
            if (item?.kind !== 'outcome') issues.push(issue('activity_only_kr'));
        });
        return unique(issues);
    }

    function hasDependencyCycle(initiatives) {
        const graph = new Map(initiatives.map(item => [item.id, item.dependencies || []]));
        const visiting = new Set();
        const visited = new Set();
        function visit(id) {
            if (visiting.has(id)) return true;
            if (visited.has(id)) return false;
            visiting.add(id);
            if ((graph.get(id) || []).some(visit)) return true;
            visiting.delete(id);
            visited.add(id);
            return false;
        }
        return [...graph.keys()].some(visit);
    }

    function validateRoadmap(input, context = {}) {
        const issues = [];
        const initiatives = Array.isArray(input?.initiatives) ? input.initiatives : [];
        const ids = new Set(initiatives.map(item => text(item?.id)).filter(Boolean));
        const krIds = new Set(context.krIds || []);
        if (!initiatives.length) issues.push(issue('invalid_initiative'));
        initiatives.forEach(item => {
            if (!text(item?.id) || !meaningful(item?.name) || !text(item?.owner) || !text(item?.decisionGate)) {
                issues.push(issue('invalid_initiative'));
            }
            if (!krIds.has(text(item?.outcomeLink))) issues.push(issue('roadmap_unmapped_outcome'));
            if ((item?.dependencies || []).some(id => !ids.has(id))) issues.push(issue('roadmap_dependency_missing'));
            if (!validDate(item?.startDate) || !validDate(item?.endDate) || item.startDate > item.endDate) {
                issues.push(issue('invalid_date_window'));
            }
        });
        if (hasDependencyCycle(initiatives)) issues.push(issue('roadmap_dependency_cycle'));
        return unique(issues);
    }

    function validateStructured(toolPath, input, context = {}) {
        if (toolPath === TOOL_PATHS.swot) return validateSwot(input);
        if (toolPath === TOOL_PATHS.landscape) return validateLandscape(input);
        if (toolPath === TOOL_PATHS.businessModel) return validateBusinessModel(input);
        if (toolPath === TOOL_PATHS.valueProposition) return validateValueProposition(input);
        if (toolPath === TOOL_PATHS.okr) return validateOkr(input);
        if (toolPath === TOOL_PATHS.roadmap) return validateRoadmap(input, context);
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

    function item(statement) {
        return [{ item: text(statement) }];
    }

    function businessModelFromPage({ snapshot }) {
        return {
            customerSegment: snapshot.bmc_customer_segment,
            blocks: {
                partners: item(snapshot.bmc_partners),
                activities: item(snapshot.bmc_activities),
                resources: item(snapshot.bmc_resources),
                valuePropositions: item(snapshot.bmc_value),
                relationships: item(snapshot.bmc_relationships),
                channels: item(snapshot.bmc_channels),
                customerSegments: item(snapshot.bmc_segments),
                costStructure: [{ item: text(snapshot.bmc_costs), basis: text(snapshot.bmc_cost_basis) }],
                revenueStreams: [{ item: text(snapshot.bmc_revenue), basis: text(snapshot.bmc_revenue_basis) }],
            },
            dependencies: text(snapshot.bmc_dependencies) ? [snapshot.bmc_dependencies] : [],
            contradictions: text(snapshot.bmc_contradictions) ? [snapshot.bmc_contradictions] : [],
            riskiestAssumption: snapshot.bmc_riskiest_assumption,
        };
    }

    function valuePropositionFromPage({ snapshot }) {
        const jobId = text(snapshot.vpc_job_id);
        const painId = text(snapshot.vpc_pain_id);
        const gainId = text(snapshot.vpc_gain_id);
        return {
            customerSegment: snapshot.customer_segment,
            jobs: [{ id: jobId, statement: text(snapshot.customer_jobs), rank: Number(snapshot.vpc_job_rank) }],
            pains: [{ id: painId, statement: text(snapshot.customer_pains), rank: Number(snapshot.vpc_pain_rank) }],
            gains: [{ id: gainId, statement: text(snapshot.customer_gains), rank: Number(snapshot.vpc_gain_rank) }],
            responses: [
                { id: 'response-pain', statement: text(snapshot.pain_relievers), mapsTo: snapshot.vpc_pain_response_target },
                { id: 'response-gain', statement: text(snapshot.gain_creators), mapsTo: snapshot.vpc_gain_response_target },
            ],
            fitLinks: [{ responseId: 'response-pain', customerItemId: snapshot.vpc_fit_customer_item, evidenceId: snapshot.vpc_fit_evidence_id }],
            chosenPromise: snapshot.vpc_chosen_promise,
            unresolvedMismatch: snapshot.vpc_unresolved_mismatch,
        };
    }

    function okrFromPage({ snapshot }) {
        return {
            customerSegment: snapshot.okr_customer_segment,
            objective: snapshot.okr_objective,
            strategyLink: snapshot.okr_strategy_link,
            keyResults: [1, 2].map(index => ({
                id: snapshot[`okr_kr_${index}_id`],
                statement: snapshot[`okr_kr_${index}_statement`],
                kind: snapshot[`okr_kr_${index}_kind`],
                baseline: snapshot[`okr_kr_${index}_baseline`],
                target: snapshot[`okr_kr_${index}_target`],
                unit: snapshot[`okr_kr_${index}_unit`],
                dueDate: snapshot[`okr_kr_${index}_due_date`],
                owner: snapshot[`okr_kr_${index}_owner`],
                source: snapshot[`okr_kr_${index}_source`],
            })),
        };
    }

    function roadmapFromPage({ snapshot }) {
        return {
            initiatives: [1, 2].map(index => ({
                id: snapshot[`roadmap_${index}_id`],
                name: snapshot[`roadmap_${index}_name`],
                outcomeLink: snapshot[`roadmap_${index}_outcome_link`],
                owner: snapshot[`roadmap_${index}_owner`],
                dependencies: text(snapshot[`roadmap_${index}_dependencies`]).split(',').map(text).filter(Boolean),
                startDate: snapshot[`roadmap_${index}_start_date`],
                endDate: snapshot[`roadmap_${index}_end_date`],
                decisionGate: snapshot[`roadmap_${index}_decision_gate`],
            })),
        };
    }

    function validateHandoff({ toolPath, snapshot, evidence, summary, upstreamHandoff }) {
        if (toolPath === TOOL_PATHS.swot) return validateSwot(swotFromPage({ snapshot, evidence }));
        if (toolPath === TOOL_PATHS.landscape) return validateLandscape(landscapeFromPage({ snapshot, summary }));
        if (toolPath === TOOL_PATHS.businessModel) return validateBusinessModel(businessModelFromPage({ snapshot }));
        if (toolPath === TOOL_PATHS.valueProposition) {
            const issues = validateValueProposition(valuePropositionFromPage({ snapshot }));
            const upstreamSegment = text(upstreamHandoff?.snapshot?.bmc_customer_segment);
            if (upstreamSegment && upstreamSegment !== text(snapshot.customer_segment)) issues.push(issue('segment_mismatch'));
            return unique(issues);
        }
        if (toolPath === TOOL_PATHS.okr) {
            const issues = validateOkr(okrFromPage({ snapshot }));
            const upstreamSegment = text(upstreamHandoff?.snapshot?.customer_segment);
            if (upstreamSegment && upstreamSegment !== text(snapshot.okr_customer_segment)) issues.push(issue('segment_mismatch'));
            return unique(issues);
        }
        if (toolPath === TOOL_PATHS.roadmap) {
            const krIds = [1, 2].map(index => text(upstreamHandoff?.snapshot?.[`okr_kr_${index}_id`])).filter(Boolean);
            return validateRoadmap(roadmapFromPage({ snapshot }), { krIds });
        }
        return [];
    }

    window.ModiqiWorkflow01Rules = Object.freeze({
        TOOL_PATHS,
        validateStructured,
        validateHandoff,
    });
})();
