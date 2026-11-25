import { useRef } from 'react';
import { Plus, X } from 'lucide-react';

interface EditableBulletListProps {
  items: string[];
  placeholder?: string;
  addLabel?: string;
  onChange: (nextItems: string[]) => void;
}

export function EditableBulletList({
  items,
  placeholder = '输入要点...',
  addLabel = '新增一条',
  onChange,
}: EditableBulletListProps) {
  const inputRefs = useRef<Array<HTMLTextAreaElement | null>>([]);

  const handleItemChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleInsertAfter = (index: number) => {
    const next = [...items.slice(0, index + 1), '', ...items.slice(index + 1)];
    onChange(next);
    requestAnimationFrame(() => {
      inputRefs.current[index + 1]?.focus();
    });
  };

  const handleAdd = () => {
    const nextIdx = items.length;
    onChange([...items, '']);
    requestAnimationFrame(() => {
      inputRefs.current[nextIdx]?.focus();
    });
  };

  const handleRemove = (index: number, focusPrev = false) => {
    if (items.length <= 1) {
      onChange(['']);
      return;
    }
    onChange(items.filter((_, idx) => idx !== index));
    if (focusPrev && index > 0) {
      requestAnimationFrame(() => {
        inputRefs.current[index - 1]?.focus();
      });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInsertAfter(index);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      handleRemove(index, true);
    }
  };

  return (
    <div className="editable-list">
      {items.map((item, idx) => (
        <div className="editable-list-row" key={idx}>
          <span className="editable-list-dot" aria-hidden="true">
            •
          </span>
          <textarea
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            className="editable-list-input"
            rows={Math.max(1, Math.ceil((item.length || 1) / 26))}
            value={item}
            placeholder={placeholder}
            aria-label={`${placeholder} ${idx + 1}`}
            onChange={(e) => handleItemChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
          />
          <button
            type="button"
            className="editable-list-remove"
            title="删除此条"
            aria-label="删除此条"
            onClick={() => handleRemove(idx)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="editable-list-add" onClick={handleAdd}>
        <Plus size={12} />
        <span>{addLabel}</span>
      </button>
    </div>
  );
}
