import type { ClassInfo } from '@simc-helper/shared';

// Ground truth: all WoW specs mapped to their SimC APL filename (without .simc)
// Class colors sourced from Blizzard's official WoW class color palette
export const CLASSES: ClassInfo[] = [
  {
    name: 'death_knight',
    label: 'Death Knight',
    color: '#C41E3A',
    specs: [
      { name: 'death_knight_blood',  aplName: 'deathknight_blood',  label: 'Blood',  role: 'tank' },
      { name: 'death_knight_frost',  aplName: 'deathknight_frost',  label: 'Frost',  role: 'dps'  },
      { name: 'death_knight_unholy', aplName: 'deathknight_unholy', label: 'Unholy', role: 'dps'  },
    ],
  },
  {
    name: 'demon_hunter',
    label: 'Demon Hunter',
    color: '#A330C9',
    specs: [
      { name: 'demon_hunter_devourer',   aplName: 'demonhunter_devourer',   label: 'Devourer',   role: 'dps'  },
      { name: 'demon_hunter_havoc',      aplName: 'demonhunter_havoc',      label: 'Havoc',      role: 'dps'  },
      { name: 'demon_hunter_vengeance',  aplName: 'demonhunter_vengeance',  label: 'Vengeance',  role: 'tank' },
    ],
  },
  {
    name: 'druid',
    label: 'Druid',
    color: '#FF7C0A',
    specs: [
      { name: 'druid_balance',     label: 'Balance',     role: 'dps'    },
      { name: 'druid_feral',       label: 'Feral',       role: 'dps'    },
      { name: 'druid_guardian',    label: 'Guardian',    role: 'tank'   },
      { name: 'druid_restoration', label: 'Restoration', role: 'healer' },
    ],
  },
  {
    name: 'evoker',
    label: 'Evoker',
    color: '#33937F',
    specs: [
      { name: 'evoker_augmentation', label: 'Augmentation', role: 'dps'    },
      { name: 'evoker_devastation',  label: 'Devastation',  role: 'dps'    },
      { name: 'evoker_preservation', label: 'Preservation', role: 'healer' },
    ],
  },
  {
    name: 'hunter',
    label: 'Hunter',
    color: '#AAD372',
    specs: [
      { name: 'hunter_beast_mastery',  label: 'Beast Mastery',  role: 'dps' },
      { name: 'hunter_marksmanship',   label: 'Marksmanship',   role: 'dps' },
      { name: 'hunter_survival',       label: 'Survival',       role: 'dps' },
    ],
  },
  {
    name: 'mage',
    label: 'Mage',
    color: '#3FC7EB',
    specs: [
      { name: 'mage_arcane', label: 'Arcane', role: 'dps' },
      { name: 'mage_fire',   label: 'Fire',   role: 'dps' },
      { name: 'mage_frost',  label: 'Frost',  role: 'dps' },
    ],
  },
  {
    name: 'monk',
    label: 'Monk',
    color: '#00FF98',
    specs: [
      { name: 'monk_brewmaster',  label: 'Brewmaster',  role: 'tank'   },
      { name: 'monk_mistweaver',  label: 'Mistweaver',  role: 'healer' },
      { name: 'monk_windwalker',  label: 'Windwalker',  role: 'dps'    },
    ],
  },
  {
    name: 'paladin',
    label: 'Paladin',
    color: '#F48CBA',
    specs: [
      { name: 'paladin_holy',        label: 'Holy',        role: 'healer' },
      { name: 'paladin_protection',  label: 'Protection',  role: 'tank'   },
      { name: 'paladin_retribution', label: 'Retribution', role: 'dps'    },
    ],
  },
  {
    name: 'priest',
    label: 'Priest',
    color: '#FFFFFF',
    specs: [
      { name: 'priest_discipline', label: 'Discipline', role: 'healer' },
      { name: 'priest_holy',       label: 'Holy',       role: 'healer' },
      { name: 'priest_shadow',     label: 'Shadow',     role: 'dps'    },
    ],
  },
  {
    name: 'rogue',
    label: 'Rogue',
    color: '#FFF468',
    specs: [
      { name: 'rogue_assassination', label: 'Assassination', role: 'dps' },
      { name: 'rogue_outlaw',        label: 'Outlaw',        role: 'dps' },
      { name: 'rogue_subtlety',      label: 'Subtlety',      role: 'dps' },
    ],
  },
  {
    name: 'shaman',
    label: 'Shaman',
    color: '#0070DD',
    specs: [
      { name: 'shaman_elemental',   label: 'Elemental',   role: 'dps'    },
      { name: 'shaman_enhancement', label: 'Enhancement', role: 'dps'    },
      { name: 'shaman_restoration', label: 'Restoration', role: 'healer' },
    ],
  },
  {
    name: 'warlock',
    label: 'Warlock',
    color: '#8788EE',
    specs: [
      { name: 'warlock_affliction',  label: 'Affliction',  role: 'dps' },
      { name: 'warlock_demonology',  label: 'Demonology',  role: 'dps' },
      { name: 'warlock_destruction', label: 'Destruction', role: 'dps' },
    ],
  },
  {
    name: 'warrior',
    label: 'Warrior',
    color: '#C69B3A',
    specs: [
      { name: 'warrior_arms',       label: 'Arms',       role: 'dps'  },
      { name: 'warrior_fury',       label: 'Fury',       role: 'dps'  },
      { name: 'warrior_protection', label: 'Protection', role: 'tank' },
    ],
  },
];

// Flat list of all spec names for iteration
export const ALL_SPECS = CLASSES.flatMap(c => c.specs);

// Quick lookup helpers
export function getSpecInfo(specName: string) {
  return ALL_SPECS.find(s => s.name === specName) ?? null;
}

export function getClassForSpec(specName: string) {
  return CLASSES.find(c => c.specs.some(s => s.name === specName)) ?? null;
}

export function getClassInfo(className: string) {
  return CLASSES.find(c => c.name === className) ?? null;
}
