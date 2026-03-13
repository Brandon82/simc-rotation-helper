import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800/60 shadow-lg shadow-black/30">
      <div className="flex items-center gap-4 px-5 h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
            <span className="text-yellow-400 text-sm">⚔</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold text-base tracking-tight leading-none">SimC</span>
            <span className="text-yellow-400 font-bold text-base tracking-tight leading-none">Rotation</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-700/60 ml-1" />

        {/* Subtitle */}
        <span className="text-gray-500 text-xs font-medium tracking-wide hidden sm:block">
          WoW Rotation Guides
        </span>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-gray-600 text-xs hidden md:block">
            Powered by SimulationCraft + Claude AI
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" title="Live" />
        </div>
      </div>
      {/* Accent line */}
      <div className="h-px bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-transparent" />
    </header>
  );
}
