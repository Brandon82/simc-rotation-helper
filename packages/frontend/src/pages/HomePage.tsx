import { Link } from 'react-router-dom';
import { useSpecs } from '../hooks/useSpecs';

const CLASS_COLORS: Record<string, string> = {
  death_knight: 'border-red-600 hover:bg-red-600/10',
  demon_hunter: 'border-purple-500 hover:bg-purple-500/10',
  druid: 'border-orange-400 hover:bg-orange-400/10',
  evoker: 'border-teal-400 hover:bg-teal-400/10',
  hunter: 'border-lime-400 hover:bg-lime-400/10',
  mage: 'border-sky-400 hover:bg-sky-400/10',
  monk: 'border-emerald-400 hover:bg-emerald-400/10',
  paladin: 'border-pink-300 hover:bg-pink-300/10',
  priest: 'border-white hover:bg-white/10',
  rogue: 'border-yellow-300 hover:bg-yellow-300/10',
  shaman: 'border-blue-500 hover:bg-blue-500/10',
  warlock: 'border-violet-400 hover:bg-violet-400/10',
  warrior: 'border-yellow-600 hover:bg-yellow-600/10',
};

const CLASS_TEXT: Record<string, string> = {
  death_knight: 'text-red-500',
  demon_hunter: 'text-purple-400',
  druid: 'text-orange-400',
  evoker: 'text-teal-400',
  hunter: 'text-lime-400',
  mage: 'text-sky-400',
  monk: 'text-emerald-400',
  paladin: 'text-pink-300',
  priest: 'text-gray-200',
  rogue: 'text-yellow-300',
  shaman: 'text-blue-400',
  warlock: 'text-violet-400',
  warrior: 'text-yellow-500',
};

const ROLE_ICONS: Record<string, string> = {
  dps: '⚔',
  tank: '🛡',
  healer: '✚',
};

export function HomePage() {
  const { data, isLoading } = useSpecs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 13 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">WoW Rotation Guides</h1>
        <p className="text-gray-400 text-sm">
          AI-generated rotation guides based on SimulationCraft Action Priority Lists.
          Updated automatically when APLs change.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.classes.map(cls => (
          <div
            key={cls.name}
            className={`bg-gray-900 rounded-xl border ${CLASS_COLORS[cls.name] ?? 'border-gray-700 hover:bg-gray-800'} transition-colors p-4`}
          >
            <h2 className={`text-lg font-bold mb-3 ${CLASS_TEXT[cls.name] ?? 'text-white'}`}>
              {cls.label}
            </h2>
            <div className="space-y-1.5">
              {cls.specs.map(spec => (
                spec.hasGuide ? (
                  <Link
                    key={spec.name}
                    to={`/guide/${spec.name}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm text-gray-200 group"
                  >
                    <span className="text-xs">{ROLE_ICONS[spec.role]}</span>
                    <span>{spec.label}</span>
                    <span className="ml-auto text-gray-500 group-hover:text-gray-300 text-xs">View guide →</span>
                  </Link>
                ) : (
                  <div
                    key={spec.name}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40 text-sm text-gray-600 cursor-default"
                  >
                    <span className="text-xs">{ROLE_ICONS[spec.role]}</span>
                    <span>{spec.label}</span>
                    <span className="ml-auto text-xs">Pending</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
