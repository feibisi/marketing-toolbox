(() => {
    'use strict';

    const KEY = 'modiqi_project_context_v2';
    const LEGACY_KEY = 'modiqi_project_context_v1';
    const STAGES = new Set(['discovery', 'strategy', 'execution', 'measurement']);
    const EVIDENCE_KINDS = new Set(['fact', 'assumption', 'to_verify']);
    const EVIDENCE_STATUSES = new Set(['draft', 'confirmed', 'rejected', 'needs_review']);

    function id(prefix) {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') return `${prefix}_${window.crypto.randomUUID()}`;
        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    function text(value, maxLength) {
        return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
    }

    function iso(value, fallback) {
        return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : fallback;
    }

    function normalizeEvidence(item, now = new Date().toISOString()) {
        if (!item || typeof item !== 'object') return null;
        const statement = text(item.statement, 500);
        const source = text(item.source, 500);
        if (!statement || !source) return null;
        const createdAt = iso(item.createdAt, now);
        return {
            id: text(item.id, 120) || id('evidence'),
            statement,
            kind: EVIDENCE_KINDS.has(item.kind) ? item.kind : 'to_verify',
            source,
            owner: text(item.owner, 120),
            reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(item.reviewDate || '') ? item.reviewDate : '',
            status: EVIDENCE_STATUSES.has(item.status) ? item.status : 'draft',
            toolPath: text(item.toolPath, 240),
            fieldKey: text(item.fieldKey, 120),
            createdAt,
            updatedAt: iso(item.updatedAt, createdAt),
        };
    }

    function normalize(raw = {}) {
        const now = new Date().toISOString();
        const createdAt = iso(raw.createdAt, now);
        return {
            schemaVersion: 2,
            id: text(raw.id, 120) || id('project'),
            name: text(raw.name, 120),
            owner: text(raw.owner, 120),
            brand: text(raw.brand, 120),
            objective: text(raw.objective, 240),
            constraints: text(raw.constraints, 2000),
            stage: STAGES.has(raw.stage) ? raw.stage : 'discovery',
            targetDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.targetDate || '') ? raw.targetDate : '',
            createdAt,
            updatedAt: iso(raw.updatedAt, createdAt),
            evidence: Array.isArray(raw.evidence) ? raw.evidence.map(item => normalizeEvidence(item, now)).filter(Boolean) : [],
        };
    }

    function read(key) {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); }
        catch (error) { console.error(`Invalid local project data: ${key}`, error); return null; }
    }

    function load() {
        const current = read(KEY);
        if (current) return normalize(current);
        const legacy = read(LEGACY_KEY);
        if (!legacy) return normalize();
        const migrated = normalize(legacy);
        localStorage.setItem(KEY, JSON.stringify(migrated));
        return migrated;
    }

    function save(raw) {
        const project = normalize(raw);
        if (!project.name) throw new Error('项目名称不能为空。');
        project.updatedAt = new Date().toISOString();
        localStorage.setItem(KEY, JSON.stringify(project));
        return project;
    }

    function addEvidence(raw) {
        const project = load();
        if (!project.name) throw new Error('请先保存项目。');
        const evidence = normalizeEvidence(raw);
        if (!evidence) throw new Error('证据陈述和来源不能为空。');
        project.evidence.push(evidence);
        return save(project);
    }

    function removeEvidence(evidenceId) {
        const project = load();
        project.evidence = project.evidence.filter(item => item.id !== evidenceId);
        return save(project);
    }

    window.ModiqiProjectStore = Object.freeze({ KEY, LEGACY_KEY, load, save, addEvidence, removeEvidence, normalize });
})();
