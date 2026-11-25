import type { ReactNode } from 'react';

interface CalculatorBoardProps {
  colorMode?: boolean;
  className?: string;
  children: ReactNode;
}

export function CalculatorBoard({ colorMode = false, className = '', children }: CalculatorBoardProps) {
  return (
    <main className={`paper-sheet paper-calculator ${colorMode ? 'is-color-mode' : ''} ${className}`.trim()}>
      <div className="mobile-edit-banner">
        <span>实时计算面板 · 更改任意数字自动重算</span>
        <span>打印输出 A4 摘要</span>
      </div>
      {children}
    </main>
  );
}
