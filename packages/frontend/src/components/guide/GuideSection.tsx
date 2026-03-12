import type { GuideSection as GuideSectionType } from '../../types';
import { PriorityList } from './PriorityList';

interface GuideSectionProps {
  section: GuideSectionType;
}

// Canonical titles by section id — overrides whatever the LLM returned
const SECTION_TITLES: Record<string, string> = {
  single_target: 'Single Target Priority',
  aoe: 'AoE Priority',
};

// Section header colors by section id
const SECTION_ACCENTS: Record<string, string> = {
  overview: 'border-blue-500',
  talent_notes: 'border-purple-500',
  precombat: 'border-green-500',
  opener: 'border-yellow-500',
  single_target: 'border-orange-500',
  aoe: 'border-red-500',
  items_and_racials: 'border-yellow-500',
  summary: 'border-teal-500',
};

export function GuideSection({ section }: GuideSectionProps) {
  const accentBorder = SECTION_ACCENTS[section.id] ?? 'border-gray-500';
  const title = SECTION_TITLES[section.id] ?? section.title;

  return (
    <section className={`mb-6 pl-4 border-l-2 ${accentBorder}`}>
      <h2 className="text-lg font-bold text-white mb-2">{title}</h2>

      {section.content && (
        <p className="text-gray-300 text-sm leading-relaxed">{section.content}</p>
      )}

      {/* Ordered steps (precombat) */}
      {section.steps && section.steps.length > 0 && (
        <ol className="mt-3 space-y-1 list-decimal list-inside">
          {section.steps.map((step, i) => (
            <li key={i} className="text-sm text-gray-300 pl-1">{step}</li>
          ))}
        </ol>
      )}

      {/* Priority list */}
      {section.priority && section.priority.length > 0 && (
        <PriorityList
          items={section.priority}
          compact={section.id === 'summary'}
        />
      )}
    </section>
  );
}
