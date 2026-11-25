import { useRef, useState } from 'react';
import {
  Download,
  FolderKanban,
  Home,
  Menu,
  Moon,
  Palette,
  Printer,
  RotateCcw,
  Sparkles,
  Sun,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { WorkbenchTheme } from '../../core/schema/project';

interface FloatingToolbarProps {
  zoomed: boolean;
  colorMode: boolean;
  drawerOpen: boolean;
  hasDrawerBadge: boolean;
  theme: WorkbenchTheme;
  onGoHome: () => void;
  onToggleDrawer: () => void;
  onToggleZoom: () => void;
  onToggleColorMode: () => void;
  onCycleTheme: () => void;
  onLoadSample: () => void;
  onPrint: () => void;
  onExportJson: () => void;
  onImportJson: (raw: string) => void;
  onResetTool: () => void;
}

const THEME_LABELS: Record<WorkbenchTheme, string> = {
  classic: '主题：经典暖桌（点此切换）',
  whiteboard: '主题：纯白白板（点此切换）',
  dark: '主题：深色护眼（点此切换）',
};

export function FloatingToolbar({
  zoomed,
  colorMode,
  drawerOpen,
  hasDrawerBadge,
  theme,
  onGoHome,
  onToggleDrawer,
  onToggleZoom,
  onToggleColorMode,
  onCycleTheme,
  onLoadSample,
  onPrint,
  onExportJson,
  onImportJson,
  onResetTool,
}: FloatingToolbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImportJson(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <nav className={`floating-toolbar ${mobileOpen ? 'is-mobile-open' : ''}`} aria-label="画布工具栏">
      <button
        type="button"
        className="toolbar-btn toolbar-mobile-toggle"
        aria-label={mobileOpen ? '收起工具栏' : '展开工具栏'}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
      </button>

      <div className="toolbar-items">
        <button type="button" className="toolbar-btn" onClick={onGoHome} data-tip="返回首页" aria-label="返回首页">
          <Home size={19} />
        </button>

        <button
          type="button"
          className={`toolbar-btn ${drawerOpen ? 'is-active' : ''}`}
          onClick={onToggleDrawer}
          data-tip="项目 · 证据 · 业务图谱抽屉"
          aria-label="打开项目与证据抽屉"
        >
          <FolderKanban size={19} />
          {hasDrawerBadge ? <span className="toolbar-dot" aria-hidden="true" /> : null}
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className={`toolbar-btn ${zoomed ? 'is-active' : ''}`}
          onClick={onToggleZoom}
          data-tip={zoomed ? '还原视图' : '放大视图'}
          aria-label={zoomed ? '还原视图' : '放大视图'}
        >
          {zoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
        </button>

        <button
          type="button"
          className={`toolbar-btn ${colorMode ? 'is-active' : ''}`}
          onClick={onToggleColorMode}
          data-tip="切换单色 / 语义配色"
          aria-label="切换配色模式"
        >
          <Palette size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onCycleTheme}
          data-tip={THEME_LABELS[theme]}
          aria-label="切换桌面主题"
        >
          {theme === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className="toolbar-btn"
          onClick={onPrint}
          data-tip="打印 / 导出 PDF"
          aria-label="打印或导出 PDF"
        >
          <Printer size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onExportJson}
          data-tip="导出项目数据 (.modiqi.json)"
          aria-label="导出项目数据"
        >
          <Download size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => fileInputRef.current?.click()}
          data-tip="导入项目数据 (.modiqi.json)"
          aria-label="导入项目数据"
        >
          <Upload size={19} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.modiqi.json"
          className="sr-only"
          onChange={handleFileChange}
        />

        <div className="toolbar-divider" />

        <button
          type="button"
          className="toolbar-btn"
          onClick={onLoadSample}
          data-tip="载入示范样本"
          aria-label="载入示范样本"
        >
          <Sparkles size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn danger"
          onClick={onResetTool}
          data-tip="重置画布"
          aria-label="重置画布"
        >
          <RotateCcw size={19} />
        </button>
      </div>
    </nav>
  );
}
