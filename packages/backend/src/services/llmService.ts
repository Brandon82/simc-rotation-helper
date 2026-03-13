import Anthropic from '@anthropic-ai/sdk';
import type { GuideContent } from '@simc-helper/shared';
import { config } from '../config.js';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/guidePrompt.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

/**
 * Calls Claude to generate a structured rotation guide from raw APL content.
 * Returns parsed GuideContent JSON.
 */
export async function generateGuide(
  specLabel: string,
  className: string,
  aplContent: string
): Promise<GuideContent> {
  const tag = `[llm] ${className} ${specLabel}`;
  const userPrompt = buildUserPrompt(specLabel, className, aplContent);

  console.log(`${tag} → sending request`);
  console.log(`${tag}   model        : ${config.anthropicModel}`);
  console.log(`${tag}   max_tokens   : 16000`);
  console.log(`${tag}   APL length   : ${aplContent.length} chars`);
  console.log(`${tag}   prompt length: ${userPrompt.length} chars`);

  const started = Date.now();

  const response = await client.messages.create({
    model: config.anthropicModel,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  console.log(`${tag} ← response received (${elapsed}s)`);
  console.log(`${tag}   stop_reason  : ${response.stop_reason}`);
  console.log(`${tag}   input tokens : ${response.usage.input_tokens}`);
  console.log(`${tag}   output tokens: ${response.usage.output_tokens}`);

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('LLM returned no text content');
  }

  let jsonText = textBlock.text.trim();
  console.log(`${tag}   raw output   : ${jsonText.length} chars`);

  // Strip any accidental markdown fences
  if (jsonText.startsWith('```')) {
    console.log(`${tag}   stripping markdown fences from output`);
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: GuideContent;
  try {
    parsed = JSON.parse(jsonText) as GuideContent;
  } catch (err) {
    console.error(`${tag} ✗ JSON parse failed`);
    console.error(`${tag}   raw (first 500 chars): ${jsonText.slice(0, 500)}`);
    throw new Error(`LLM returned invalid JSON: ${(err as Error).message}`);
  }

  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('LLM response missing "sections" array');
  }

  console.log(`${tag} ✓ parsed ${parsed.sections.length} sections: ${parsed.sections.map(s => s.id).join(', ')}`);

  return parsed;
}
