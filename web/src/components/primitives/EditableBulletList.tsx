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
  const handleItemChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index: number) => {
    if (items.length <= 1) {
      onChange(['']);
      return;
    }
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className="editable-list">
      {items.map((item, idx) => (
        <div className="editable-list-row" key={idx}>
          <span className="editable-list-dot" aria-hidden="true">
            •
          </span>
          <textarea
            className="editable-list-input"
            rows={Math.max(1, Math.ceil((item.length || 1) / 26))}
            value={item}
            placeholder={placeholder}
            aria-label={`${placeholder} ${idx + 1}`}
            onChange={(e) => handleItemChange(idx, e.target.value)}
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
