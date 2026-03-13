import { useParams, Link } from 'react-router-dom';
import { useGuide, useGuideHistory } from '../hooks/useGuide';
import { GuideMeta } from '../components/guide/GuideMeta';
import { GuideSection } from '../components/guide/GuideSection';
import { GuideSkeleton } from '../components/guide/GuideSkeleton';
import { useState } from 'react';
import { fetchHistoricalGuide } from '../api/client';
import type { GuideApiResponse } from '../types';

const ROLE_LABELS: Record<string, string> = {
  dps: 'DPS',
  tank: 'Tank',
  healer: 'Healer',
};

function toLabel(specName: string): string {
  return specName
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function SpecPage() {
  const { specName } = useParams<{ specName: string }>();
  const { data: guide, isLoading, error } = useGuide(specName ?? '');
  const { data: historyData } = useGuideHistory(specName ?? '');
  const [showHistory, setShowHistory] = useState(false);
  const [historicalGuide, setHistoricalGuide] = useState<GuideApiResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
        <p className="text-gray-400 mb-2">
          {error ? 'Failed to load guide.' : 'No guide available yet for this spec.'}
        </p>
        <p className="text-gray-600 text-sm mb-4">
          Guides are generated daily when APLs change on SimulationCraft GitHub.
        </p>
        <Link to="/" className="text-sm text-blue-400 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const specLabel = toLabel(specName ?? '');

  return (
    <div>
      {/* Spec header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← All classes
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1">{specLabel}</h1>
        </div>

        {/* History toggle */}
        {historyData && historyData.history.length > 1 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 rounded px-2 py-1 transition-colors"
          >
            History ({historyData.history.length})
          </button>
        )}
      </div>

      {/* History panel */}
      {showHistory && historyData && (
        <div className="mb-6 bg-gray-900 rounded-lg border border-gray-700 p-3">
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
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <code className="text-yellow-600">{h.aplCommitSha.slice(0, 8)}</code>
                <span>{new Date(h.generatedAt).toLocaleDateString()}</span>
                {h.id === guide.id && <span className="ml-auto text-green-500">current</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {historicalGuide && (
        <div className="mb-4 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-900/20 border border-yellow-800/50 rounded px-3 py-2">
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
            specName={specName ?? ''}
            aplCommitSha={displayGuide.aplCommitSha}
            aplCommitDate={displayGuide.aplCommitDate}
            generatedAt={displayGuide.generatedAt}
            modelUsed={displayGuide.modelUsed}
          />

          {displayGuide.guide.sections
            .filter(section => section.id !== 'opener')
            .map(section => (
              <GuideSection key={section.id} section={section} />
            ))}
        </>
      )}
    </div>
  );
}
