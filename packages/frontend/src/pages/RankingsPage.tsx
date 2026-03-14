import { Link } from 'react-router-dom';
import { useRankings } from '../hooks/useRankings';
import type { RankingItem } from '../types';
import { specIconUrl } from '../utils/wowIcons';

function RankingTable({ title, items }: { title: string; items: RankingItem[] }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-1">
        {items.map(item => (
          <Link
            key={item.specName}
            to={`/guide/${item.specName}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
          >
            <span className="text-gray-500 w-5 text-right text-xs shrink-0">{item.rank}</span>
            <img
              src={specIconUrl(item.specName, 'medium')}
              alt=""
              className="w-5 h-5 rounded shrink-0"
            />
            <span style={{ color: item.color }} className="font-medium flex-1 truncate">{item.label}</span>
            <span className="text-gray-500 text-xs shrink-0">{item.classLabel}</span>
            <span className="ml-2 text-gray-400 text-xs tabular-nums shrink-0">{item.actionCount} actions</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RankingsPage() {
  const { data, isLoading, error } = useRankings();

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-2">
              <div className="h-5 w-40 bg-gray-800 rounded animate-pulse" />
              {Array.from({ length: 10 }).map((_, j) => (
                <div key={j} className="h-8 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-400 mb-2">Failed to load rankings.</p>
        <Link to="/" className="text-sm text-blue-400 hover:underline">← Back to home</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Rotation Complexity</h1>
        <p className="text-gray-400 text-sm">
          Specs ranked by number of priority actions in their SimC APL rotation.
          Higher count = more complex rotation.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RankingTable title="Single Target Complexity" items={data.singleTarget} />
        <RankingTable title="AoE Complexity" items={data.aoe} />
      </div>
    </div>
  );
}
