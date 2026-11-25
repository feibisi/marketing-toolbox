import { useState } from 'react';
import {
  BarChart2,
  Briefcase,
  FileText,
  FolderKanban,
  LayoutGrid,
  Monitor,
  Moon,
  Palette,
  Rocket,
  Smartphone,
  Sun,
  UserCheck,
} from 'lucide-react';
import { ALL_TOOLS, WORKFLOWS } from '../core/catalog/workflows';
import type { EvidenceKind, EvidenceStatus, ProjectBundle, WorkbenchTheme } from '../core/schema/project';
import { WorkflowMiniPreview } from '../components/primitives/MiniSvgPreviews';
import { RightDrawer } from '../components/shell/RightDrawer';

interface HomePageProps {
  projects: ProjectBundle[];
  activeBundle: ProjectBundle;
  theme: WorkbenchTheme;
  drawerOpen: boolean;
  onCycleTheme: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
  onOpenWorkflow: (workflowId: string) => void;
  onAddEvidence: (input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string }) => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

function WorkflowCornerIcon({ id }: { id: string }) {
  const props = { size: 22, className: 'paper-icon' };
  switch (id) {
    case 'strategy-alignment':
      return <Rocket {...props} />;
    case 'audience-positioning':
      return <UserCheck {...props} />;
    case 'brand-narrative':
      return <Palette {...props} />;
    case 'content-operations':
      return <FileText {...props} />;
    case 'go-to-market':
      return <Briefcase {...props} />;
    default:
      return <BarChart2 {...props} />;
  }
}

export function HomePage({
  projects,
  activeBundle,
  theme,
  drawerOpen,
  onCycleTheme,
  onSelectProject,
  onCreateProject,
  onToggleDrawer,
  onOpenWorkflow,
  onAddEvidence,
  onUpdateEvidenceStatus,
  onDeleteEvidence,
}: HomePageProps) {
  const [widescreen, setWidescreen] = useState(false);

  return (
    <>
      <div className="desk-backdrop launcher-desk" aria-hidden="true" />

      <div className="launcher-page">
        <div className={`launcher-container ${widescreen ? 'is-widescreen' : ''}`}>
          <header className="launcher-header">
            <div className="hero-left">
              <div className="title-row">
                <h1 className="brand-title">莫蒂奇数字营销工作台</h1>
                <span className="version-tag">{ALL_TOOLS.length} CORE TOOLS</span>

                <button
                  type="button"
                  className="header-icon-btn"
                  onClick={onCycleTheme}
                  title="切换主题"
                  aria-label="切换主题"
                >
                  {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                </button>

                <button
                  type="button"
                  className="header-icon-btn"
                  onClick={() => setWidescreen((v) => !v)}
                  title={widescreen ? '切换标准宽度' : '切换宽屏模式'}
                  aria-label="切换宽屏模式"
                >
                  {widescreen ? <Smartphone size={14} /> : <Monitor size={14} />}
                </button>

                <button
                  type="button"
                  className="mode-switch-btn"
                  onClick={() => onOpenWorkflow('all')}
                  title="进入全部工具蓝图目录"
                >
                  <LayoutGrid size={14} />
                  <span>工具蓝图</span>
                </button>

                <button
                  type="button"
                  className="mode-switch-btn is-outline"
                  onClick={onToggleDrawer}
                  title="查看当前项目、证据与业务图谱"
                >
                  <FolderKanban size={14} />
                  <span>{activeBundle.project.name}</span>
                </button>
              </div>
              <p className="brand-subtitle">Modiqi Digital Marketing Workbench Collection · v3</p>
            </div>

            <div className="hero-right">
              <img src="./images/modiqi-logo-r.png" alt="Modiqi" className="hero-logo" />
            </div>
          </header>

          <main className="launcher-grid">
            {WORKFLOWS.map((wf) => {
              const readyCount = wf.tools.filter((t) => t.status === 'ready').length;
              return (
                <button
                  type="button"
                  key={wf.id}
                  className="stacked-card"
                  onClick={() => onOpenWorkflow(wf.id)}
                >
                  <WorkflowCornerIcon id={wf.id} />
                  <div className="mini-preview">
                    <div className={`card-badge ${readyCount > 0 ? 'has-ready' : ''}`}>
                      {readyCount > 0 ? `${wf.tools.length} 工具 · ${readyCount} 可用` : `${wf.tools.length} 工具`}
                    </div>
                    <WorkflowMiniPreview id={wf.id} />
                  </div>
                  <div className="card-meta">
                    <h2 className="card-title">
                      {wf.name}工作台 <span className="en-sub">({wf.enName})</span>
                    </h2>
                    <p className="card-desc">{wf.summary}</p>
                  </div>
                </button>
              );
            })}
          </main>

          <footer className="site-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Modiqi Digital Marketing Workbench © 2026</span>
              <span className="version-tag">v3.0-p0</span>
            </div>
            <div>业务实体 {activeBundle.entities.length} · 证据条目 {activeBundle.evidences.length}</div>
          </footer>
        </div>
      </div>

      <RightDrawer
        open={drawerOpen}
        projects={projects}
        bundle={activeBundle}
        onClose={onToggleDrawer}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
        onAddEvidence={onAddEvidence}
        onUpdateEvidenceStatus={onUpdateEvidenceStatus}
        onDeleteEvidence={onDeleteEvidence}
      />
    </>
  );
}
