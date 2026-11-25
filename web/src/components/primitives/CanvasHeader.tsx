import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface CanvasHeaderProps {
  title: string;
  enSubtitle: string;
  justSaved?: boolean;
  metaFields?: ReactNode;
}

export function CanvasHeader({ title, enSubtitle, justSaved = false, metaFields }: CanvasHeaderProps) {
  return (
    <header className="canvas-header">
      <div className="canvas-title-group">
        <h1>{title}</h1>
        <span className="canvas-en-subtitle">{enSubtitle}</span>
        <span className={`save-badge-dot ${justSaved ? 'is-visible' : ''}`} title="已自动保存" aria-hidden={!justSaved}>
          <Check size={15} />
        </span>
      </div>
      {metaFields ? <div className="canvas-meta-row">{metaFields}</div> : null}
    </header>
  );
}
