import { NavLink } from 'react-router-dom';
import { useSpecs } from '../../hooks/useSpecs';
import { useState } from 'react';

// Map class names to Tailwind color classes
const CLASS_COLORS: Record<string, string> = {
  death_knight: 'text-red-600',
  demon_hunter: 'text-purple-500',
  druid: 'text-orange-400',
  evoker: 'text-teal-400',
  hunter: 'text-lime-400',
  mage: 'text-sky-400',
  monk: 'text-emerald-400',
  paladin: 'text-pink-300',
  priest: 'text-white',
  rogue: 'text-yellow-300',
  shaman: 'text-blue-500',
  warlock: 'text-violet-400',
  warrior: 'text-yellow-600',
};

const ROLE_ICONS: Record<string, string> = {
  dps: '⚔',
  tank: '🛡',
  healer: '✚',
};

export function Sidebar() {
  const { data, isLoading } = useSpecs();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleClass = (className: string) => {
    setCollapsed(prev => ({ ...prev, [className]: !prev[className] }));
  };

  if (isLoading) {
    return (
      <nav className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto">
        <div className="p-3 space-y-1">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="h-7 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <div className="p-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2 mt-1">Classes</p>
        {data?.classes.map(cls => (
          <div key={cls.name}>
            <button
              onClick={() => toggleClass(cls.name)}
              className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-800 transition-colors font-semibold text-sm ${CLASS_COLORS[cls.name] ?? 'text-white'}`}
            >
              <span>{cls.label}</span>
              <span className="text-gray-500 text-xs">{collapsed[cls.name] ? '▶' : '▼'}</span>
            </button>

            {!collapsed[cls.name] && (
              <div className="ml-3 mb-1">
                {cls.specs.map(spec => (
                  <NavLink
                    key={spec.name}
                    to={`/guide/${spec.name}`}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      } ${!spec.hasGuide ? 'opacity-50' : ''}`
                    }
                  >
                    <span className="text-xs">{ROLE_ICONS[spec.role]}</span>
                    <span>{spec.label}</span>
                    {!spec.hasGuide && (
                      <span className="ml-auto text-xs text-gray-600">—</span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
