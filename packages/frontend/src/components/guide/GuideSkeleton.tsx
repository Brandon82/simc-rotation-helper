export function GuideSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Meta bar */}
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />

      {/* Title */}
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />

      {/* Sections */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="pl-4 border-l-2 border-gray-300 dark:border-gray-700 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-40" />
          <div className="h-4 bg-gray-200/70 dark:bg-gray-800/60 rounded" />
          <div className="h-4 bg-gray-200/70 dark:bg-gray-800/60 rounded w-4/5" />
          {i % 2 === 0 && (
            <div className="space-y-1.5 mt-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-10 bg-gray-200/60 dark:bg-gray-800/40 rounded-lg" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
