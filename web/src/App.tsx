import { useEffect, useMemo, useState } from 'react';
import type { EntityType } from './core/schema/entities';
import type { EvidenceKind, EvidenceStatus, WorkbenchTheme, WorkspaceStore } from './core/schema/project';
import { LocalProjectRepository } from './core/storage/localRepository';
import { HomePage } from './pages/HomePage';
import { WorkflowPage } from './pages/WorkflowPage';
import { ToolPage } from './pages/ToolPage';

type AppRoute =
  | { view: 'home' }
  | { view: 'workflow'; workflowId: string }
  | { view: 'tool'; toolId: string };

function parseHashRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');
  const toolMatch = hash.match(/^\/tool\/([a-z0-9-]+)$/i);
  if (toolMatch) return { view: 'tool', toolId: toolMatch[1] };

  const wfMatch = hash.match(/^\/workflow\/([a-z0-9-]+)$/i);
  if (wfMatch) return { view: 'workflow', workflowId: wfMatch[1] };

  return { view: 'home' };
}

const THEME_ORDER: WorkbenchTheme[] = ['classic', 'whiteboard', 'dark'];

export function App() {
  const repo = useMemo(() => new LocalProjectRepository(), []);
  const [store, setStore] = useState<WorkspaceStore>(() => repo.loadStore());
  const [route, setRoute] = useState<AppRoute>(parseHashRoute);
  const [theme, setTheme] = useState<WorkbenchTheme>('classic');
  const [zoomed, setZoomed] = useState(false);
  const [colorMode, setColorMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
      setDrawerOpen(false);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const activeBundle = store.projects[store.activeProjectId];
  const allProjects = Object.values(store.projects);

  const navigateHome = () => {
    window.location.hash = '/';
  };

  const navigateWorkflow = (workflowId: string) => {
    window.location.hash = `/workflow/${workflowId}`;
  };

  const navigateTool = (toolId: string) => {
    window.location.hash = `/tool/${toolId}`;
  };

  const handleSelectProject = (projectId: string) => {
    setStore({ ...repo.switchProject(projectId) });
  };

  const handleCreateProject = () => {
    const name = window.prompt('输入新营销项目名称（例如：文派商业化转化项目）：', '');
    if (!name || !name.trim()) return;
    const brand = window.prompt('输入品牌/业务简称：', name.trim()) || name.trim();
    setStore({ ...repo.createProject(name.trim(), brand.trim()) });
  };

  const handleSaveToolData = (
    toolId: string,
    data: Record<string, unknown>,
    entitySync?: { entityType: EntityType; slug: string; title: string; summary: string; payload: Record<string, unknown> },
  ) => {
    repo.saveToolDocument(activeBundle.project.id, toolId, data, entitySync);
    setStore({ ...repo.loadStore() });
  };

  const handleAddEvidence = (input: {
    toolId: string;
    fieldPath: string;
    statement: string;
    kind: EvidenceKind;
    source: string;
  }) => {
    repo.addEvidence(activeBundle.project.id, input);
    setStore({ ...repo.loadStore() });
  };

  const handleUpdateEvidenceStatus = (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => {
    repo.updateEvidenceStatus(activeBundle.project.id, evidenceId, status, kind);
    setStore({ ...repo.loadStore() });
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    repo.deleteEvidence(activeBundle.project.id, evidenceId);
    setStore({ ...repo.loadStore() });
  };

  const handleExportJson = () => {
    const json = repo.exportProjectJson(activeBundle.project.id);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBundle.project.brand || 'modiqi-project'}.modiqi.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (raw: string) => {
    try {
      const next = repo.importProjectJson(raw);
      setStore({ ...next });
    } catch {
      window.alert('导入失败：请确认选择的是有效的 .modiqi.json v3 项目数据包。');
    }
  };

  const handleCycleTheme = () => {
    const nextIdx = (THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIdx]);
  };

  if (route.view === 'tool') {
    return (
      <ToolPage
        toolId={route.toolId}
        projects={allProjects}
        activeBundle={activeBundle}
        theme={theme}
        zoomed={zoomed}
        colorMode={colorMode}
        drawerOpen={drawerOpen}
        onGoHome={navigateHome}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onToggleDrawer={() => setDrawerOpen((v) => !v)}
        onToggleZoom={() => setZoomed((v) => !v)}
        onToggleColorMode={() => setColorMode((v) => !v)}
        onCycleTheme={handleCycleTheme}
        onSaveToolData={handleSaveToolData}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onAddEvidence={handleAddEvidence}
        onUpdateEvidenceStatus={handleUpdateEvidenceStatus}
        onDeleteEvidence={handleDeleteEvidence}
      />
    );
  }

  if (route.view === 'workflow') {
    return (
      <WorkflowPage
        workflowId={route.workflowId}
        projects={allProjects}
        activeBundle={activeBundle}
        theme={theme}
        drawerOpen={drawerOpen}
        onCycleTheme={handleCycleTheme}
        onGoHome={navigateHome}
        onOpenTool={navigateTool}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onToggleDrawer={() => setDrawerOpen((v) => !v)}
        onAddEvidence={handleAddEvidence}
        onUpdateEvidenceStatus={handleUpdateEvidenceStatus}
        onDeleteEvidence={handleDeleteEvidence}
      />
    );
  }

  return (
    <HomePage
      projects={allProjects}
      activeBundle={activeBundle}
      theme={theme}
      drawerOpen={drawerOpen}
      onCycleTheme={handleCycleTheme}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
      onToggleDrawer={() => setDrawerOpen((v) => !v)}
      onOpenWorkflow={navigateWorkflow}
      onAddEvidence={handleAddEvidence}
      onUpdateEvidenceStatus={handleUpdateEvidenceStatus}
      onDeleteEvidence={handleDeleteEvidence}
    />
  );
}
