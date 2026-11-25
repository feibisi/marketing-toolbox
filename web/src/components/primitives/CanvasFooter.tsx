interface CanvasFooterProps {
  projectName?: string;
  toolbarHidden?: boolean;
  onToggleToolbar?: () => void;
}

export function CanvasFooter({ projectName, toolbarHidden = false, onToggleToolbar }: CanvasFooterProps) {
  return (
    <footer className="canvas-footer">
      <div className="canvas-footer-brand">
        <img
          src="./images/modiqi-logo-r.png"
          alt="Modiqi"
          className="canvas-footer-logo"
          title={toolbarHidden ? '点击显示工具栏 (Show Toolbar)' : '点击隐藏工具栏 (Hide Toolbar)'}
          onClick={onToggleToolbar}
        />
        {projectName ? <span>{projectName}</span> : null}
      </div>
      <span>Modiqi Digital Marketing Workbench © 2026</span>
    </footer>
  );
}
