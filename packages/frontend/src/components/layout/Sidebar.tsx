import { NavLink } from 'react-router-dom';
import { useSpecs } from '../../hooks/useSpecs';
import { useState } from 'react';
import { specIconUrl } from '../../utils/wowIcons';
import { CLASS_BORDER, CLASS_TEXT, CLASS_ACTIVE_BG } from '../../utils/classColors';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data, isLoading } = useSpecs();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleClass = (className: string) => {
    setCollapsed(prev => ({ ...prev, [className]: !prev[className] }));
  };

  const navClass = [
    'w-52 shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800/60 overflow-y-auto',
    // Mobile: fixed overlay, slide in/out
    'fixed top-14 left-0 bottom-0 z-40 transition-transform duration-200',
    isOpen ? 'translate-x-0' : '-translate-x-full',
    // Desktop: static, always visible
    'md:static md:translate-x-0 md:top-auto md:z-auto md:transition-none',
  ].join(' ');

  if (isLoading) {
    return (
      <nav className={navClass}>
        <div className="p-3 space-y-2">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-gray-800/60 rounded animate-pulse" />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${navClass} flex flex-col`}>
      {/* Top nav links */}
      <div className="px-2 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800/60 space-y-0.5">
        <NavLink
          to="/rankings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
        >
          <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <span>Complexity Ranking</span>
        </NavLink>
        <NavLink
          to="/history"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
        >
          <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Guide History</span>
        </NavLink>
        <NavLink
          to="/changelog"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
        >
          <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m-6 9 2 2 4-4" />
          </svg>
          <span>Project Changelog</span>
        </NavLink>
        <NavLink
          to="/ask-ai"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`
          }
        >
          <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Ask AI</span>
        </NavLink>
      </div>

      {/* Classes section */}
      <div className="px-2 pt-3 pb-4 flex-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest px-2 mb-2 font-semibold">
          Classes
        </p>

        <div className="space-y-0.5">
          {data?.classes.map(cls => {
            const borderColor = CLASS_BORDER[cls.name] ?? 'border-gray-400 dark:border-gray-500';
            const textColor = CLASS_TEXT[cls.name] ?? 'text-gray-600 dark:text-gray-300';
            const activeBg = CLASS_ACTIVE_BG[cls.name] ?? 'bg-gray-100 dark:bg-gray-800/20';
            const isOpen = !!collapsed[cls.name];

            return (
              <div key={cls.name}>
                <button
                  onClick={() => toggleClass(cls.name)}
                  className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all text-xs font-semibold border-l-2 ${textColor} ${
                    isOpen
                      ? `${borderColor} ${activeBg}`
                      : 'border-transparent hover:bg-gray-100/80 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <span>{cls.label}</span>
                  <span className={`text-[9px] transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'} text-gray-400 dark:text-gray-500`}>
                    ▼
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{ maxHeight: isOpen ? `${cls.specs.length * 32}px` : '0px', opacity: isOpen ? 1 : 0 }}
                >
                  <div className="mt-0.5 mb-1 ml-2.5 space-y-0.5">
                    {cls.specs.map(spec => (
                      <NavLink
                        key={spec.name}
                        to={`/guide/${spec.name}`}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-1 rounded text-xs transition-all ${
                            isActive
                              ? 'bg-gray-300/80 dark:bg-gray-700/80 text-gray-900 dark:text-white font-medium'
                              : `text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 ${!spec.hasGuide ? 'opacity-40' : ''}`
                          }`
                        }
                      >
                        <img
                          src={specIconUrl(spec.name, 'medium')}
                          alt=""
                          className="w-4 h-4 rounded-sm shrink-0 object-cover"
                        />
                        <span className="truncate">{spec.label}</span>
                        {!spec.hasGuide && (
                          <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-700 shrink-0">unsupported</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
