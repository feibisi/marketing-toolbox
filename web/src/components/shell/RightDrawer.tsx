import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { ENTITY_TYPE_META } from '../../core/schema/entities';
import type { EvidenceKind, EvidenceStatus, ProjectBundle } from '../../core/schema/project';
import type { ToolCatalogItem } from '../../core/catalog/workflows';

interface RightDrawerProps {
  open: boolean;
  tool?: ToolCatalogItem;
  projects: ProjectBundle[];
  bundle: ProjectBundle;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onAddEvidence: (input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string }) => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

type DrawerTab = 'evidence' | 'graph' | 'copilot';

const KIND_LABELS: Record<EvidenceKind, string> = {
  fact: '已核实事实',
  assumption: '待验证假设',
  to_verify: '待补充查证',
};

export function RightDrawer({
  open,
  tool,
  projects,
  bundle,
  onClose,
  onSelectProject,
  onCreateProject,
  onAddEvidence,
  onUpdateEvidenceStatus,
  onDeleteEvidence,
}: RightDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('evidence');
  const [statement, setStatement] = useState('');
  const [kind, setKind] = useState<EvidenceKind>('assumption');
  const [source, setSource] = useState('');
  const [fieldPath, setFieldPath] = useState('general');

  if (!open) return null;

  const toolEvidences = tool ? bundle.evidences.filter((ev) => ev.toolId === tool.id) : bundle.evidences;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;
    onAddEvidence({
      toolId: tool?.id ?? 'project',
      fieldPath,
      statement,
      kind,
      source,
    });
    setStatement('');
    setSource('');
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="workbench-drawer" aria-label="纸外工作台抽屉">
        <div className="drawer-header">
          <h2>项目与证据抽屉</h2>
          <button type="button" className="header-icon-btn" onClick={onClose} aria-label="关闭抽屉">
            <X size={15} />
          </button>
        </div>

        <div className="drawer-project-bar">
          <select
            className="drawer-project-select"
            aria-label="切换当前项目"
            value={bundle.project.id}
            onChange={(e) => onSelectProject(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.project.id} value={p.project.id}>
                {p.project.name}
              </option>
            ))}
          </select>
          <button type="button" className="header-icon-btn" onClick={onCreateProject} title="新建项目">
            <Plus size={14} />
          </button>
        </div>

        <div className="drawer-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'evidence'}
            className={`drawer-tab ${tab === 'evidence' ? 'is-active' : ''}`}
            onClick={() => setTab('evidence')}
          >
            证据 ({toolEvidences.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'graph'}
            className={`drawer-tab ${tab === 'graph' ? 'is-active' : ''}`}
            onClick={() => setTab('graph')}
          >
            业务图谱 ({bundle.entities.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'copilot'}
            className={`drawer-tab ${tab === 'copilot' ? 'is-active' : ''}`}
            onClick={() => setTab('copilot')}
          >
            AI 副驾
          </button>
        </div>

        <div className="drawer-body">
          {tab === 'evidence' ? (
            <>
              <form className="drawer-form" onSubmit={handleSubmit}>
                <strong style={{ fontSize: '0.8rem' }}>新增证据 / 假设（不占用纸面）</strong>
                <textarea
                  className="drawer-textarea"
                  rows={2}
                  placeholder="写下需要核验或已证实的结论/数据..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  <select
                    className="drawer-select"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as EvidenceKind)}
                    aria-label="证据类型"
                  >
                    <option value="fact">事实 (Fact)</option>
                    <option value="assumption">假设 (Assumption)</option>
                    <option value="to_verify">待验证 (To Verify)</option>
                  </select>
                  <input
                    className="drawer-input"
                    placeholder="字段（如 revenue）"
                    value={fieldPath}
                    onChange={(e) => setFieldPath(e.target.value)}
                  />
                </div>
                <input
                  className="drawer-input"
                  placeholder="来源说明或链接"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
                <button type="submit" className="drawer-submit-btn">
                  记入证据台账
                </button>
              </form>

              {toolEvidences.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)' }}>
                  当前工具暂无证据条目，可直接在纸上书写，随时在此补充来源。
                </p>
              ) : (
                toolEvidences.map((ev) => (
                  <div className="drawer-card" key={ev.id}>
                    <div className="drawer-card-head">
                      <span className={`drawer-badge ${ev.kind}`}>{KIND_LABELS[ev.kind]}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {ev.status !== 'confirmed' ? (
                          <button
                            type="button"
                            className="header-icon-btn"
                            title="确认为事实"
                            onClick={() => onUpdateEvidenceStatus(ev.id, 'confirmed', 'fact')}
                          >
                            <Check size={13} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="header-icon-btn"
                          title="删除"
                          onClick={() => onDeleteEvidence(ev.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>{ev.statement}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--color-text-tertiary)' }}>
                      来源：{ev.source || '未填写'} · {ev.status === 'confirmed' ? '已确认' : '草稿'}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : null}

          {tab === 'graph' ? (
            <>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                纸面编辑内容自动沉淀到以下核心业务实体，供同项目下游画布与总报告复用。
              </div>
              {bundle.entities.map((ent) => (
                <div className="drawer-card" key={ent.id}>
                  <div className="drawer-card-head">
                    <span className="drawer-badge">{ENTITY_TYPE_META[ent.entityType].label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>v{ent.version}</span>
                  </div>
                  <strong style={{ fontSize: '0.86rem' }}>{ent.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                    {ent.summary || '待补充摘要'}
                  </div>
                </div>
              ))}
              {bundle.decisions.map((dec) => (
                <div className="drawer-card" key={dec.id}>
                  <span className="drawer-badge">决策拍板</span>
                  <strong style={{ fontSize: '0.84rem' }}>{dec.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{dec.decision}</div>
                </div>
              ))}
            </>
          ) : null}

          {tab === 'copilot' ? (
            <div className="drawer-card">
              <strong style={{ fontSize: '0.88rem' }}>AI 营销副驾（P4 接入池化网关）</strong>
              <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                AI 起草内容强制标为「待验证假设」，经人确认才进入正式报告事实。
              </p>
              {tool ? (
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-tertiary)' }}>
                  实体绑定：读 [{tool.readsEntities.join(', ')}] → 写 [{tool.writesEntities.join(', ')}]
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
