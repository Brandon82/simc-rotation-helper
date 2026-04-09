const WH_CDN = 'https://wow.zamimg.com/images/wow/icons';

export type IconSize = 'small' | 'medium' | 'large';

const CLASS_ICON_SLUG: Record<string, string> = {
  death_knight: 'classicon_deathknight',
  demon_hunter: 'classicon_demonhunter',
  druid:        'classicon_druid',
  evoker:       'classicon_evoker',
  hunter:       'classicon_hunter',
  mage:         'classicon_mage',
  monk:         'classicon_monk',
  paladin:      'classicon_paladin',
  priest:       'classicon_priest',
  rogue:        'classicon_rogue',
  shaman:       'classicon_shaman',
  warlock:      'classicon_warlock',
  warrior:      'classicon_warrior',
};

const SPEC_ICON_SLUG: Record<string, string> = {
  // Death Knight
  death_knight_blood:  'spell_deathknight_bloodpresence',
  death_knight_frost:  'spell_deathknight_frostpresence',
  death_knight_unholy: 'spell_deathknight_unholypresence',

  // Demon Hunter
  demon_hunter_havoc:      'ability_demonhunter_specdps',
  demon_hunter_vengeance:  'ability_demonhunter_spectank',
  demon_hunter_devourer:   'classicon_demonhunter_void_64',

  // Druid
  druid_balance:     'spell_nature_starfall',
  druid_feral:       'ability_druid_catform',
  druid_guardian:    'ability_racial_bearform',
  druid_restoration: 'spell_nature_healingtouch',

  // Evoker
  evoker_augmentation: 'classicon_evoker_augmentation',
  evoker_devastation:  'classicon_evoker_devastation',
  evoker_preservation: 'classicon_evoker_preservation',

  // Hunter
  hunter_beast_mastery: 'ability_hunter_bestialdiscipline',
  hunter_marksmanship:  'ability_hunter_focusedaim',
  hunter_survival:      'ability_hunter_camouflage',

  // Mage
  mage_arcane: 'spell_holy_magicalsentry',
  mage_fire:   'spell_fire_firebolt02',
  mage_frost:  'spell_frost_frostbolt02',

  // Monk
  monk_brewmaster: 'spell_monk_brewmaster_spec',
  monk_mistweaver: 'spell_monk_mistweaver_spec',
  monk_windwalker: 'spell_monk_windwalker_spec',

  // Paladin
  paladin_holy:        'spell_holy_holybolt',
  paladin_protection:  'ability_paladin_shieldofthetemplar',
  paladin_retribution: 'spell_holy_auraoflight',

  // Priest
  priest_discipline: 'spell_holy_powerwordshield',
  priest_holy:       'spell_holy_guardianspirit',
  priest_shadow:     'spell_shadow_shadowwordpain',

  // Rogue
  rogue_assassination: 'ability_rogue_eviscerate',
  rogue_outlaw:        'ability_rogue_waylay',
  rogue_subtlety:      'ability_stealth',

  // Shaman
  shaman_elemental:   'spell_nature_lightning',
  shaman_enhancement: 'spell_shaman_improvedstormstrike',
  shaman_restoration: 'spell_nature_magicimmunity',

  // Warlock
  warlock_affliction:  'spell_shadow_deathcoil',
  warlock_demonology:  'spell_shadow_metamorphosis',
  warlock_destruction: 'spell_shadow_rainoffire',

  // Warrior
  warrior_arms:       'ability_warrior_savageblow',
  warrior_fury:       'ability_warrior_innerrage',
  warrior_protection: 'ability_warrior_defensivestance',
};

export function classIconUrl(className: string, size: IconSize = 'large'): string {
  const slug = CLASS_ICON_SLUG[className] ?? `classicon_${className.replace(/_/g, '')}`;
  return `${WH_CDN}/${size}/${slug}.jpg`;
}

export function specIconUrl(specName: string, size: IconSize = 'large'): string {
  const slug = SPEC_ICON_SLUG[specName];
  if (!slug) {
    // Fall back to class icon
    const className = specName.split('_').slice(0, -1).join('_');
    return classIconUrl(className, size);
  }
  return `${WH_CDN}/${size}/${slug}.jpg`;
}
