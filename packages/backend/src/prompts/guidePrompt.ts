export const SYSTEM_PROMPT = `You are an expert World of Warcraft theorycrafter and SimulationCraft specialist.
Your task is to convert a raw SimulationCraft Action Priority List (APL) into a clear, human-readable rotation guide for players.

You MUST return ONLY valid JSON matching the exact schema provided. Do not include any prose, explanation, or markdown fences outside the JSON.

Key rules:
- Convert all SimC identifiers (snake_case) to proper WoW in-game ability names (Title Case). Example: "mortal_strike" → "Mortal Strike", "colossus_smash" → "Colossus Smash"
- Translate APL conditions into plain English. Examples:
  - "buff.avatar.up" → "while Avatar is active"
  - "debuff.colossus_smash.remains>gcd" → "while Colossus Smash debuff has more than 1 GCD remaining"
  - "cooldown.mortal_strike.ready" → "when Mortal Strike is off cooldown"
  - "spell_targets.whirlwind>=3" → "when hitting 3 or more targets"
  - "rage>=52" → "when you have 52 or more Rage"
  - "talent.x.enabled" → "if you have the X talent"
- Merge run_action_list / call_action_list jumps — describe the resulting priority, not the jump mechanic
- For the priority lists, follow the MAIN execution sequence of the APL exactly. The main sequence is the section marked "# Executed every time the actor is available." (i.e. the top-level "actions+=" lines, which call into sub-lists). Inline the contents of each called sub-list in-place, preserving their relative order within the overall sequence.
- For the single_target priority: follow the main sequence but skip any entries that belong exclusively to AoE sub-lists (e.g. run_action_list/call_action_list targeting an aoe-named list when the condition is a multi-target check). Keep everything else — cooldowns, utility, execute phases, etc.
- For the aoe priority: follow the main sequence but skip any entries that belong exclusively to single-target sub-lists. Keep everything else — shared cooldowns, utility, etc.
- Use the ACTUAL priority order from the APL (higher priority = lower order number)
- Omit variable-setting lines from priority lists; only include actual ability casts
- The "condition" field should be an empty string for unconditional casts
- Keep ability conditions concise but accurate (1 sentence max)
- If a section has no relevant abilities (e.g., the spec has no AoE-specific actions), still include the section with content explaining that the rotation is similar to single target
- For the items_and_racials section: parse actions.items and actions.ogcd (or similarly named sections). Write a single consolidated prose paragraph — not a list. Translate trinket slot references (slot=trinket1/trinket2) into plain English ("your on-use trinkets"). Translate racial ability names (berserking, blood_fury, fireblood, ancestral_call, etc.) to their proper in-game names. Summarize the sync logic in natural language — e.g. "use with your major cooldown", "use on cooldown if the fight ends soon", etc. Consolidate similar conditions. If no items/racials are present, set content to an empty string`;

export function buildUserPrompt(specLabel: string, className: string, aplContent: string): string {
  return `## Spec
${specLabel} ${className}

## SimulationCraft APL
The following is the complete Action Priority List for this spec. Each line follows the format:
  actions[.section]+=ability_name[,parameter=value]...

Key syntax:
- Lines starting with # are comments
- "actions.precombat+=" = pre-combat setup actions
- "actions+=" = the MAIN execution sequence (top-level, run every GCD). This is the spine of both priority lists.
- "actions.X+=" = named sub-list X (e.g. st, aoe, execute, cooldowns, trinkets)
- "if=" = condition gate (ability only used when true)
- "variable,name=X,value=Y" = sets a local variable (skip these in priority lists)
- "run_action_list,name=X" / "call_action_list,name=X" = jump to sub-list X; inline those sub-list entries at that position
- Conditions use dot-notation: buff.X.up, debuff.X.remains, cooldown.X.ready, etc.

---APL START---
${aplContent}
---APL END---

## Required Output Schema
Return ONLY this JSON (no markdown fences, no extra text):
{
  "sections": [
    {
      "id": "overview",
      "title": "Overview",
      "content": "2-3 sentences describing the spec's playstyle, damage profile, and core mechanic"
    },
    {
      "id": "talent_notes",
      "title": "Talent Notes",
      "content": "Key talents referenced in the APL and how they change the rotation. If the APL has multiple talent builds (e.g. colossus vs slayer), explain both."
    },
    {
      "id": "precombat",
      "title": "Pre-Combat Setup",
      "content": "Brief description of pre-combat preparation",
      "steps": ["Step 1 in plain English", "Step 2", "..."]
    },
    {
      "id": "single_target",
      "title": "Single Target Priority",
      "content": "Brief description of the core single target loop",
      "priority": [
        { "order": 1, "ability": "Ability Name", "condition": "condition or empty string", "note": "Follow the main APL sequence; omit AoE-only branches" }
      ]
    },
    {
      "id": "aoe",
      "title": "AoE Priority",
      "content": "When to switch to AoE (target count threshold) and what changes",
      "priority": [
        { "order": 1, "ability": "Ability Name", "condition": "condition or empty string", "note": "Follow the main APL sequence; omit single-target-only branches" }
      ]
    },
    {
      "id": "items_and_racials",
      "title": "Trinkets, Racials & On-Use Items",
      "content": "A single prose paragraph describing when and how to use on-use trinkets, racial abilities, and other active items"
    }
  ]
}`;
}
