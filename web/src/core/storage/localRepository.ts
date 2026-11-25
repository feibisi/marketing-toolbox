import {
  ProjectBundleSchema,
  WorkspaceStoreSchema,
  type DecisionLog,
  type EvidenceItem,
  type EvidenceKind,
  type EvidenceStatus,
  type ProjectBundle,
  type ToolDocument,
  type WorkspaceStore,
} from '../schema/project';
import type { CanonicalEntity, EntityType } from '../schema/entities';

export const STORAGE_KEY = 'modiqi_toolbox_v3_workspace';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createUid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createDefaultProjectBundle(name = '莫蒂奇实战工作区', brand = '莫蒂奇'): ProjectBundle {
  const ts = nowIso();
  const projectId = createUid('proj');
  return {
    schemaVersion: '3.0',
    exportedAt: ts,
    project: {
      id: projectId,
      workspaceId: 'local-default',
      name,
      brand,
      owner: '营销团队',
      objective: '梳理定位、季度目标与投放 ROI，提升线索到成交转化率',
      stage: 'active',
      createdAt: ts,
      updatedAt: ts,
      version: 1,
    },
    entities: [
      {
        id: createUid('ent'),
        projectId,
        entityType: 'company_profile',
        slug: 'company-core',
        title: `${brand} · 公司与战略基线`,
        summary: '聚焦 B2B 与品牌企业营销增长、业务转化与销售成交',
        payload: {
          brandName: brand,
          stage: '增长转化期',
        },
        status: 'confirmed',
        updatedAt: ts,
        version: 1,
      },
      {
        id: createUid('ent'),
        projectId,
        entityType: 'offer',
        slug: 'core-offer',
        title: '高客单转化诊断与重构服务包',
        summary: '官网转化漏斗诊断（¥3K–8K）→ 品牌定位与销售重构（¥30K–80K）',
        payload: {
          tiers: ['转化诊断包', '战略与转化重构包', '季度陪跑'],
        },
        status: 'draft',
        updatedAt: ts,
        version: 1,
      },
    ],
    documents: {},
    evidences: [
      {
        id: createUid('ev'),
        projectId,
        toolId: 'swot-analysis',
        fieldPath: 'strengths',
        statement: '具备从策略定位到落地转化及 WordPress 生态技术交付的完整能力链',
        kind: 'fact',
        source: '内部公司资产盘点 2026-11',
        status: 'confirmed',
        owner: 'feibisi',
        reviewDate: '2026-11-25',
        updatedAt: ts,
      },
      {
        id: createUid('ev'),
        projectId,
        toolId: 'roi-calculator',
        fieldPath: 'revenue',
        statement: '首季转化诊断包预计带来 10 个付费诊断并转化 3 个重构客户',
        kind: 'assumption',
        source: 'Q1 预算测算模型（待实测）',
        status: 'draft',
        owner: 'modiqi',
        reviewDate: '2027-01-15',
        updatedAt: ts,
      },
    ],
    decisions: [
      {
        id: createUid('dec'),
        projectId,
        title: '不做低价代运营，聚焦高客单转化结果交付',
        decision: '以免费工作台引流 + 低门槛诊断包切入 + ¥30K–80K 重构包为主要收入来源',
        rationale: 'AI 时代软件本身廉价，真实转化结果与可审计业务图谱才构成长期壁垒',
        decidedBy: 'feibisi',
        decidedAt: '2026-11-25',
      },
    ],
  };
}

export class LocalProjectRepository {
  private storage: KeyValueStorage;

