import { useRef, useState } from 'react';
import {
  Download,
  FileText,
  FolderKanban,
  Home,
  Image as ImageIcon,
  Maximize,
  Menu,
  Minimize,
  Monitor,
  Moon,
  Palette,
  Printer,
  Share2,
  Sun,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from 'lucide-react';
import type { WorkbenchTheme } from '../../core/schema/project';

interface FloatingToolbarProps {
  zoomScale: number;
  colorMode: boolean;
  isFullscreen: boolean;
  drawerOpen: boolean;
  toolbarHidden: boolean;
  hasDrawerBadge: boolean;
  theme: WorkbenchTheme;
  onGoHome: () => void;
  onToggleDrawer: () => void;
  onCycleZoom: () => void;
  onToggleColorMode: () => void;
  onToggleFullscreen: () => void;
  onCycleTheme: () => void;
  onLoadSample: () => void;
  onPrint: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: (raw: string) => void;
  onShareLink: () => void;
  onResetTool: () => void;
}

const THEME_LABELS: Record<WorkbenchTheme, string> = {
  classic: '切换至白板模式 (Whiteboard)',
  whiteboard: '切换至暗色模式 (Dark)',
  dark: '切换至经典模式 (Classic)',
};

export function FloatingToolbar({
  zoomScale,
  colorMode,
  isFullscreen,
  drawerOpen,
  toolbarHidden,
  hasDrawerBadge,
  theme,
  onGoHome,
  onToggleDrawer,
  onCycleZoom,
  onToggleColorMode,
  onToggleFullscreen,
  onCycleTheme,
  onLoadSample,
  onPrint,
  onExportPng,
  onExportJson,
  onImportJson,
  onShareLink,
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

  const zoomPercent = Math.round(zoomScale * 100);

  return (
    <nav
      className={`floating-toolbar ${mobileOpen ? 'is-mobile-open' : ''} ${toolbarHidden ? 'is-hidden' : ''}`}
      aria-label="画布工具栏"
    >
      <button
        type="button"
        className="toolbar-btn toolbar-mobile-toggle"
        aria-label={mobileOpen ? '收起工具栏' : '展开工具栏'}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
      </button>

      <div className="toolbar-items">
        {/* Group 1: Navigation */}
        <button type="button" className="toolbar-btn" onClick={onGoHome} data-tip="返回首页 (Home)" aria-label="返回首页">
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

        {/* Group 2: View */}
        <button
          type="button"
          className={`toolbar-btn ${zoomScale > 1 ? 'is-active' : ''}`}
          onClick={onCycleZoom}
          data-tip={`放大显示 ${zoomPercent}% (100/125/150%)`}
          aria-label="切换缩放比例"
        >
          <ZoomIn size={19} />
        </button>

        <button
          type="button"
          className={`toolbar-btn ${colorMode ? 'is-active' : ''}`}
          onClick={onToggleColorMode}
          data-tip={colorMode ? '关闭彩色模式 [Ctrl+D]' : '彩色模式 (Color Mode) [Ctrl+D]'}
          aria-label="切换配色模式"
        >
          <Palette size={19} />
        </button>

        <button
          type="button"
          className={`toolbar-btn ${isFullscreen ? 'is-active' : ''}`}
          onClick={onToggleFullscreen}
          data-tip="全屏演示 (Presentation Mode) [F11]"
          aria-label="全屏演示"
        >
          {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
        </button>

        <div className="toolbar-divider" />

        {/* Group 3: Export / Share */}
        <button
          type="button"
          className="toolbar-btn"
          onClick={onPrint}
          data-tip="打印 / 导出 PDF (Print)"
          aria-label="打印或导出 PDF"
        >
          <Printer size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onExportPng}
          data-tip="保存为图片 (Save PNG)"
          aria-label="保存为图片"
        >
          <ImageIcon size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onExportJson}
          data-tip="导出数据 (.modiqi.json) [Ctrl+E]"
          aria-label="导出项目数据"
        >
          <Download size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => fileInputRef.current?.click()}
          data-tip="导入数据 (.modiqi.json)"
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

        <button
          type="button"
          className="toolbar-btn"
          onClick={onShareLink}
          data-tip="复制分享链接 (Share Link)"
          aria-label="复制分享链接"
        >
          <Share2 size={19} />
        </button>

        <div className="toolbar-divider" />

        {/* Group 4: Example / Theme / Reset */}
        <button
          type="button"
          className="toolbar-btn"
          onClick={onLoadSample}
          data-tip="加载范例 (Load Example)"
          aria-label="载入示范样本"
        >
          <FileText size={19} />
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onCycleTheme}
          data-tip={THEME_LABELS[theme]}
          aria-label="切换桌面主题"
        >
          {theme === 'dark' ? <Moon size={19} /> : theme === 'whiteboard' ? <Monitor size={19} /> : <Sun size={19} />}
        </button>

        <button
          type="button"
          className="toolbar-btn danger"
          onClick={onResetTool}
          data-tip="清空数据 (Reset Data)"
          aria-label="重置画布"
        >
          <Trash2 size={19} />
        </button>
      </div>
    </nav>
  );
}
