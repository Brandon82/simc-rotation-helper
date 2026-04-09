import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChangelog } from '../hooks/useChangelog';
import type { ChangelogCommit } from '../types';

function formatRelativeDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

function groupCommitsByDate(commits: ChangelogCommit[]): Map<string, ChangelogCommit[]> {
  const groups = new Map<string, ChangelogCommit[]>();
  for (const commit of commits) {
    const day = new Date(commit.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(commit);
  }
  return groups;
}

export function ChangelogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useChangelog(page);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">Failed to load changelog.</p>
        <Link to="/" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">&larr; Back to home</Link>
      </div>
    );
  }

  const grouped = groupCommitsByDate(data.commits);

  return (
    <div className="pb-8">
      <div className="mb-6">
        <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          &larr; All classes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 mt-0.5">Project Changelog</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          All commits and updates to SimC Rotation Helper.
        </p>
      </div>

      <div className={`space-y-6 ${isFetching ? 'opacity-60' : ''} transition-opacity`}>
        {[...grouped.entries()].map(([day, commits]) => (
          <div key={day}>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-1">
              {day}
            </h2>
            <div className="space-y-1.5">
              {commits.map(commit => {
                const [title, ...bodyLines] = commit.message.split('\n');
                const body = bodyLines.filter(l => l.trim()).join('\n');

                return (
                  <div
                    key={commit.sha}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                          {title}
                        </p>
                        {body && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-line leading-relaxed">
                            {body}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <span>{commit.author}</span>
                          <span>{formatRelativeDate(commit.date)}</span>
                        </div>
                      </div>
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {commit.shortSha}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Previous
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {data.totalPages} ({data.total} commits)
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
  );
}
