interface CanvasFooterProps {
  projectName?: string;
}

export function CanvasFooter({ projectName }: CanvasFooterProps) {
  return (
    <footer className="canvas-footer">
      <div className="canvas-footer-brand">
        <img src="./images/modiqi-logo-r.png" alt="Modiqi" className="canvas-footer-logo" />
        {projectName ? <span>{projectName}</span> : null}
      </div>
      <span>Modiqi Digital Marketing Workbench © 2026</span>
    </footer>
  );
}
