import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSpecs } from '../hooks/useSpecs';

// Wowhead icon CDN — class names must be lowercase, no underscores
const WH_BASE = 'https://wow.zamimg.com/images/wow/icons/medium';

const CLASS_ICON: Record<string, string> = {
  death_knight: `${WH_BASE}/classicon_deathknight.jpg`,
  demon_hunter: `${WH_BASE}/classicon_demonhunter.jpg`,
  druid:        `${WH_BASE}/classicon_druid.jpg`,
  evoker:       `${WH_BASE}/classicon_evoker.jpg`,
  hunter:       `${WH_BASE}/classicon_hunter.jpg`,
  mage:         `${WH_BASE}/classicon_mage.jpg`,
  monk:         `${WH_BASE}/classicon_monk.jpg`,
  paladin:      `${WH_BASE}/classicon_paladin.jpg`,
  priest:       `${WH_BASE}/classicon_priest.jpg`,
  rogue:        `${WH_BASE}/classicon_rogue.jpg`,
  shaman:       `${WH_BASE}/classicon_shaman.jpg`,
  warlock:      `${WH_BASE}/classicon_warlock.jpg`,
  warrior:      `${WH_BASE}/classicon_warrior.jpg`,
};

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

const ROLE_ICONS: Record<string, string> = {
  dps: '⚔',
  tank: '🛡',
  healer: '✚',
};

const ROLE_COLORS: Record<string, string> = {
  dps:    'text-red-400',
  tank:   'text-blue-400',
  healer: 'text-green-400',
};

export function HomePage() {
  const { data, isLoading } = useSpecs();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');

  const selectedClassData = data?.classes.find(c => c.name === selectedClass);
  const classColor = selectedClass ? (CLASS_COLORS[selectedClass] ?? '#fff') : '#fff';

  const handleClassClick = (className: string) => {
    setSelectedClass(prev => (prev === className ? '' : className));
  };

  const handleSpecClick = (specName: string, hasGuide: boolean) => {
    if (hasGuide) navigate(`/guide/${specName}`);
  };

  const totalGuides = data?.classes.reduce((n, c) => n + c.specs.filter(s => s.hasGuide).length, 0) ?? 0;
  const totalSpecs  = data?.classes.reduce((n, c) => n + c.specs.length, 0) ?? 0;

  return (
    <div className="flex flex-col items-center pb-16 min-h-[60vh]">

      {/* Hero */}
      <div className="text-center mt-10 mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          WoW Rotation Guides
        </h1>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          AI-generated guides built directly from SimulationCraft APLs,
          updated automatically when APLs change.
        </p>
      </div>

      {/* Stats row */}
      {!isLoading && data && (
        <div className="flex gap-8 text-center mb-8">
          <div>
            <p className="text-2xl font-bold text-white">{data.classes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Classes</p>
          </div>
          <div className="w-px bg-gray-800" />
          <div>
            <p className="text-2xl font-bold text-white">{totalSpecs}</p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Specs</p>
          </div>
          <div className="w-px bg-gray-800" />
          <div>
            <p className="text-2xl font-bold text-white">{totalGuides}</p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Guides Ready</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-4">

        {/* Class grid */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Select a Class
          </p>

          {isLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
              {data?.classes.map(cls => {
                const isSelected = selectedClass === cls.name;
                const color = CLASS_COLORS[cls.name] ?? '#fff';
                return (
                  <button
                    key={cls.name}
                    onClick={() => handleClassClick(cls.name)}
                    title={cls.label}
                    className={`
                      group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all
                      border-2
                      ${isSelected
                        ? 'border-[var(--cls-color)] bg-gray-800 shadow-lg scale-105'
                        : 'border-transparent hover:border-gray-700 hover:bg-gray-800/60'}
                    `}
                    style={{ '--cls-color': color } as React.CSSProperties}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg overflow-hidden ring-2 transition-all ${
                        isSelected ? 'ring-[var(--cls-color)]' : 'ring-transparent group-hover:ring-gray-600'
                      }`}
                      style={{ '--cls-color': color } as React.CSSProperties}
                    >
                      <img
                        src={CLASS_ICON[cls.name]}
                        alt={cls.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span
                      className="text-[10px] font-medium leading-tight text-center max-w-full truncate"
                      style={{ color: isSelected ? color : '#9ca3af' }}
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
            className="bg-gray-900 border rounded-2xl p-5 transition-all"
            style={{ borderColor: `${classColor}40` }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src={CLASS_ICON[selectedClass]}
                alt={selectedClassData.label}
                className="w-7 h-7 rounded-md"
              />
              <p
                className="text-sm font-bold tracking-wide"
                style={{ color: classColor }}
              >
                {selectedClassData.label}
              </p>
              <span className="ml-auto text-xs text-gray-600">
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
                      ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer hover:scale-[1.02]'
                      : 'bg-gray-800/40 cursor-not-allowed opacity-50'}
                  `}
                >
                  <span
                    className={`text-base ${ROLE_COLORS[spec.role] ?? 'text-gray-400'}`}
                    title={spec.role}
                  >
                    {ROLE_ICONS[spec.role]}
                  </span>
                  <span className="text-sm font-medium text-white flex-1">{spec.label}</span>
                  {spec.hasGuide ? (
                    <span className="text-xs text-gray-500">View →</span>
                  ) : (
                    <span className="text-xs text-gray-600">Pending</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complexity Rankings card */}
        <Link
          to="/rankings"
          className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all hover:bg-gray-800/60"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-indigo-600/30 transition-colors">
            📊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
              Rotation Complexity Ranking
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              See which specs have the most complex APLs, ranked by action count.
            </p>
          </div>
          <span className="text-gray-600 group-hover:text-indigo-400 transition-colors text-lg">→</span>
        </Link>

        {/* Guide History card */}
        <Link
          to="/history"
          className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all hover:bg-gray-800/60"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-blue-600/30 transition-colors">
            🗂
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
              Guide History
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse previously generated guides and track how rotations have changed over time.
            </p>
          </div>
          <span className="text-gray-600 group-hover:text-blue-400 transition-colors text-lg">→</span>
        </Link>

      </div>
    </div>
  );
}
