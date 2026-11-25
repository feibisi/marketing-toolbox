import type { ReactNode } from 'react';

interface CanvasHeaderProps {
  title: string;
  enSubtitle: string;
  metaFields?: ReactNode;
}

export function CanvasHeader({ title, enSubtitle, metaFields }: CanvasHeaderProps) {
  return (
    <header className="canvas-header">
      <div className="canvas-title-group">
        <h1>{title}</h1>
        <span className="canvas-en-subtitle">{enSubtitle}</span>
      </div>
      {metaFields ? <div className="canvas-meta-row">{metaFields}</div> : null}
    </header>
  );
}
