import { describe, expect, it } from 'vitest';
import { LocalProjectRepository, type KeyValueStorage } from '../src/core/storage/localRepository';

function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, val) => {
      map.set(key, val);
    },
  };
}

describe('LocalProjectRepository (3-layer schema + zero-friction storage)', () => {
  it('bootstraps a default project immediately with canonical entities and evidences', () => {
    const repo = new LocalProjectRepository(createMemoryStorage());
    const bundle = repo.getActiveBundle();

    expect(bundle.project.name).toBe('莫蒂奇实战工作区');
    expect(bundle.entities.length).toBeGreaterThanOrEqual(2);
    expect(bundle.evidences.length).toBeGreaterThanOrEqual(2);
  });

  it('auto-syncs canonical business entity when saving a tool document', () => {
    const repo = new LocalProjectRepository(createMemoryStorage());
    const initial = repo.getActiveBundle();

    const updated = repo.saveToolDocument(
      initial.project.id,
      'roi-calculator',
      { revenue: 280000, adSpend: 32000 },
      {
        entityType: 'funnel_metric',
        slug: 'campaign-roi',
        title: '薇晓朵企服转化试投放',
        summary: 'ROI 409.1%',
        payload: { revenue: 280000, roiPercent: 409.1 },
      },
    );

    expect(updated.documents['roi-calculator']).toBeDefined();
    const funnelEnt = updated.entities.find((e) => e.entityType === 'funnel_metric');
    expect(funnelEnt).toBeDefined();
    expect(funnelEnt?.summary).toBe('ROI 409.1%');
    expect(updated.documents['roi-calculator'].entityRefs).toContain(funnelEnt?.id);
  });

  it('exports and imports .modiqi.json cleanly as a new isolated project', () => {
    const repo = new LocalProjectRepository(createMemoryStorage());
    const first = repo.getActiveBundle();
    repo.addEvidence(first.project.id, {
      toolId: 'swot-analysis',
      fieldPath: 'conclusion',
      statement: '首季聚焦 3 个试点客户验证重构交付',
      kind: 'assumption',
      source: '2026-11 战略会',
    });

    const exported = repo.exportProjectJson(first.project.id);
    const nextStore = repo.importProjectJson(exported);
    const projectIds = Object.keys(nextStore.projects);

    expect(projectIds.length).toBe(2);
    expect(nextStore.activeProjectId).not.toBe(first.project.id);
    expect(nextStore.projects[nextStore.activeProjectId].evidences.length).toBe(first.evidences.length + 1);
  });
});
