import type { ReactNode } from 'react';

interface FixedCanvasSheetProps {
  size: 'a3-landscape' | 'a4-portrait';
  colorMode?: boolean;
  className?: string;
  children: ReactNode;
}

export function FixedCanvasSheet({ size, colorMode = false, className = '', children }: FixedCanvasSheetProps) {
  const sizeClass = size === 'a3-landscape' ? 'paper-fixed-a3' : 'paper-fixed-a4';
  return (
    <main className={`paper-sheet ${sizeClass} ${colorMode ? 'is-color-mode' : ''} ${className}`.trim()}>
      <div className="mobile-edit-banner">
        <span>移动编辑模式 · 已自动折排便于阅读</span>
        <span>打印时保持 {size === 'a3-landscape' ? 'A3 横向' : 'A4 纵向'}</span>
      </div>
      {children}
    </main>
  );
}
