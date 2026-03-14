import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAllGuides } from '../hooks/useAllGuides';
import type { GuideSummaryItem } from '../types';
import { classIconUrl, specIconUrl } from '../utils/wowIcons';

const CLASS_COLORS: Record<string, string> = {
  death_knight: '#C41E3A',
  demon_hunter: '#A330C9',
  druid:        '#FF7C0A',
  evoker:       '#33937F',
  hunter:       '#AAD372',
  mage:         '#3FC7EB',
  monk:         '#00FF98',
  paladin:      '#F48CBA',
  priest:       '#FFFFFF',
  rogue:        '#FFF468',
  shaman:       '#0070DD',
  warlock:      '#8788EE',
  warrior:      '#C69B3A',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortSha(sha: string) {
  return sha.slice(0, 7);
}

type SortKey = 'generatedAt' | 'specLabel' | 'classLabel' | 'aplCommitDate';

export function HistoryPage() {
  const { data, isLoading, error } = useAllGuides();
  const [classFilter, setClassFilter] = useState<string>('');
  const [currentOnly, setCurrentOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('generatedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const classes = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, string>();
    for (const g of data.guides) seen.set(g.className, g.classLabel);
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows: GuideSummaryItem[] = data.guides;
    if (classFilter) rows = rows.filter(g => g.className === classFilter);
    if (currentOnly) rows = rows.filter(g => g.isCurrent);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(g =>
        g.specLabel.toLowerCase().includes(q) ||
        g.classLabel.toLowerCase().includes(q) ||
        g.aplCommitSha.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const va = a[sortKey] as string;
      const vb = b[sortKey] as string;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [data, classFilter, currentOnly, search, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="ml-1 text-gray-600 text-xs">
      {sortKey === k ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className="pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Guide History</h1>
        <p className="text-sm text-gray-500">
          All generated guides across every spec — current and historical.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search spec, class, or SHA…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-56"
        />

        {/* Class filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setClassFilter('')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              !classFilter
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All classes
          </button>
          {classes.map(([name, label]) => (
            <button
              key={name}
              onClick={() => setClassFilter(f => f === name ? '' : name)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                classFilter === name
                  ? 'bg-gray-700 text-white ring-1'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              style={classFilter === name ? { ringColor: CLASS_COLORS[name] ?? '#fff', color: CLASS_COLORS[name] ?? '#fff' } : {}}
            >
              <img src={classIconUrl(name, 'medium')} alt="" className="w-3.5 h-3.5 rounded-sm" />
              {label}
            </button>
          ))}
        </div>

        {/* Current-only toggle */}
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <span className="text-xs text-gray-400">Current only</span>
          <div
            onClick={() => setCurrentOnly(p => !p)}
            className={`w-8 h-4 rounded-full transition-colors relative ${currentOnly ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${currentOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Stats bar */}
      {!isLoading && data && (
        <p className="text-xs text-gray-600 mb-3">
          Showing {filtered.length} of {data.guides.length} entries
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm bg-gray-900 border border-gray-800 rounded-xl p-4">
          Failed to load guide history.
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('classLabel')}
                  >
                    Class <SortIcon k="classLabel" />
                  </th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('specLabel')}
                  >
                    Spec <SortIcon k="specLabel" />
                  </th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('generatedAt')}
                  >
                    Generated <SortIcon k="generatedAt" />
                  </th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('aplCommitDate')}
                  >
                    APL Commit <SortIcon k="aplCommitDate" />
                  </th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Model</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-600 py-10">
                      No entries match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((g, i) => (
                    <tr
                      key={g.id}
                      className={`border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors ${
                        i % 2 === 0 ? '' : 'bg-gray-900/50'
                      }`}
                    >
                      {/* Class */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={classIconUrl(g.className, 'medium')}
                            alt={g.classLabel}
                            className="w-5 h-5 rounded"
                            loading="lazy"
                          />
                          <span
                            className="font-medium text-xs"
                            style={{ color: CLASS_COLORS[g.className] ?? '#fff' }}
                          >
                            {g.classLabel}
                          </span>
                        </div>
                      </td>

                      {/* Spec */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={specIconUrl(g.specName, 'medium')}
                            alt={g.specLabel}
                            className="w-5 h-5 rounded"
                            loading="lazy"
                          />
                          <span className="text-gray-200 font-medium">{g.specLabel}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {g.isCurrent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
                            Historical
                          </span>
                        )}
                      </td>

                      {/* Generated At */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-400 tabular-nums text-xs">
                        {formatDate(g.generatedAt)}
                      </td>

                      {/* APL Commit */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs text-indigo-400">{shortSha(g.aplCommitSha)}</span>
                          <span className="text-xs text-gray-600 tabular-nums">{formatDate(g.aplCommitDate)}</span>
                        </div>
                      </td>

                      {/* Model */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 text-xs font-mono">
                        {g.modelUsed.replace('claude-', '').replace(/-\d{8}$/, '')}
                      </td>

                      {/* Link */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        <Link
                          to={`/guide/${g.specName}`}
                          className={`text-xs transition-colors ${
                            g.isCurrent
                              ? 'text-indigo-400 hover:text-indigo-300'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
