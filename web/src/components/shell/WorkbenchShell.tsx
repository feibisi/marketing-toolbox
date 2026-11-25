import type { ReactNode } from 'react';
import type { EvidenceKind, EvidenceStatus, ProjectBundle, WorkbenchTheme } from '../../core/schema/project';
import type { ToolCatalogItem } from '../../core/catalog/workflows';
import { TopBar } from './TopBar';
import { FloatingToolbar } from './FloatingToolbar';
import { RightDrawer } from './RightDrawer';

interface WorkbenchShellProps {
  tool: ToolCatalogItem;
  projects: ProjectBundle[];
  activeBundle: ProjectBundle;
  theme: WorkbenchTheme;
  zoomed: boolean;
  colorMode: boolean;
  drawerOpen: boolean;
  onGoHome: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
  onToggleZoom: () => void;
  onToggleColorMode: () => void;
  onCycleTheme: () => void;
  onLoadSample: () => void;
  onPrint: () => void;
  onExportJson: () => void;
  onImportJson: (raw: string) => void;
  onResetTool: () => void;
  onAddEvidence: (input: { toolId: string; fieldPath: string; statement: string; kind: EvidenceKind; source: string }) => void;
  onUpdateEvidenceStatus: (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => void;
  onDeleteEvidence: (evidenceId: string) => void;
  children: ReactNode;
}

export function WorkbenchShell({
  tool,
  projects,
  activeBundle,
  theme,
  zoomed,
  colorMode,
  drawerOpen,
  onGoHome,
  onSelectProject,
  onCreateProject,
  onToggleDrawer,
  onToggleZoom,
  onToggleColorMode,
  onCycleTheme,
  onLoadSample,
  onPrint,
  onExportJson,
  onImportJson,
  onResetTool,
  onAddEvidence,
  onUpdateEvidenceStatus,
  onDeleteEvidence,
  children,
}: WorkbenchShellProps) {
  return (
    <>
      <div className="desk-backdrop" aria-hidden="true" />
      <TopBar
        activeToolName={tool.name}
        projects={projects}
        activeProjectId={activeBundle.project.id}
        drawerOpen={drawerOpen}
        evidenceCount={activeBundle.evidences.length}
        entityCount={activeBundle.entities.length}
        onGoHome={onGoHome}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
        onToggleDrawer={onToggleDrawer}
      />

      <div className={`desk-viewport ${zoomed ? 'is-zoomed' : ''}`}>{children}</div>

      <FloatingToolbar
        zoomed={zoomed}
        colorMode={colorMode}
        theme={theme}
        onGoHome={onGoHome}
        onToggleZoom={onToggleZoom}
        onToggleColorMode={onToggleColorMode}
        onCycleTheme={onCycleTheme}
        onLoadSample={onLoadSample}
        onPrint={onPrint}
        onExportJson={onExportJson}
        onImportJson={onImportJson}
        onResetTool={onResetTool}
      />

      <RightDrawer
        open={drawerOpen}
        tool={tool}
        bundle={activeBundle}
        onClose={onToggleDrawer}
        onAddEvidence={onAddEvidence}
        onUpdateEvidenceStatus={onUpdateEvidenceStatus}
        onDeleteEvidence={onDeleteEvidence}
      />
    </>
  );
}
