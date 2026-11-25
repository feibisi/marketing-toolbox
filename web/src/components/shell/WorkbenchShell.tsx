import { useEffect, useState, type ReactNode } from 'react';
import html2canvas from 'html2canvas';
import type { EvidenceKind, EvidenceStatus, ProjectBundle, WorkbenchTheme } from '../../core/schema/project';
import type { ToolCatalogItem } from '../../core/catalog/workflows';
import { FloatingToolbar } from './FloatingToolbar';
import { RightDrawer } from './RightDrawer';

interface WorkbenchShellProps {
  tool: ToolCatalogItem;
  projects: ProjectBundle[];
  activeBundle: ProjectBundle;
  theme: WorkbenchTheme;
  zoomScale: number;
  colorMode: boolean;
  drawerOpen: boolean;
  toolbarHidden: boolean;
  toastMessage: string | null;
  onShowToast: (msg: string) => void;
  onGoHome: () => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onToggleDrawer: () => void;
  onCycleZoom: () => void;
  onResetZoom: () => void;
  onToggleColorMode: () => void;
  onCycleTheme: () => void;
  onLoadSample: () => void;
  onPrint: () => void;
  onExportJson: () => void;
  onImportJson: (raw: string) => void;
  onShareLink: () => void;
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
  zoomScale,
  colorMode,
  drawerOpen,
  toolbarHidden,
  toastMessage,
  onShowToast,
  onGoHome,
  onSelectProject,
  onCreateProject,
  onToggleDrawer,
  onCycleZoom,
  onResetZoom,
  onToggleColorMode,
  onCycleTheme,
  onLoadSample,
  onPrint,
  onExportJson,
  onImportJson,
  onShareLink,
  onResetTool,
  onAddEvidence,
  onUpdateEvidenceStatus,
  onDeleteEvidence,
  children,
}: WorkbenchShellProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      onResetZoom();
      document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'd') {
        e.preventDefault();
        onToggleColorMode();
      } else if (key === 'e') {
        e.preventDefault();
        onExportJson();
      } else if (key === '0') {
        e.preventDefault();
        onResetZoom();
      } else if (key === 's') {
        e.preventDefault();
        onShowToast('已自动保存在本地浏览器');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onToggleColorMode, onExportJson, onResetZoom, onShowToast]);

  const handleExportPng = async () => {
    const node = document.querySelector<HTMLElement>('.paper-sheet');
    if (!node) return;
    onShowToast('正在生成高清 PNG...');
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fdfbf7',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${tool.id}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onShowToast('PNG 图片已保存');
    } catch {
      onShowToast('PNG 导出失败，可使用打印另存为 PDF');
    }
  };

  return (
    <>
      <div className="desk-backdrop" aria-hidden="true" />

      {toastMessage ? <div className="workbench-toast">{toastMessage}</div> : null}

      <div className={`desk-viewport ${zoomScale > 1 ? 'is-zoomed' : ''}`}>
        <div
          style={{
            width: '100%',
            transform: zoomScale > 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {children}
        </div>
      </div>

      <FloatingToolbar
        zoomScale={zoomScale}
        colorMode={colorMode}
        isFullscreen={isFullscreen}
        drawerOpen={drawerOpen}
        toolbarHidden={toolbarHidden}
        hasDrawerBadge={activeBundle.evidences.length > 0}
        theme={theme}
        onGoHome={onGoHome}
        onToggleDrawer={onToggleDrawer}
        onCycleZoom={onCycleZoom}
        onToggleColorMode={onToggleColorMode}
        onToggleFullscreen={handleToggleFullscreen}
        onCycleTheme={onCycleTheme}
        onLoadSample={onLoadSample}
        onPrint={onPrint}
        onExportPng={handleExportPng}
        onExportJson={onExportJson}
        onImportJson={onImportJson}
        onShareLink={onShareLink}
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
