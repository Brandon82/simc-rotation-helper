import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';

interface HeaderProps {
  onToggleSidebar: () => void;
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { isDark, toggle } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800/60 shadow-lg shadow-black/10 dark:shadow-black/30">
      <div className="flex items-center gap-4 px-5 h-14">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 -ml-1"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
            <span className="text-yellow-500 dark:text-yellow-400 text-sm">⚔</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-gray-900 dark:text-white font-bold text-base tracking-tight leading-none">SimC</span>
            <span className="text-yellow-500 dark:text-yellow-400 font-bold text-base tracking-tight leading-none">Rotation</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700/60 ml-1" />

        {/* Subtitle */}
        <span className="text-gray-500 dark:text-gray-500 text-xs font-medium tracking-wide hidden sm:block">
          WoW Rotation Guides
        </span>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-gray-400 dark:text-gray-600 text-xs hidden md:block">
            Powered by{' '}
            <a
              href="https://www.simulationcraft.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors underline underline-offset-2"
            >
              SimulationCraft
            </a>
            {' + '}
            <a
              href="https://www.anthropic.com/claude"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors underline underline-offset-2"
            >
              Claude AI
            </a>
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" title="Live" />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
      {/* Accent line */}
      <div className="h-px bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-transparent" />
    </header>
  );
}
