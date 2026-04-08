import { useParams, Link } from 'react-router-dom';
import { useGuide, useGuideHistory } from '../hooks/useGuide';
import { GuideMeta } from '../components/guide/GuideMeta';
import { GuideSection } from '../components/guide/GuideSection';
import { InlineMarkdown } from '../components/guide/InlineMarkdown';
import { GuideSkeleton } from '../components/guide/GuideSkeleton';
import { useState } from 'react';
import { fetchHistoricalGuide } from '../api/client';
import type { GuideApiResponse } from '../types';
import { specIconUrl, classIconUrl } from '../utils/wowIcons';

function toLabel(specName: string): string {
  const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  const knownTwoWordSpecs = ['beast_mastery'];
  for (const spec of knownTwoWordSpecs) {
    if (specName.endsWith('_' + spec)) {
      const cls = specName.slice(0, -(spec.length + 1));
      return `${spec.split('_').map(capitalize).join(' ')} ${cls.split('_').map(capitalize).join(' ')}`;
    }
  }
  const parts = specName.split('_');
  const spec = parts[parts.length - 1];
  const cls = parts.slice(0, -1);
  return `${capitalize(spec)} ${cls.map(capitalize).join(' ')}`;
}

function getClassName(specName: string): string {
  // e.g. "warrior_arms" → "warrior", "death_knight_blood" → "death_knight"
  const knownTwoWordClasses = ['death_knight', 'demon_hunter'];
  for (const prefix of knownTwoWordClasses) {
    if (specName.startsWith(prefix + '_')) return prefix;
  }
  const knownTwoWordSpecs = ['beast_mastery'];
  for (const spec of knownTwoWordSpecs) {
    if (specName.endsWith('_' + spec)) return specName.slice(0, -(spec.length + 1));
  }
  return specName.split('_').slice(0, -1).join('_');
}

export function SpecPage() {
  const { specName } = useParams<{ specName: string }>();
  const { data: guide, isLoading, error } = useGuide(specName ?? '');
  const { data: historyData } = useGuideHistory(specName ?? '');
  const [showHistory, setShowHistory] = useState(false);
  const [historicalGuide, setHistoricalGuide] = useState<GuideApiResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const displayGuide = historicalGuide ?? guide;

  const loadHistoricalGuide = async (id: string) => {
    if (!specName) return;
    setLoadingHistory(true);
    try {
      const g = await fetchHistoricalGuide(specName, id);
      setHistoricalGuide(g);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (isLoading) return <GuideSkeleton />;

  if (error || !guide) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {error ? 'Failed to load guide.' : 'No guide available yet for this spec.'}
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Guides are generated daily when APLs change on SimulationCraft GitHub.
        </p>
        <Link to="/" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const specLabel = toLabel(specName ?? '');
  const className = getClassName(specName ?? '');

  return (
    <div className="pb-8">
      {/* Spec header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 mt-1">
            <img
              src={specIconUrl(specName ?? '', 'large')}
              alt={specLabel}
              className="w-12 h-12 rounded-lg"
            />
            <img
              src={classIconUrl(className, 'medium')}
              alt=""
              className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded border-2 border-white dark:border-gray-950"
            />
          </div>
          <div>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              ← All classes
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{specLabel}</h1>
          </div>
        </div>

        {/* History toggle */}
        {historyData && historyData.history.length > 1 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 transition-colors"
          >
            History ({historyData.history.length})
          </button>
        )}
      </div>

      {/* History panel */}
      {showHistory && historyData && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs text-gray-500 mb-2">Previously generated guides:</p>
          <div className="space-y-1">
            {historyData.history.map(h => (
              <button
                key={h.id}
                onClick={() => {
                  if (h.id === guide.id) {
                    setHistoricalGuide(null);
                  } else {
                    loadHistoricalGuide(h.id);
                  }
                }}
                className={`w-full text-left flex items-center gap-3 px-3 py-1.5 rounded text-xs transition-colors ${
                  (historicalGuide?.id ?? guide.id) === h.id
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <code className="text-yellow-600 dark:text-yellow-600">{h.aplCommitSha.slice(0, 8)}</code>
                <span>{new Date(h.generatedAt).toLocaleDateString()}</span>
                {h.id === guide.id && <span className="ml-auto text-green-600 dark:text-green-500">current</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {historicalGuide && (
        <div className="mb-4 flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded px-3 py-2">
          <span>⚠ Viewing historical guide.</span>
          <button
            onClick={() => setHistoricalGuide(null)}
            className="underline hover:no-underline"
          >
            Return to current
          </button>
        </div>
      )}

      {loadingHistory && <GuideSkeleton />}

      {!loadingHistory && displayGuide && (
        <>
          <GuideMeta
            aplFileName={displayGuide.aplFileName}
            aplCommitSha={displayGuide.aplCommitSha}
            aplCommitDate={displayGuide.aplCommitDate}
            generatedAt={displayGuide.generatedAt}
            modelUsed={displayGuide.modelUsed}
          />

          {displayGuide.changelog && displayGuide.changelog.items?.length > 0 && (
            <div className="mb-2 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 animate-fade-in-up">
              <button
                onClick={() => setShowChangelog(!showChangelog)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span className="text-xs">
                    <span className="text-gray-600 dark:text-gray-400">What Changed?</span>
                    {' '}
                    <span className="text-gray-500">
                      previous commit{' '}
                      <span className="font-mono text-yellow-600 dark:text-yellow-600">
                        {displayGuide.changelog.previousCommitSha.slice(0, 7)}
                      </span>
                      {' '}on {new Date(displayGuide.changelog.previousGeneratedAt).toLocaleDateString()}
                    </span>
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showChangelog ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showChangelog && (
                <div className="px-4 pb-3 pt-2">
                  <ul className="space-y-1.5">
                    {displayGuide.changelog.items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-gray-300 dark:text-gray-600 mt-px shrink-0">•</span>
                        <InlineMarkdown text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {displayGuide.guide.sections
            .filter(section => section.id !== 'opener')
            .map((section, i) => (
              <div
                key={section.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <GuideSection section={section} />
              </div>
            ))}
        </>
      )}
    </div>
  );
}
