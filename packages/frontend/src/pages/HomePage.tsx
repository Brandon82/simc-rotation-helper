import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSpecs } from '../hooks/useSpecs';
import { classIconUrl, specIconUrl } from '../utils/wowIcons';
import { useThemeStore } from '../store/themeStore';
import { CLASS_COLORS_DARK, CLASS_COLORS_LIGHT } from '../utils/classColors';

const ROLE_LABELS: Record<string, string> = {
  dps: 'DPS',
  tank: 'Tank',
  healer: 'Healer',
};

const ROLE_COLORS: Record<string, string> = {
  dps:    'text-red-500 dark:text-red-400',
  tank:   'text-blue-500 dark:text-blue-400',
  healer: 'text-green-500 dark:text-green-400',
};

export function HomePage() {
  const { data, isLoading } = useSpecs();
  const navigate = useNavigate();
  const isDark = useThemeStore((s) => s.isDark);
  const [selectedClass, setSelectedClass] = useState('');

  const CLASS_COLORS = isDark ? CLASS_COLORS_DARK : CLASS_COLORS_LIGHT;

  const selectedClassData = data?.classes.find(c => c.name === selectedClass);
  const classColor = selectedClass ? (CLASS_COLORS[selectedClass] ?? (isDark ? '#fff' : '#111')) : (isDark ? '#fff' : '#111');

  const handleClassClick = (className: string) => {
    setSelectedClass(prev => (prev === className ? '' : className));
  };

  const handleSpecClick = (specName: string, hasGuide: boolean) => {
    if (hasGuide) navigate(`/guide/${specName}`);
  };

  const totalSpecs = data?.classes.reduce((n, c) => n + c.specs.filter(s => s.hasGuide).length, 0) ?? 0;

  return (
    <div className="flex flex-col items-center pb-16 min-h-[60vh]">

      {/* Hero */}
      <div className="w-full max-w-2xl mt-10 mb-8">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Background gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/40 to-orange-50/30 dark:from-blue-950/40 dark:via-purple-950/20 dark:to-orange-950/10 pointer-events-none" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />

          <div className="relative flex flex-col items-center text-center px-8 py-10 gap-5">
            {/* Icon badge */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/15">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                SimC Rotation Guides
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base max-w-sm mx-auto leading-relaxed">
                AI-generated guides built directly from SimulationCraft APLs,
                updated automatically when APLs change.
              </p>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                Auto-updated
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                AI-powered
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>
                SimC APL source
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && data && (
        <div className="flex gap-8 text-center mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.classes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Classes</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-800" />
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSpecs}</p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Specs</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-4">

        {/* Class grid */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Select a Class
          </p>

          {isLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {data?.classes.map(cls => {
                const isSelected = selectedClass === cls.name;
                const color = CLASS_COLORS[cls.name] ?? (isDark ? '#fff' : '#111');
                return (
                  <button
                    key={cls.name}
                    onClick={() => handleClassClick(cls.name)}
                    title={cls.label}
                    className={`
                      group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
                      border-2
                      ${isSelected
                        ? 'border-[var(--cls-color)] bg-gray-100 dark:bg-gray-800 shadow-lg scale-105'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60'}
                    `}
                    style={{ '--cls-color': color } as React.CSSProperties}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg overflow-hidden ring-2 transition-all ${
                        isSelected ? 'ring-[var(--cls-color)]' : 'ring-transparent group-hover:ring-gray-300 dark:group-hover:ring-gray-600'
                      }`}
                      style={{ '--cls-color': color } as React.CSSProperties}
                    >
                      <img
                        src={classIconUrl(cls.name)}
                        alt={cls.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium leading-tight text-center max-w-full truncate ${isSelected ? '' : 'text-gray-500 dark:text-gray-400'}`}
                      style={isSelected ? { color } : undefined}
                    >
                      {cls.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Spec list — expands when a class is selected */}
        {selectedClassData && (
          <div
            className="bg-white dark:bg-gray-900 border rounded-2xl p-5 transition-all"
            style={{ borderColor: `${classColor}40` }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src={classIconUrl(selectedClass)}
                alt={selectedClassData.label}
                className="w-7 h-7 rounded-md"
              />
              <p
                className="text-sm font-bold tracking-wide"
                style={{ color: classColor }}
              >
                {selectedClassData.label}
              </p>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-600">
                {selectedClassData.specs.filter(s => s.hasGuide).length}/{selectedClassData.specs.length} guides
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedClassData.specs.map(spec => (
                <button
                  key={spec.name}
                  onClick={() => handleSpecClick(spec.name, spec.hasGuide)}
                  disabled={!spec.hasGuide}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                    ${spec.hasGuide
                      ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer hover:scale-[1.02]'
                      : 'bg-gray-100/60 dark:bg-gray-800/40 cursor-not-allowed opacity-50'}
                  `}
                >
                  <img
                    src={specIconUrl(spec.name)}
                    alt={spec.label}
                    className="w-8 h-8 rounded-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{spec.label}</p>
                    <p className={`text-xs ${ROLE_COLORS[spec.role] ?? 'text-gray-500 dark:text-gray-400'}`}>
                      {ROLE_LABELS[spec.role] ?? spec.role}
                    </p>
                  </div>
                  {spec.hasGuide ? (
                    <span className="text-xs text-gray-500 shrink-0">View →</span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0">Pending</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complexity Rankings card */}
        <Link
          to="/rankings"
          className="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 rounded-2xl p-5 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/60"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
            📊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              Rotation Complexity Ranking
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              See which specs have the most complex APLs, ranked by action count.
            </p>
          </div>
          <span className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors text-lg">→</span>
        </Link>

        {/* Guide History card */}
        <Link
          to="/history"
          className="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 rounded-2xl p-5 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/60"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
            🗂
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              Guide History
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse previously generated guides and track how rotations have changed over time.
            </p>
          </div>
          <span className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors text-lg">→</span>
        </Link>

        {/* GitHub link card */}
        <a
          href="https://github.com/Brandon82/simc-rotation-helper"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 rounded-2xl p-5 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/60"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.625-5.479 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              View on GitHub
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse the source code for this project.
            </p>
          </div>
          <span className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors text-lg">→</span>
        </a>

      </div>
    </div>
  );
}
