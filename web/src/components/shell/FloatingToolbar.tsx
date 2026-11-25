import { useRef, useState } from 'react';
import {
  Download,
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
  theme: WorkbenchTheme;
  onGoHome: () => void;
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
  classic: '经典暖桌',
  whiteboard: '纯白白板',
  dark: '深色护眼',
};

export function FloatingToolbar({
  zoomed,
  colorMode,
  theme,
  onGoHome,
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
    <nav
      className={`floating-toolbar ${mobileOpen ? 'is-mobile-open' : ''}`}
      aria-label="画布工具栏"
    >
      <button
        type="button"
        className="toolbar-btn toolbar-mobile-toggle"
        aria-label={mobileOpen ? '收起工具栏' : '展开工具栏'}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div className="toolbar-items">
        <button type="button" className="toolbar-btn" onClick={onGoHome} title="返回工作台首页">
          <Home size={16} />
          <span>首页</span>
        </button>

        <div className="toolbar-divider" />

        <button
          type="button"
          className={`toolbar-btn ${zoomed ? 'is-active' : ''}`}
          onClick={onToggleZoom}
          title="放大/还原视图"
        >
          {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{zoomed ? '还原' : '放大'}</span>
        </button>

        <button
          type="button"
          className={`toolbar-btn ${colorMode ? 'is-active' : ''}`}
          onClick={onToggleColorMode}
          title="切换单色印刷 / 柔和语义配色"
        >
          <Palette size={16} />
          <span>配色</span>
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onCycleTheme}
          title={`切换桌面主题（当前：${THEME_LABELS[theme]}）`}
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{THEME_LABELS[theme]}</span>
        </button>

        <div className="toolbar-divider" />

        <button type="button" className="toolbar-btn" onClick={onLoadSample} title="载入莫蒂奇示范样本">
          <Sparkles size={16} />
          <span>范例</span>
        </button>

        <button type="button" className="toolbar-btn" onClick={onPrint} title="打印 / 另存为 PDF">
          <Printer size={16} />
          <span>打印</span>
        </button>

        <button type="button" className="toolbar-btn" onClick={onExportJson} title="导出项目数据包 (.modiqi.json)">
          <Download size={16} />
          <span>导出</span>
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => fileInputRef.current?.click()}
          title="导入项目数据包 (.modiqi.json)"
        >
          <Upload size={16} />
          <span>导入</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.modiqi.json"
          className="sr-only"
          onChange={handleFileChange}
        />

        <div className="toolbar-divider" />

        <button type="button" className="toolbar-btn danger" onClick={onResetTool} title="清空当前画布为默认态">
          <RotateCcw size={16} />
          <span>重置</span>
        </button>
      </div>
    </nav>
  );
}
