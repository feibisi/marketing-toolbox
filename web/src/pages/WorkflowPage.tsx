import { useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  FolderKanban,
  LayoutGrid,
  Monitor,
  Moon,
  Smartphone,
  Sun,
  Target,
} from 'lucide-react';
import { ALL_TOOLS, getWorkflowById, type ToolCatalogItem } from '../core/catalog/workflows';
import type { EvidenceKind, EvidenceStatus, ProjectBundle, WorkbenchTheme } from '../core/schema/project';
import { ToolMiniPreview } from '../components/primitives/MiniSvgPreviews';
import { RightDrawer } from '../components/shell/RightDrawer';

interface WorkflowPageProps {
  workflowId: string;
  projects: ProjectBundle[];
  activeBundle: ProjectBundle;
  theme: WorkbenchTheme;
  drawerOpen: boolean;
  onCycleTheme: () => void;
  onGoHome: () => void;
  onOpenTool: (toolId: string) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
  onAddEvidence: (input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string }) => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

function StampIcon({ container }: { container: ToolCatalogItem['container'] }) {
  const props = { size: 18, className: 'paper-icon' };
  if (container === 'calculator') return <Calculator {...props} />;
  if (container === 'worksheet') return <Target {...props} />;
  return <LayoutGrid {...props} />;
}

const BADGE_MAP: Record<ToolCatalogItem['container'], string> = {
  'fixed-canvas': '画布',
  worksheet: '工作表',
  calculator: '计算器',
  report: '报告',
};

export function WorkflowPage({
  workflowId,
  projects,
  activeBundle,
  theme,
  drawerOpen,
  onCycleTheme,
  onGoHome,
  onOpenTool,
  onSelectProject,
  onCreateProject,
  onToggleDrawer,
  onAddEvidence,
  onUpdateEvidenceStatus,
  onDeleteEvidence,
}: WorkflowPageProps) {
  const [widescreen, setWidescreen] = useState(false);
  const workflow = workflowId === 'all' ? undefined : getWorkflowById(workflowId);
  const tools = workflow ? workflow.tools : ALL_TOOLS;

  const title = workflow ? `${workflow.name}工作台` : '全量核心工具蓝图';
  const subtitle = workflow ? workflow.summary : '6 条营销工作流 × 30 个核心工具 · 制图蓝图视图';

  return (
    <>
      <div className="desk-backdrop launcher-desk" aria-hidden="true" />

      <div className="launcher-page">
        <div className={`launcher-container ${widescreen ? 'is-widescreen' : ''}`}>
          <header className="launcher-header">
            <div className="hero-left">
              <div className="title-row">
                <button
                  type="button"
                  className="header-icon-btn"
                  onClick={onGoHome}
                  title="返回工作台集合"
                  aria-label="返回工作台集合"
                >
                  <ArrowLeft size={14} />
                </button>
                <h1 className="brand-title">{title}</h1>
                <span className="version-tag">{tools.length} TOOLS</span>

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
                  className="mode-switch-btn is-outline"
                  onClick={onToggleDrawer}
                  title="查看当前项目、证据与业务图谱"
                >
                  <FolderKanban size={14} />
                  <span>{activeBundle.project.name}</span>
                </button>
              </div>
              <p className="brand-subtitle">{subtitle}</p>
            </div>

            <div className="hero-right">
              <button type="button" className="hero-logo-btn" onClick={onGoHome} title="返回主页">
                <img src="./images/modiqi-logo-r.png" alt="Modiqi" className="hero-logo" />
              </button>
            </div>
          </header>

          <main className="launcher-grid">
            {tools.map((tool) => {
              const isReady = tool.status === 'ready';
              return (
                <button
                  type="button"
                  key={tool.id}
                  disabled={!isReady}
                  className={`blueprint-card ${isReady ? 'is-ready' : 'is-planned'}`}
                  onClick={() => {
                    if (isReady) onOpenTool(tool.id);
                  }}
                >
                  <StampIcon container={tool.container} />
                  <div className="mini-preview">
                    <div className="card-badge">
                      {isReady ? BADGE_MAP[tool.container] : `${tool.phase} 排期`}
                    </div>
                    <ToolMiniPreview id={tool.id} />
                  </div>
                  <div className="card-meta">
                    <h2 className="card-title">
                      {tool.name} <span className="en-sub">({tool.enName})</span>
                    </h2>
                    <p className="card-desc">{tool.summary}</p>
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
            <div>点选蓝图卡片直接进入纸张画布</div>
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
