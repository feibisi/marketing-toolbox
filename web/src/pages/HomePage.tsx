import { ArrowRight, Layers, Plus } from 'lucide-react';
import { ALL_TOOLS, WORKFLOWS, type ToolCatalogItem } from '../core/catalog/workflows';
import type { EvidenceKind, EvidenceStatus, ProjectBundle } from '../core/schema/project';
import { TopBar } from '../components/shell/TopBar';
import { RightDrawer } from '../components/shell/RightDrawer';

interface HomePageProps {
  projects: ProjectBundle[];
  activeBundle: ProjectBundle;
  drawerOpen: boolean;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
  onOpenTool: (toolId: string) => void;
  onAddEvidence: (input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string }) => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

const CONTAINER_LABELS: Record<ToolCatalogItem['container'], string> = {
  'fixed-canvas': '固定画布',
  worksheet: '连续工作表',
  calculator: '实时计算器',
  report: '项目总报告',
};

export function HomePage({
  projects,
  activeBundle,
  drawerOpen,
  onSelectProject,
  onCreateProject,
  onToggleDrawer,
  onOpenTool,
  onAddEvidence,
  onUpdateEvidenceStatus,
  onDeleteEvidence,
}: HomePageProps) {
  const readyTools = ALL_TOOLS.filter((t) => t.status === 'ready');
  const savedDocCount = Object.keys(activeBundle.documents).length;

  return (
    <>
      <div className="desk-backdrop home-desk" aria-hidden="true" />
      <TopBar
        projects={projects}
        activeProjectId={activeBundle.project.id}
        drawerOpen={drawerOpen}
        evidenceCount={activeBundle.evidences.length}
        entityCount={activeBundle.entities.length}
        onGoHome={() => undefined}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
        onToggleDrawer={onToggleDrawer}
      />

      <main className="home-container">
        <section className="home-hero">
          <div>
            <div className="home-eyebrow">MODIQI MARKETING TOOLBOX · V3</div>
            <h1>莫蒂奇数字营销工作台</h1>
            <p>
              围绕营销、业务转化与销售成交重构的纸张级专业工作台。打开纸面即可直接书写，底层 8 类企业营销实体与证据台账在后台静默联动，支持单色高清打印与多项目管理。
            </p>
          </div>

          <div className="home-project-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-text-tertiary)' }}>当前活动项目</span>
              <button type="button" className="topbar-btn" onClick={onCreateProject}>
                <Plus size={13} />
                <span>新建</span>
              </button>
            </div>
            <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{activeBundle.project.name}</strong>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {activeBundle.project.objective || '直接进入任意画布开始记录，数据自动保存在本地浏览器。'}
            </div>
            <div className="home-project-stats">
              <div className="home-stat-item">
                <span className="home-stat-num">{activeBundle.entities.length}</span>
                <span className="home-stat-label">业务实体</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-num">{activeBundle.evidences.length}</span>
                <span className="home-stat-label">证据条目</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-num">{savedDocCount}</span>
                <span className="home-stat-label">已填画布</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="home-section-head">
            <h2>P0 标杆样板工具（立即可用 · 覆盖 3 类核心容器）</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
              点击直接打开纸面编辑，无需前置配置
            </span>
          </div>

          <div className="benchmark-grid">
            {readyTools.map((tool) => (
              <button
                type="button"
                key={tool.id}
                className="tool-card is-ready"
                onClick={() => onOpenTool(tool.id)}
              >
                <div className="tool-card-top">
                  <span className="tool-card-tag ready">可直接使用 · {CONTAINER_LABELS[tool.container]}</span>
                  <ArrowRight size={16} />
                </div>
                <h3>
                  {tool.name}
                  <span className="en-sub">{tool.enName}</span>
                </h3>
                <p>{tool.summary}</p>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-tertiary)' }}>
                  自动同步实体：{tool.writesEntities.join(', ')}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="home-section-head">
            <h2>
              <Layers size={18} style={{ verticalAlign: '-3px', marginRight: '0.45rem' }} />6 条核心工作流 × 30 个核心工具全景
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
              已交付 {readyTools.length} / {ALL_TOOLS.length}（P1/P2 按同套容器与 Schema 并行补齐）
            </span>
          </div>

          <div className="workflow-list">
            {WORKFLOWS.map((wf) => (
              <div className="workflow-block" key={wf.id}>
                <div className="workflow-block-head">
                  <h3>
                    0{wf.order}. {wf.name}
                    <span className="en-sub">{wf.enName}</span>
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{wf.summary}</span>
                </div>

                <div className="workflow-tools-grid">
                  {wf.tools.map((tool) => {
                    const isReady = tool.status === 'ready';
                    return (
                      <button
                        type="button"
                        key={tool.id}
                        disabled={!isReady}
                        className={`tool-card ${isReady ? 'is-ready' : 'is-planned'}`}
                        onClick={() => {
                          if (isReady) onOpenTool(tool.id);
                        }}
                      >
                        <div className="tool-card-top">
                          <span className={`tool-card-tag ${isReady ? 'ready' : ''}`}>
                            {isReady ? `${tool.phase} · 已上线` : `${tool.phase} · 排期中`}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                            {CONTAINER_LABELS[tool.container]}
                          </span>
                        </div>
                        <h3>{tool.name}</h3>
                        <p>{tool.summary}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <RightDrawer
        open={drawerOpen}
        bundle={activeBundle}
        onClose={onToggleDrawer}
        onAddEvidence={onAddEvidence}
        onUpdateEvidenceStatus={onUpdateEvidenceStatus}
        onDeleteEvidence={onDeleteEvidence}
      />
    </>
  );
}
