import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpecs } from '../hooks/useSpecs';

const CLASS_COLORS: Record<string, string> = {
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

const CLASS_ACCENT: Record<string, string> = {
  death_knight: 'border-red-600 focus:ring-red-600/40',
  demon_hunter: 'border-purple-500 focus:ring-purple-500/40',
  druid: 'border-orange-400 focus:ring-orange-400/40',
  evoker: 'border-teal-400 focus:ring-teal-400/40',
  hunter: 'border-lime-400 focus:ring-lime-400/40',
  mage: 'border-sky-400 focus:ring-sky-400/40',
  monk: 'border-emerald-400 focus:ring-emerald-400/40',
  paladin: 'border-pink-300 focus:ring-pink-300/40',
  priest: 'border-gray-300 focus:ring-gray-300/40',
  rogue: 'border-yellow-300 focus:ring-yellow-300/40',
  shaman: 'border-blue-500 focus:ring-blue-500/40',
  warlock: 'border-violet-400 focus:ring-violet-400/40',
  warrior: 'border-yellow-600 focus:ring-yellow-600/40',
};

const ROLE_ICONS: Record<string, string> = {
  dps: '⚔',
  tank: '🛡',
  healer: '✚',
};

export function HomePage() {
  const { data, isLoading } = useSpecs();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  const selectedClassData = data?.classes.find(c => c.name === selectedClass);
  const accentClasses = selectedClass
    ? (CLASS_ACCENT[selectedClass] ?? 'border-gray-600 focus:ring-gray-600/40')
    : 'border-gray-700 focus:ring-gray-600/40';

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedSpec('');
  };

  const handleView = () => {
    if (selectedSpec) navigate(`/guide/${selectedSpec}`);
  };

  const canView = !!selectedSpec && (selectedClassData?.specs.find(s => s.name === selectedSpec)?.hasGuide ?? false);

  return (
    <div className="flex flex-col items-center justify-start pt-12 pb-16 min-h-[60vh]">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          WoW Rotation Guides
        </h1>
        <p className="text-gray-400 text-base max-w-md mx-auto">
          AI-generated guides built directly from SimulationCraft Action Priority Lists,
          updated automatically when APLs change.
        </p>
      </div>

      {/* Selector card */}
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        {/* Class dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
            Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={e => handleClassChange(e.target.value)}
              disabled={isLoading}
              className={`w-full appearance-none bg-gray-800 border rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 transition-colors ${accentClasses} ${
                selectedClass ? (CLASS_COLORS[selectedClass] ?? 'text-white') : 'text-gray-400'
              }`}
            >
              <option value="" disabled className="text-gray-400">
                {isLoading ? 'Loading…' : 'Select a class'}
              </option>
              {data?.classes.map(cls => (
                <option key={cls.name} value={cls.name} className="text-white bg-gray-800">
                  {cls.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
          </div>
        </div>

        {/* Spec dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
            Specialization
          </label>
          <div className="relative">
            <select
              value={selectedSpec}
              onChange={e => setSelectedSpec(e.target.value)}
              disabled={!selectedClass}
              className={`w-full appearance-none bg-gray-800 border rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 transition-colors ${accentClasses} ${
                !selectedClass ? 'opacity-40 cursor-not-allowed' : ''
              } ${selectedSpec ? 'text-white' : 'text-gray-400'}`}
            >
              <option value="" disabled className="text-gray-400">
                {!selectedClass ? 'Select a class first' : 'Select a spec'}
              </option>
              {selectedClassData?.specs.map(spec => (
                <option
                  key={spec.name}
                  value={spec.name}
                  disabled={!spec.hasGuide}
                  className="text-white bg-gray-800 disabled:text-gray-600"
                >
                  {ROLE_ICONS[spec.role]} {spec.label}{!spec.hasGuide ? ' (pending)' : ''}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleView}
          disabled={!canView}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
            canView
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/30'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          View Guide →
        </button>
      </div>

      {/* Quick-stats row */}
      {!isLoading && data && (
        <div className="mt-10 flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{data.classes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Classes</p>
          </div>
          <div className="w-px bg-gray-800" />
          <div>
            <p className="text-2xl font-bold text-white">
              {data.classes.reduce((n, c) => n + c.specs.length, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Specs</p>
          </div>
          <div className="w-px bg-gray-800" />
          <div>
            <p className="text-2xl font-bold text-white">
              {data.classes.reduce((n, c) => n + c.specs.filter(s => s.hasGuide).length, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Guides Ready</p>
          </div>
        </div>
      )}
    </div>
  );
}
