import { NavLink } from 'react-router-dom';
import { useSpecs } from '../../hooks/useSpecs';
import { useState } from 'react';

// WoW class colors as border/glow accents
const CLASS_BORDER: Record<string, string> = {
  death_knight: 'border-red-600 text-red-400',
  demon_hunter: 'border-purple-500 text-purple-400',
  druid: 'border-orange-400 text-orange-400',
  evoker: 'border-teal-400 text-teal-400',
  hunter: 'border-lime-400 text-lime-400',
  mage: 'border-sky-400 text-sky-400',
  monk: 'border-emerald-400 text-emerald-400',
  paladin: 'border-pink-300 text-pink-300',
  priest: 'border-gray-200 text-gray-200',
  rogue: 'border-yellow-300 text-yellow-300',
  shaman: 'border-blue-400 text-blue-400',
  warlock: 'border-violet-400 text-violet-400',
  warrior: 'border-yellow-600 text-yellow-500',
};

const CLASS_ACTIVE_BG: Record<string, string> = {
  death_knight: 'bg-red-900/20',
  demon_hunter: 'bg-purple-900/20',
  druid: 'bg-orange-900/20',
  evoker: 'bg-teal-900/20',
  hunter: 'bg-lime-900/20',
  mage: 'bg-sky-900/20',
  monk: 'bg-emerald-900/20',
  paladin: 'bg-pink-900/20',
  priest: 'bg-gray-700/20',
  rogue: 'bg-yellow-900/20',
  shaman: 'bg-blue-900/20',
  warlock: 'bg-violet-900/20',
  warrior: 'bg-yellow-900/20',
};

const ROLE_ICONS: Record<string, { icon: string; color: string }> = {
  dps: { icon: '⚔', color: 'text-red-400' },
  tank: { icon: '🛡', color: 'text-blue-400' },
  healer: { icon: '✚', color: 'text-green-400' },
};

export function Sidebar() {
  const { data, isLoading } = useSpecs();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleClass = (className: string) => {
    setCollapsed(prev => ({ ...prev, [className]: !prev[className] }));
  };

  if (isLoading) {
    return (
      <nav className="w-52 shrink-0 bg-gray-950 border-r border-gray-800/60 overflow-y-auto">
        <div className="p-3 space-y-2">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-800/60 rounded animate-pulse" />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-52 shrink-0 bg-gray-950 border-r border-gray-800/60 overflow-y-auto flex flex-col">
      {/* Top nav links */}
      <div className="px-2 pt-3 pb-2 border-b border-gray-800/60 space-y-0.5">
        <NavLink
          to="/rankings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`
          }
        >
          <span className="text-yellow-400">📊</span>
          <span>Complexity Ranking</span>
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`
          }
        >
          <span className="text-blue-400">🗂</span>
          <span>Guide History</span>
        </NavLink>
      </div>

      {/* Classes section */}
      <div className="px-2 pt-3 pb-4 flex-1">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest px-2 mb-2 font-semibold">
          Classes
        </p>

        <div className="space-y-0.5">
          {data?.classes.map(cls => {
            const colors = CLASS_BORDER[cls.name] ?? 'border-gray-500 text-gray-300';
            const activeBg = CLASS_ACTIVE_BG[cls.name] ?? 'bg-gray-800/20';
            const isOpen = !!collapsed[cls.name];

            return (
              <div key={cls.name}>
                <button
                  onClick={() => toggleClass(cls.name)}
                  className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all text-xs font-semibold border-l-2 ${colors} ${
                    isOpen ? activeBg : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`}
                >
                  <span>{cls.label}</span>
                  <span className={`text-[9px] transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'} text-gray-500`}>
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-0.5 mb-1 ml-2.5 space-y-0.5">
                    {cls.specs.map(spec => {
                      const role = ROLE_ICONS[spec.role] ?? { icon: '?', color: 'text-gray-400' };
                      return (
                        <NavLink
                          key={spec.name}
                          to={`/guide/${spec.name}`}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-1 rounded text-xs transition-all ${
                              isActive
                                ? 'bg-gray-700/80 text-white font-medium'
                                : `text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 ${!spec.hasGuide ? 'opacity-40' : ''}`
                            }`
                          }
                        >
                          <span className={`${role.color} text-[10px] w-3 text-center shrink-0`}>
                            {role.icon}
                          </span>
                          <span className="truncate">{spec.label}</span>
                          {!spec.hasGuide && (
                            <span className="ml-auto text-[10px] text-gray-700 shrink-0">—</span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
