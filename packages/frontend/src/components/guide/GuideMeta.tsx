interface GuideMetaProps {
  specName: string;
  aplCommitSha: string;
  aplCommitDate: string;
  generatedAt: string;
  modelUsed: string;
}

export function GuideMeta({ specName, aplCommitSha, aplCommitDate, generatedAt, modelUsed }: GuideMetaProps) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const aplUrl = `https://github.com/simulationcraft/simc/blob/${aplCommitSha}/ActionPriorityLists/default/${specName}.simc`;

  return (
    <div className="flex flex-wrap gap-3 text-xs text-gray-500 bg-gray-900 rounded-lg px-4 py-2.5 border border-gray-800 mb-6">
      <span>
        <span className="text-gray-400">APL commit:</span>{' '}
        <a
          href={aplUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-yellow-600 hover:text-yellow-400 underline underline-offset-2"
        >
          {aplCommitSha.slice(0, 8)}
        </a>{' '}
        <span>({fmt(aplCommitDate)})</span>
      </span>
      <span className="text-gray-700">|</span>
      <span>
        <span className="text-gray-400">Guide generated:</span> {fmt(generatedAt)}
      </span>
      <span className="text-gray-700">|</span>
      <span>
        <span className="text-gray-400">Model:</span> {modelUsed}
      </span>
    </div>
  );
}
