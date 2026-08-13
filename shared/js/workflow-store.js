(() => {
    'use strict';

    const KEY = 'modiqi_workflow_handoffs_v1';
    const SCHEMA_VERSION = 1;
    const STATUSES = new Set(['draft', 'ready']);

    function isRecord(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function text(value, maxLength = 2000) {
        return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
    }

    function storageKey(value, maxLength) {
        return `key:${encodeURIComponent(text(value, maxLength))}`;
    }

    function cleanSnapshot(raw) {
        if (!isRecord(raw)) return {};
        return Object.fromEntries(Object.entries(raw).slice(0, 200).map(([key, value]) => [
            text(key, 120),
            text(value, 1000),
        ]).filter(([key]) => key));
    }

    function read() {
        try {
            const value = JSON.parse(localStorage.getItem(KEY) || '{}');
            return isRecord(value) ? value : {};
        } catch (error) {
            console.error('Invalid workflow handoff data', error);
            return {};
        }
    }

    function write(value) {
        localStorage.setItem(KEY, JSON.stringify(value));
        return value;
    }

    function projectBucket(projectId, workflowId, create = false) {
        const root = read();
        const projectKey = storageKey(projectId, 120);
        const workflowKey = storageKey(workflowId, 120);
        if (create) {
            if (!isRecord(root[projectKey])) root[projectKey] = {};
            if (!isRecord(root[projectKey][workflowKey])) root[projectKey][workflowKey] = {};
        }
        const bucket = root[projectKey]?.[workflowKey];
        return { root, bucket: isRecord(bucket) ? bucket : null };
    }

    function normalize(raw, previous = {}, touch = true) {
        const now = new Date().toISOString();
        return {
            schemaVersion: SCHEMA_VERSION,
            workflowId: text(raw.workflowId, 120),
            projectId: text(raw.projectId, 120),
            sourceTool: text(raw.sourceTool, 240),
            targetTool: text(raw.targetTool, 240),
            summary: text(raw.summary, 2000),
            unresolvedRisk: text(raw.unresolvedRisk, 1000),
            owner: text(raw.owner, 120),
            reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(raw.reviewDate || '') ? raw.reviewDate : '',
            evidenceIds: [...new Set(Array.isArray(raw.evidenceIds) ? raw.evidenceIds.map(value => text(value, 120)).filter(Boolean) : [])],
            snapshot: cleanSnapshot(raw.snapshot),
            status: STATUSES.has(raw.status) ? raw.status : 'draft',
            createdAt: previous.createdAt || now,
            updatedAt: touch ? now : text(raw.updatedAt, 40) || previous.updatedAt || now,
        };
    }

    function save(raw) {
        const candidate = normalize(raw);
        if (!candidate.projectId || !candidate.workflowId || !candidate.sourceTool) throw new Error('项目、工作流和来源工具不能为空。');
        const state = projectBucket(candidate.projectId, candidate.workflowId, true);
        const sourceKey = storageKey(candidate.sourceTool, 240);
        const previous = isRecord(state.bucket[sourceKey]) ? state.bucket[sourceKey] : {};
        const record = normalize(candidate, previous);
        state.bucket[sourceKey] = record;
        write(state.root);
        return record;
    }

    function get(projectId, workflowId, sourceTool) {
        const record = projectBucket(projectId, workflowId).bucket?.[storageKey(sourceTool, 240)] || null;
        return isRecord(record) ? normalize(record, record, false) : null;
    }

    function saveAdoption({ projectId, workflowId, targetTool, sourceTool, note }) {
        const normalizedProjectId = text(projectId, 120);
        const normalizedWorkflowId = text(workflowId, 120);
        const normalizedTargetTool = text(targetTool, 240);
        const normalizedSourceTool = text(sourceTool, 240);
        if (!normalizedProjectId || !normalizedWorkflowId || !normalizedTargetTool || !normalizedSourceTool) {
            throw new Error('项目、工作流、目标工具和来源工具不能为空。');
        }
        const state = projectBucket(normalizedProjectId, normalizedWorkflowId, true);
        if (!isRecord(state.bucket._adoptions)) state.bucket._adoptions = {};
        const targetKey = storageKey(normalizedTargetTool, 240);
        state.bucket._adoptions[targetKey] = {
            sourceTool: normalizedSourceTool,
            note: text(note, 2000),
            adoptedAt: new Date().toISOString(),
        };
        write(state.root);
        return state.bucket._adoptions[targetKey];
    }

    function getAdoption(projectId, workflowId, targetTool) {
        return projectBucket(projectId, workflowId).bucket?._adoptions?.[storageKey(targetTool, 240)] || null;
    }

    window.ModiqiWorkflowStore = Object.freeze({ KEY, SCHEMA_VERSION, save, get, saveAdoption, getAdoption });
})();
