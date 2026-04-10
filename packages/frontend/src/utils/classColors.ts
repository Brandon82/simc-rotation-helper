// WoW class colors -- bright versions for dark mode
export const CLASS_COLORS_DARK: Record<string, string> = {
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

// Darkened for WCAG-AA contrast on a white/light background
export const CLASS_COLORS_LIGHT: Record<string, string> = {
  death_knight: '#B01A33',
  demon_hunter: '#8A22AA',
  druid:        '#C06000',
  evoker:       '#1F7A66',
  hunter:       '#5C8A2E',
  mage:         '#0A8FA8',
  monk:         '#007A49',
  paladin:      '#C4527A',
  priest:       '#4B5563',
  rogue:        '#8A7A00',
  shaman:       '#0055BB',
  warlock:      '#5556CC',
  warrior:      '#8A6B20',
};

// Tailwind class maps for class-themed UI elements
export const CLASS_BORDER: Record<string, string> = {
  death_knight: 'border-red-600 dark:border-red-600',
  demon_hunter: 'border-purple-500 dark:border-purple-500',
  druid: 'border-orange-500 dark:border-orange-400',
  evoker: 'border-teal-500 dark:border-teal-400',
  hunter: 'border-lime-500 dark:border-lime-400',
  mage: 'border-sky-500 dark:border-sky-400',
  monk: 'border-emerald-500 dark:border-emerald-400',
  paladin: 'border-pink-400 dark:border-pink-300',
  priest: 'border-gray-400 dark:border-gray-200',
  rogue: 'border-yellow-400 dark:border-yellow-300',
  shaman: 'border-blue-500 dark:border-blue-400',
  warlock: 'border-violet-500 dark:border-violet-400',
  warrior: 'border-yellow-600 dark:border-yellow-600',
};

export const CLASS_TEXT: Record<string, string> = {
  death_knight: 'text-red-600 dark:text-red-400',
  demon_hunter: 'text-purple-600 dark:text-purple-400',
  druid: 'text-orange-500 dark:text-orange-400',
  evoker: 'text-teal-600 dark:text-teal-400',
  hunter: 'text-lime-600 dark:text-lime-400',
  mage: 'text-sky-600 dark:text-sky-400',
  monk: 'text-emerald-600 dark:text-emerald-400',
  paladin: 'text-pink-500 dark:text-pink-300',
  priest: 'text-gray-500 dark:text-gray-200',
  rogue: 'text-yellow-500 dark:text-yellow-300',
  shaman: 'text-blue-600 dark:text-blue-400',
  warlock: 'text-violet-600 dark:text-violet-400',
  warrior: 'text-yellow-600 dark:text-yellow-500',
};

export const CLASS_ACTIVE_BG: Record<string, string> = {
  death_knight: 'bg-red-500/10 dark:bg-red-900/20',
  demon_hunter: 'bg-purple-500/10 dark:bg-purple-900/20',
  druid: 'bg-orange-500/10 dark:bg-orange-900/20',
  evoker: 'bg-teal-500/10 dark:bg-teal-900/20',
  hunter: 'bg-lime-500/10 dark:bg-lime-900/20',
  mage: 'bg-sky-500/10 dark:bg-sky-900/20',
  monk: 'bg-emerald-500/10 dark:bg-emerald-900/20',
  paladin: 'bg-pink-500/10 dark:bg-pink-900/20',
  priest: 'bg-gray-200/60 dark:bg-gray-700/20',
  rogue: 'bg-yellow-500/10 dark:bg-yellow-900/20',
  shaman: 'bg-blue-500/10 dark:bg-blue-900/20',
  warlock: 'bg-violet-500/10 dark:bg-violet-900/20',
  warrior: 'bg-yellow-500/10 dark:bg-yellow-900/20',
};
