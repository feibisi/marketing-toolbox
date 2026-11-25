import { ArrowLeft, PanelRight, Plus } from 'lucide-react';
import type { ProjectBundle } from '../../core/schema/project';

interface TopBarProps {
  activeToolName?: string;
  projects: ProjectBundle[];
  activeProjectId: string;
  drawerOpen: boolean;
  evidenceCount: number;
  entityCount: number;
  onGoHome: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
}

export function TopBar({
  activeToolName,
  projects,
  activeProjectId,
  drawerOpen,
  evidenceCount,
  entityCount,
  onGoHome,
  onSelectProject,
  onCreateProject,
  onToggleDrawer,
}: TopBarProps) {
  return (
    <header className="workbench-topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-brand-btn" onClick={onGoHome}>
          {activeToolName ? <ArrowLeft size={16} /> : null}
          <span>莫蒂奇工作台</span>
        </button>
        {activeToolName ? (
          <>
            <span className="topbar-sep">/</span>
            <span className="topbar-tool-crumb">{activeToolName}</span>
          </>
        ) : null}
      </div>

      <div className="topbar-right">
        <select
          className="topbar-project-select"
          aria-label="切换当前项目"
          value={activeProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
        >
          {projects.map((bundle) => (
            <option key={bundle.project.id} value={bundle.project.id}>
              {bundle.project.name}
            </option>
          ))}
        </select>

        <button type="button" className="topbar-btn" onClick={onCreateProject} title="新建项目">
          <Plus size={14} />
          <span className="topbar-btn-label">新建项目</span>
        </button>

        <span className="topbar-status-pill">本地自动保存</span>

        <button
          type="button"
          className={`topbar-btn ${drawerOpen ? 'is-active' : ''}`}
          onClick={onToggleDrawer}
          title="打开纸外工作台抽屉（证据、业务图谱、AI 副驾）"
        >
          <PanelRight size={15} />
          <span className="topbar-btn-label">
            抽屉 ({evidenceCount}/{entityCount})
          </span>
        </button>
      </div>
    </header>
  );
}
