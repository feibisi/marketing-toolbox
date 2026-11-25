import type { ReactNode } from 'react';
import type { EvidenceKind, EvidenceStatus, ProjectBundle, WorkbenchTheme } from '../../core/schema/project';
import type { ToolCatalogItem } from '../../core/catalog/workflows';
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

      <div className={`desk-viewport ${zoomed ? 'is-zoomed' : ''}`}>{children}</div>

      <FloatingToolbar
        zoomed={zoomed}
        colorMode={colorMode}
        drawerOpen={drawerOpen}
        hasDrawerBadge={activeBundle.evidences.length > 0}
        theme={theme}
        onGoHome={onGoHome}
        onToggleDrawer={onToggleDrawer}
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
