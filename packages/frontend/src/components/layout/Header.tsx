import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur border-b border-gray-800">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl font-bold text-white tracking-tight">
            SimC<span className="text-yellow-400"> Rotation</span>
          </span>
        </Link>
        <span className="text-gray-600 text-sm ml-auto">
          Powered by SimulationCraft + Claude AI
        </span>
      </div>
    </header>
  );
}
