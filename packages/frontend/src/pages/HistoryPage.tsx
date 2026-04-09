import { useState, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAllGuides } from '../hooks/useAllGuides';
import type { GuideSummaryItem } from '../types';
import { classIconUrl, specIconUrl } from '../utils/wowIcons';
import { useThemeStore } from '../store/themeStore';
import { CLASS_COLORS_DARK, CLASS_COLORS_LIGHT } from '../utils/classColors';
import { InlineMarkdown } from '../components/guide/InlineMarkdown';

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
  const isDark = useThemeStore((s) => s.isDark);
  const CLASS_COLORS = isDark ? CLASS_COLORS_DARK : CLASS_COLORS_LIGHT;

  const [classFilter, setClassFilter] = useState<string>('');
  const [currentOnly, setCurrentOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('generatedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
    <span className="ml-1 text-gray-400 dark:text-gray-600 text-xs">
      {sortKey === k ? (sortAsc ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className="pb-8">
      <div className="mb-6">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          ← All classes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 mt-0.5">Guide History</h1>
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
          className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-56"
        />

        {/* Class filter chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setClassFilter('')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              !classFilter
                ? 'bg-gray-500 dark:bg-gray-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
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
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white ring-1'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              style={classFilter === name ? { ringColor: CLASS_COLORS[name] ?? '#888', color: CLASS_COLORS[name] ?? '#888' } : {}}
            >
              <img src={classIconUrl(name, 'medium')} alt="" className="w-3.5 h-3.5 rounded-sm" />
              {label}
            </button>
          ))}
        </div>

        {/* Current-only toggle */}
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <span className="text-xs text-gray-600 dark:text-gray-400">Current only</span>
          <div
            onClick={() => setCurrentOnly(p => !p)}
            className={`w-8 h-4 rounded-full transition-colors relative ${currentOnly ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${currentOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Stats bar */}
      {!isLoading && data && (
        <p className="text-xs text-gray-400 dark:text-gray-600 mb-3">
          Showing {filtered.length} of {data.guides.length} entries
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          Failed to load guide history.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="w-4 pl-2 pr-0 py-3" />
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('classLabel')}
                  >
                    Class <SortIcon k="classLabel" />
                  </th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('specLabel')}
                  >
                    Spec <SortIcon k="specLabel" />
                  </th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('generatedAt')}
                  >
                    Generated <SortIcon k="generatedAt" />
                  </th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none whitespace-nowrap"
                    onClick={() => handleSort('aplCommitDate')}
                  >
                    APL Commit <SortIcon k="aplCommitDate" />
                  </th>
                  <th className="sticky right-0 bg-white dark:bg-gray-900 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 dark:text-gray-600 py-10">
                      No entries match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((g, i) => (
                    <Fragment key={g.id}>
                    <tr
                      onClick={() => g.changelog?.items?.length && setExpandedIds(prev => { const next = new Set(prev); next.has(g.id) ? next.delete(g.id) : next.add(g.id); return next; })}
                      className={`group border-b border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                        g.changelog?.items?.length ? 'cursor-pointer' : ''
                      } ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/50'}`}
                    >
                      {/* Expand toggle */}
                      <td className="w-4 pl-2 pr-0 py-2.5">
                        {g.changelog?.items?.length ? (
                          <button
                            onClick={() => setExpandedIds(prev => { const next = new Set(prev); next.has(g.id) ? next.delete(g.id) : next.add(g.id); return next; })}
                            className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
                            title={`${g.changelog.items.length} change${g.changelog.items.length > 1 ? 's' : ''}`}
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${expandedIds.has(g.id) ? 'rotate-90' : ''}`}
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            >
                              <polyline points="9 6 15 12 9 18" />
                            </svg>
                          </button>
                        ) : null}
                      </td>

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
                            style={{ color: CLASS_COLORS[g.className] ?? (isDark ? '#fff' : '#111') }}
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
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{g.specLabel}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {g.isCurrent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800">
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-300 dark:border-gray-700">
                            Historical
                          </span>
                        )}
                      </td>

                      {/* Generated At */}
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 dark:text-gray-400 tabular-nums text-xs">
                        {formatDate(g.generatedAt)}
                      </td>

                      {/* APL Commit */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400">{shortSha(g.aplCommitSha)}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-600 tabular-nums">{formatDate(g.aplCommitDate)}</span>
                        </div>
                      </td>

                      {/* Link */}
                      <td className="sticky right-0 px-4 py-2.5 whitespace-nowrap text-right bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40">
                        <Link
                          to={`/guide/${g.specName}`}
                          onClick={e => e.stopPropagation()}
                          className={`text-xs transition-colors ${
                            g.isCurrent
                              ? 'text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300'
                              : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                          }`}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>

                    {/* Expanded changelog row */}
                    {g.changelog?.items?.length ? (
                      <tr className="border-b border-gray-200/60 dark:border-gray-800/60">
                        <td colSpan={7} className="p-0 bg-gray-50/50 dark:bg-gray-900/50">
                          <div
                            className="grid transition-[grid-template-rows,opacity] duration-200 ease-in-out"
                            style={{
                              gridTemplateRows: expandedIds.has(g.id) ? '1fr' : '0fr',
                              opacity: expandedIds.has(g.id) ? 1 : 0,
                            }}
                          >
                            <div className="overflow-hidden">
                              <div className="p-3">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/60 overflow-hidden">
                                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/80">
                                    <svg className="w-3 h-3 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Changes from{' '}
                                      <a
                                        href={`https://github.com/simulationcraft/simc/commit/${g.changelog.previousCommitSha}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="text-indigo-500 dark:text-indigo-400 hover:underline font-mono"
                                      >
                                        {g.changelog.previousCommitSha.slice(0, 7)}
                                      </a>
                                      {' · '}{new Date(g.changelog.previousGeneratedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <ul className="px-3 py-2 space-y-1">
                                    {g.changelog.items.map((item: string, j: number) => (
                                      <li key={j} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                        <span className="text-gray-300 dark:text-gray-600 mt-px shrink-0">•</span>
                                        <InlineMarkdown text={item} />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
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
