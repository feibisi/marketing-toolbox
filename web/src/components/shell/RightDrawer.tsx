import { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { ENTITY_TYPE_META } from '../../core/schema/entities';
import type { EvidenceKind, EvidenceStatus, ProjectBundle } from '../../core/schema/project';
import type { ToolCatalogItem } from '../../core/catalog/workflows';

interface RightDrawerProps {
  open: boolean;
  tool?: ToolCatalogItem;
  bundle: ProjectBundle;
  onClose: () => void;
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
  bundle,
  onClose,
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

  const toolEvidences = tool
    ? bundle.evidences.filter((ev) => ev.toolId === tool.id)
    : bundle.evidences;

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
          <h2>纸外工作台抽屉</h2>
          <button type="button" className="toolbar-btn" onClick={onClose} aria-label="关闭抽屉">
            <X size={16} />
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
            证据与校验 ({toolEvidences.length})
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
                <strong style={{ fontSize: '0.82rem' }}>新增证据 / 假设记录（不占用纸面）</strong>
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
                    placeholder="关联字段（如 revenue）"
                    value={fieldPath}
                    onChange={(e) => setFieldPath(e.target.value)}
                  />
                </div>
                <input
                  className="drawer-input"
                  placeholder="来源说明或链接（事实类建议必填）"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
                <button type="submit" className="drawer-submit-btn">
                  记入证据台账
                </button>
              </form>

              {toolEvidences.length === 0 ? (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-tertiary)' }}>
                  当前工具还没有单独挂载证据条目。你可以直接先在纸上写，随时在此补记依据来源。
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
                            className="toolbar-btn"
                            title="人审确认为事实"
                            onClick={() => onUpdateEvidenceStatus(ev.id, 'confirmed', 'fact')}
                          >
                            <Check size={14} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="toolbar-btn danger"
                          title="删除"
                          onClick={() => onDeleteEvidence(ev.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>{ev.statement}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-tertiary)' }}>
                      来源：{ev.source || '未填写'} · 状态：{ev.status === 'confirmed' ? '已确认' : '草稿'}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : null}

          {tab === 'graph' ? (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                你在画布上编辑的内容会自动在后台同步到以下核心业务实体，供下游画布和总报告复用。
              </div>
              {bundle.entities.map((ent) => (
                <div className="drawer-card" key={ent.id}>
                  <div className="drawer-card-head">
                    <span className="drawer-badge">{ENTITY_TYPE_META[ent.entityType].label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>v{ent.version}</span>
                  </div>
                  <strong style={{ fontSize: '0.88rem' }}>{ent.title}</strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                    {ent.summary || '待补充摘要'}
                  </div>
                </div>
              ))}

              {bundle.decisions.length > 0 ? (
                <>
                  <strong style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>关键决策台账</strong>
                  {bundle.decisions.map((dec) => (
                    <div className="drawer-card" key={dec.id}>
                      <strong style={{ fontSize: '0.86rem' }}>{dec.title}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{dec.decision}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                        拍板人：{dec.decidedBy || '未署名'} · {dec.decidedAt}
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </>
          ) : null}

          {tab === 'copilot' ? (
            <div className="drawer-card">
              <strong style={{ fontSize: '0.9rem' }}>AI 营销副驾（P4 接入池化网关）</strong>
              <p style={{ margin: 0, fontSize: '0.83rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                本抽屉已为 P4 留好独立位置，严守「不占纸面、不伪造事实」原则：
              </p>
              <ul style={{ margin: '0.25rem 0', paddingLeft: '1.1rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
                <li>结构化起草：按当前工具 Schema 输出建议，填入后强制标为「待验证假设」</li>
                <li>逻辑挑刺评审：对照上游实体检查缺口、矛盾与未量化项</li>
                <li>走集群池化网关并记录用量账本，不占用单机个人 OIDC 席位</li>
              </ul>
              {tool ? (
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-tertiary)', marginTop: '0.3rem' }}>
                  当前工具实体绑定：读 [{tool.readsEntities.join(', ') || '无'}] → 写 [
                  {tool.writesEntities.join(', ') || '无'}]
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