  constructor(storage?: KeyValueStorage) {
    if (storage) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      const mem = new Map<string, string>();
      this.storage = {
        getItem: (k) => mem.get(k) ?? null,
        setItem: (k, v) => {
          mem.set(k, v);
        },
      };
    }
  }

  loadStore(): WorkspaceStore {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = WorkspaceStoreSchema.safeParse(JSON.parse(raw));
        if (parsed.success && parsed.data.projects[parsed.data.activeProjectId]) {
          return parsed.data;
        }
      } catch {
        // Fallback to clean bootstrap if local JSON is corrupted
      }
    }
    const defaultBundle = createDefaultProjectBundle();
    const initial: WorkspaceStore = {
      schemaVersion: '3.0',
      activeProjectId: defaultBundle.project.id,
      projects: {
        [defaultBundle.project.id]: defaultBundle,
      },
    };
    this.saveStore(initial);
    return initial;
  }

  saveStore(store: WorkspaceStore): WorkspaceStore {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  }

  getActiveBundle(): ProjectBundle {
    const store = this.loadStore();
    return store.projects[store.activeProjectId];
  }

  createProject(name: string, brand: string, objective = ''): WorkspaceStore {
    const store = this.loadStore();
    const bundle = createDefaultProjectBundle(name.trim() || '未命名营销项目', brand.trim() || '新品牌');
    bundle.project.objective = objective.trim();
    bundle.evidences = [];
    bundle.decisions = [];
    store.projects[bundle.project.id] = bundle;
    store.activeProjectId = bundle.project.id;
    return this.saveStore(store);
  }

  switchProject(projectId: string): WorkspaceStore {
    const store = this.loadStore();
    if (store.projects[projectId]) {
      store.activeProjectId = projectId;
      return this.saveStore(store);
    }
    return store;
  }

  saveToolDocument(
    projectId: string,
    toolId: string,
    data: Record<string, unknown>,
    entitySync?: { entityType: EntityType; slug: string; title: string; summary: string; payload: Record<string, unknown> },
  ): ProjectBundle {
    const store = this.loadStore();
    const bundle = store.projects[projectId];
    if (!bundle) {
      throw new Error(`Project not found: ${projectId}`);
    }
    const ts = nowIso();
    const prevDoc = bundle.documents[toolId];
    const entityRefs = new Set(prevDoc?.entityRefs ?? []);

    if (entitySync) {
      const existingIdx = bundle.entities.findIndex(
        (e) => e.entityType === entitySync.entityType && e.slug === entitySync.slug,
      );
      if (existingIdx >= 0) {
        const prev = bundle.entities[existingIdx];
        const updated: CanonicalEntity = {
          ...prev,
          title: entitySync.title,
          summary: entitySync.summary,
          payload: { ...prev.payload, ...entitySync.payload },
          sourceToolId: toolId,
          updatedAt: ts,
          version: prev.version + 1,
        };
        bundle.entities[existingIdx] = updated;
        entityRefs.add(updated.id);
      } else {
        const created: CanonicalEntity = {
          id: createUid('ent'),
          projectId,
          entityType: entitySync.entityType,
          slug: entitySync.slug,
          title: entitySync.title,
          summary: entitySync.summary,
          payload: entitySync.payload,
          sourceToolId: toolId,
          status: 'draft',
          updatedAt: ts,
          version: 1,
        };
        bundle.entities.push(created);
        entityRefs.add(created.id);
      }
    }

    const nextDoc: ToolDocument = {
      id: prevDoc?.id ?? createUid('doc'),
      projectId,
      toolId,
      schemaVersion: 1,
      entityRefs: Array.from(entityRefs),
      data,
      status: 'draft',
      updatedAt: ts,
      version: (prevDoc?.version ?? 0) + 1,
    };

    bundle.documents[toolId] = nextDoc;
    bundle.project.updatedAt = ts;
    bundle.project.version += 1;
    bundle.exportedAt = ts;
    this.saveStore(store);
    return bundle;
  }

  addEvidence(
    projectId: string,
    input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string; owner?: string },
  ): ProjectBundle {
    const store = this.loadStore();
    const bundle = store.projects[projectId];
    if (!bundle) throw new Error(`Project not found: ${projectId}`);
    const ts = nowIso();
    const item: EvidenceItem = {
      id: createUid('ev'),
      projectId,
      toolId: input.toolId,
      fieldPath: input.fieldPath || 'general',
      statement: input.statement.trim(),
      kind: input.kind,
      source: input.source.trim(),
      status: input.kind === 'fact' && input.source.trim() ? 'confirmed' : 'draft',
      owner: input.owner ?? bundle.project.owner,
      reviewDate: ts.slice(0, 10),
      updatedAt: ts,
    };
    bundle.evidences.unshift(item);
    bundle.project.updatedAt = ts;
    this.saveStore(store);
    return bundle;
  }

  updateEvidenceStatus(projectId: string, evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind): ProjectBundle {
    const store = this.loadStore();
    const bundle = store.projects[projectId];
    if (!bundle) throw new Error(`Project not found: ${projectId}`);
    const ts = nowIso();
    bundle.evidences = bundle.evidences.map((ev) =>
      ev.id === evidenceId ? { ...ev, status, kind: kind ?? ev.kind, updatedAt: ts } : ev,
    );
    bundle.project.updatedAt = ts;
    this.saveStore(store);
    return bundle;
  }

  deleteEvidence(projectId: string, evidenceId: string): ProjectBundle {
    const store = this.loadStore();
    const bundle = store.projects[projectId];
    if (!bundle) throw new Error(`Project not found: ${projectId}`);
    bundle.evidences = bundle.evidences.filter((ev) => ev.id !== evidenceId);
    bundle.project.updatedAt = nowIso();
    this.saveStore(store);
    return bundle;
  }

  addDecision(projectId: string, input: { title: string; decision: string; rationale: string; decidedBy?: string }): ProjectBundle {
    const store = this.loadStore();
    const bundle = store.projects[projectId];
    if (!bundle) throw new Error(`Project not found: ${projectId}`);
    const ts = nowIso();
    const log: DecisionLog = {
      id: createUid('dec'),
      projectId,
      title: input.title.trim(),
      decision: input.decision.trim(),
      rationale: input.rationale.trim(),
      decidedBy: input.decidedBy ?? bundle.project.owner,
      decidedAt: ts.slice(0, 10),
    };
    bundle.decisions.unshift(log);
    bundle.project.updatedAt = ts;
    this.saveStore(store);
    return bundle;
  }

  exportProjectJson(projectId: string): string {
    const store = this.loadStore();
    const bundle = store.projects[projectId];
    if (!bundle) throw new Error(`Project not found: ${projectId}`);
    return JSON.stringify({ ...bundle, exportedAt: nowIso() }, null, 2);
  }

  importProjectJson(rawJson: string): WorkspaceStore {
    const parsed = ProjectBundleSchema.parse(JSON.parse(rawJson));
    const store = this.loadStore();
    const importedId = store.projects[parsed.project.id] ? createUid('proj') : parsed.project.id;
    const bundle: ProjectBundle = {
      ...parsed,
      project: {
        ...parsed.project,
        id: importedId,
        updatedAt: nowIso(),
      },
      entities: parsed.entities.map((e) => ({ ...e, projectId: importedId })),
      evidences: parsed.evidences.map((ev) => ({ ...ev, projectId: importedId })),
      decisions: parsed.decisions.map((d) => ({ ...d, projectId: importedId })),
      documents: Object.fromEntries(
        Object.entries(parsed.documents).map(([k, doc]) => [k, { ...doc, projectId: importedId }]),
      ),
    };
    store.projects[importedId] = bundle;
    store.activeProjectId = importedId;
    return this.saveStore(store);
  }
}
