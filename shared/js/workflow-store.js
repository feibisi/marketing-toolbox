(() => {
    'use strict';

    const KEY = 'modiqi_workflow_handoffs_v1';
    const SCHEMA_VERSION = 1;
    const STATUSES = new Set(['draft', 'ready']);

    function text(value, maxLength = 2000) {
        return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
    }

    function read() {
        try {
            const value = JSON.parse(localStorage.getItem(KEY) || '{}');
            return value && typeof value === 'object' ? value : {};
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
        if (create) {
            root[projectId] ||= {};
            root[projectId][workflowId] ||= {};
        }
        return { root, bucket: root[projectId]?.[workflowId] || null };
    }

    function normalize(raw, previous = {}) {
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
            snapshot: raw.snapshot && typeof raw.snapshot === 'object' ? raw.snapshot : {},
            status: STATUSES.has(raw.status) ? raw.status : 'draft',
            createdAt: previous.createdAt || now,
            updatedAt: now,
        };
    }

    function save(raw) {
        if (!raw.projectId || !raw.workflowId || !raw.sourceTool) throw new Error('项目、工作流和来源工具不能为空。');
        const state = projectBucket(raw.projectId, raw.workflowId, true);
        const previous = state.bucket[raw.sourceTool] || {};
        const record = normalize(raw, previous);
        state.bucket[raw.sourceTool] = record;
        write(state.root);
        return record;
    }

    function get(projectId, workflowId, sourceTool) {
        return projectBucket(projectId, workflowId).bucket?.[sourceTool] || null;
    }

    function saveAdoption({ projectId, workflowId, targetTool, sourceTool, note }) {
        const state = projectBucket(projectId, workflowId, true);
        state.bucket._adoptions ||= {};
        state.bucket._adoptions[targetTool] = {
            sourceTool: text(sourceTool, 240),
            note: text(note, 2000),
            adoptedAt: new Date().toISOString(),
        };
        write(state.root);
        return state.bucket._adoptions[targetTool];
    }

    function getAdoption(projectId, workflowId, targetTool) {
        return projectBucket(projectId, workflowId).bucket?._adoptions?.[targetTool] || null;
    }

    window.ModiqiWorkflowStore = Object.freeze({ KEY, SCHEMA_VERSION, save, get, saveAdoption, getAdoption });
})();
