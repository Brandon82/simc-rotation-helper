import type { PriorityItem } from '../../types';

interface PriorityListProps {
  items: PriorityItem[];
  compact?: boolean;
}

export function PriorityList({ items, compact = false }: PriorityListProps) {
  if (!items || items.length === 0) return null;

  return (
    <ol className="space-y-1.5 mt-3">
      {items.map(item => (
        <li key={item.order} className={`flex items-start gap-3 ${compact ? 'py-1' : 'py-2'} px-3 rounded-lg bg-gray-800/60 border border-gray-700/50`}>
          {/* Order badge */}
          <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-gray-300 mt-0.5">
            {item.order}
          </span>

          {/* Ability + condition */}
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-white">{item.ability}</span>
            {item.condition && (
              <span className="text-gray-400 text-sm ml-2 italic">{item.condition}</span>
            )}
            {item.note && (
              <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
