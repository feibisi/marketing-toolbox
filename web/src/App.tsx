import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EntityType } from './core/schema/entities';
import type { EvidenceKind, EvidenceStatus, WorkbenchTheme, WorkspaceStore } from './core/schema/project';
import { LocalProjectRepository } from './core/storage/localRepository';
import { HomePage } from './pages/HomePage';
import { WorkflowPage } from './pages/WorkflowPage';
import { ToolPage } from './pages/ToolPage';

type AppRoute =
  | { view: 'home' }
  | { view: 'workflow'; workflowId: string }
  | { view: 'tool'; toolId: string; sharePayload?: string };

function parseHashRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');
  const [pathPart, queryPart] = hash.split('?');
  const toolMatch = pathPart.match(/^\/tool\/([a-z0-9-]+)$/i);
  if (toolMatch) {
    const params = new URLSearchParams(queryPart || '');
    const sharePayload = params.get('share') || undefined;
    return { view: 'tool', toolId: toolMatch[1], sharePayload };
  }

  const wfMatch = pathPart.match(/^\/workflow\/([a-z0-9-]+)$/i);
  if (wfMatch) return { view: 'workflow', workflowId: wfMatch[1] };

  return { view: 'home' };
}

const THEME_ORDER: WorkbenchTheme[] = ['classic', 'whiteboard', 'dark'];
const ZOOM_LEVELS = [1, 1.25, 1.5];

function loadSavedTheme(): WorkbenchTheme {
  const raw = localStorage.getItem('modiqi_v3_theme');
  if (raw === 'whiteboard' || raw === 'dark' || raw === 'classic') return raw;
  return 'classic';
}

export function App() {
  const repo = useMemo(() => new LocalProjectRepository(), []);
  const [store, setStore] = useState<WorkspaceStore>(() => repo.loadStore());
  const [route, setRoute] = useState<AppRoute>(parseHashRoute);
  const [theme, setTheme] = useState<WorkbenchTheme>(loadSavedTheme);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [colorMode, setColorMode] = useState<boolean>(() => localStorage.getItem('modiqi_v3_color_mode') === 'true');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toolbarHidden, setToolbarHidden] = useState<boolean>(
    () => localStorage.getItem('modiqi_v3_toolbar_hidden') === 'true',
  );
  const [justSaved, setJustSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const flashSaved = useCallback(() => {
    setJustSaved(true);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setJustSaved(false), 1800);
  }, []);

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
    localStorage.setItem('modiqi_v3_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('modiqi_v3_color_mode', String(colorMode));
  }, [colorMode]);

  useEffect(() => {
    localStorage.setItem('modiqi_v3_toolbar_hidden', String(toolbarHidden));
  }, [toolbarHidden]);

  const activeBundle = store.projects[store.activeProjectId];
  const allProjects = Object.values(store.projects);

  // Import shared URL payload if present
  useEffect(() => {
    if (route.view === 'tool' && route.sharePayload) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(route.sharePayload))) as Record<string, unknown>;
        repo.saveToolDocument(activeBundle.project.id, route.toolId, decoded);
        setStore({ ...repo.loadStore() });
        window.location.hash = `/tool/${route.toolId}`;
        showToast('已加载分享的画布内容');
      } catch {
        showToast('分享链接解析失败');
      }
    }
  }, [route, repo, activeBundle.project.id, showToast]);

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
    showToast('已切换项目');
  };

  const handleCreateProject = () => {
    const name = window.prompt('输入新营销项目名称（例如：文派商业化转化项目）：', '');
    if (!name || !name.trim()) return;
    const brand = window.prompt('输入品牌/业务简称：', name.trim()) || name.trim();
    setStore({ ...repo.createProject(name.trim(), brand.trim()) });
    showToast(`已新建项目：${name.trim()}`);
  };

  const handleSaveToolData = (
    toolId: string,
    data: Record<string, unknown>,
    entitySync?: { entityType: EntityType; slug: string; title: string; summary: string; payload: Record<string, unknown> },
  ) => {
    repo.saveToolDocument(activeBundle.project.id, toolId, data, entitySync);
    setStore({ ...repo.loadStore() });
    flashSaved();
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
    showToast('已记入证据台账');
  };

  const handleUpdateEvidenceStatus = (evidenceId: string, status: EvidenceStatus, kind?: EvidenceKind) => {
    repo.updateEvidenceStatus(activeBundle.project.id, evidenceId, status, kind);
    setStore({ ...repo.loadStore() });
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    repo.deleteEvidence(activeBundle.project.id, evidenceId);
    setStore({ ...repo.loadStore() });
  };

  const handleExportJson = useCallback(() => {
    const json = repo.exportProjectJson(activeBundle.project.id);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBundle.project.brand || 'modiqi-project'}.modiqi.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出项目数据包 (.modiqi.json)');
  }, [repo, activeBundle.project.id, activeBundle.project.brand, showToast]);

  const handleImportJson = (raw: string) => {
    try {
      const next = repo.importProjectJson(raw);
      setStore({ ...next });
      showToast('项目数据包导入成功');
    } catch {
      window.alert('导入失败：请确认选择的是有效的 .modiqi.json v3 项目数据包。');
    }
  };

  const handleCycleTheme = () => {
    const nextIdx = (THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIdx]);
  };

  const handleCycleZoom = () => {
    setZoomIndex((idx) => (idx + 1) % ZOOM_LEVELS.length);
  };

  const handleResetZoom = useCallback(() => setZoomIndex(0), []);
  const handleToggleColorMode = useCallback(() => setColorMode((v) => !v), []);

  if (route.view === 'tool') {
    return (
      <ToolPage
        toolId={route.toolId}
        projects={allProjects}
        activeBundle={activeBundle}
        theme={theme}
        zoomScale={ZOOM_LEVELS[zoomIndex]}
        colorMode={colorMode}
        drawerOpen={drawerOpen}
        toolbarHidden={toolbarHidden}
        justSaved={justSaved}
        toastMessage={toastMessage}
        onShowToast={showToast}
        onGoHome={navigateHome}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onToggleDrawer={() => setDrawerOpen((v) => !v)}
        onToggleToolbarHidden={() => setToolbarHidden((v) => !v)}
        onCycleZoom={handleCycleZoom}
        onResetZoom={handleResetZoom}
        onToggleColorMode={handleToggleColorMode}
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
