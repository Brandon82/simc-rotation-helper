import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useChangelog } from '../hooks/useChangelog';
import type { ChangelogCommit } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ChangelogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useChangelog(page);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (sha: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(sha) ? next.delete(sha) : next.add(sha);
      return next;
    });
  };

  return (
    <div className="pb-8">
      <div className="mb-6">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          &larr; All classes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 mt-0.5">Project Changelog</h1>
        <p className="text-sm text-gray-500">
          All commits and updates to SimC Rotation Helper.
        </p>
      </div>

      {/* Stats bar */}
      {!isLoading && data && (
        <p className="text-xs text-gray-400 dark:text-gray-600 mb-3">
          Showing {(data.page - 1) * data.perPage + 1}--{Math.min(data.page * data.perPage, data.total)} of {data.total} commits
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error || !data ? (
        <div className="text-red-500 dark:text-red-400 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          Failed to load changelog.
        </div>
      ) : (
        <div className={`${isFetching ? 'opacity-60' : ''} transition-opacity`}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="w-4 pl-2 pr-0 py-3" />
                    <th className="text-left px-4 py-3 whitespace-nowrap">Commit</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Message</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Author</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="sticky right-0 bg-white dark:bg-gray-900 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.commits.map((commit, i) => {
                    const [title, ...bodyLines] = commit.message.split('\n');
                    const body = bodyLines.filter(l => l.trim()).join('\n');
                    const hasBody = body.length > 0;

                    return (
                      <Fragment key={commit.sha}>
                        <tr
                          onClick={() => hasBody && toggleExpand(commit.sha)}
                          className={`group border-b border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                            hasBody ? 'cursor-pointer' : ''
                          } ${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/50'}`}
                        >
                          {/* Expand toggle */}
                          <td className="w-4 pl-2 pr-0 py-2.5">
                            {hasBody && (
                              <button
                                onClick={e => { e.stopPropagation(); toggleExpand(commit.sha); }}
                                className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
                                title="Show details"
                              >
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform ${expandedIds.has(commit.sha) ? 'rotate-90' : ''}`}
                                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                >
                                  <polyline points="9 6 15 12 9 18" />
                                </svg>
                              </button>
                            )}
                          </td>

                          {/* Commit SHA */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <a
                              href={commit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="font-mono text-xs text-indigo-500 dark:text-indigo-400 hover:underline"
                            >
                              {commit.shortSha}
                            </a>
                          </td>

                          {/* Message (first line only) */}
                          <td className="px-4 py-2.5">
                            <span className="text-gray-800 dark:text-gray-200 font-medium text-xs">
                              {title}
                            </span>
                          </td>

                          {/* Author */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                            {commit.author}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-gray-500 dark:text-gray-400 tabular-nums text-xs">
                            {formatDate(commit.date)}
                          </td>

                          {/* Link */}
                          <td className="sticky right-0 px-4 py-2.5 whitespace-nowrap text-right bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/40">
                            <a
                              href={commit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                            >
                              View &rarr;
                            </a>
                          </td>
                        </tr>

                        {/* Expanded description row */}
                        {hasBody && (
                          <tr className="border-b border-gray-200/60 dark:border-gray-800/60">
                            <td colSpan={6} className="p-0 bg-gray-50/50 dark:bg-gray-900/50">
                              <div
                                className="grid transition-[grid-template-rows,opacity] duration-200 ease-in-out"
                                style={{
                                  gridTemplateRows: expandedIds.has(commit.sha) ? '1fr' : '0fr',
                                  opacity: expandedIds.has(commit.sha) ? 1 : 0,
                                }}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-4 py-3 ml-6">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                                      {body}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &larr; Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
