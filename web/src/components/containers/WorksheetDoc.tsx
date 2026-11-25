import type { ReactNode } from 'react';

interface WorksheetDocProps {
  size?: 'a3-wide' | 'a4-continuous';
  colorMode?: boolean;
  className?: string;
  children: ReactNode;
}

export function WorksheetDoc({
  size = 'a3-wide',
  colorMode = false,
  className = '',
  children,
}: WorksheetDocProps) {
  const sizeClass = size === 'a3-wide' ? 'paper-worksheet-a3' : 'paper-worksheet-a4';
  return (
    <main className={`paper-sheet ${sizeClass} ${colorMode ? 'is-color-mode' : ''} ${className}`.trim()}>
      <div className="mobile-edit-banner">
        <span>连续工作表 · 自由增删不裁切</span>
        <span>打印自动分页</span>
      </div>
      {children}
    </main>
  );
}
