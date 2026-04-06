import { InlineMarkdown } from '../guide/InlineMarkdown';

/**
 * Block-level markdown renderer for AI chat responses.
 * Supports: headers (##), bullet lists (- / *), numbered lists (1.),
 * fenced code blocks (```), and paragraphs with inline formatting.
 */
export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <p key={i} className="font-semibold text-gray-900 dark:text-white">
                <InlineMarkdown text={block.content} />
              </p>
            );

          case 'code':
            return (
              <pre
                key={i}
                className="bg-gray-200 dark:bg-gray-900 rounded px-2.5 py-2 font-mono text-[11px] leading-relaxed overflow-x-auto text-gray-800 dark:text-gray-200"
              >
                {block.content}
              </pre>
            );

          case 'ul':
            return (
              <ul key={i} className="list-disc list-inside space-y-0.5 pl-1">
                {block.items!.map((item, j) => (
                  <li key={j} className="text-gray-800 dark:text-gray-200">
                    <InlineMarkdown text={item} />
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={i} className="list-decimal list-inside space-y-0.5 pl-1">
                {block.items!.map((item, j) => (
                  <li key={j} className="text-gray-800 dark:text-gray-200">
                    <InlineMarkdown text={item} />
                  </li>
                ))}
              </ol>
            );

          default:
            return (
              <p key={i} className="text-gray-800 dark:text-gray-200">
                <InlineMarkdown text={block.content} />
              </p>
            );
        }
      })}
    </div>
  );
}

type Block =
  | { type: 'paragraph' | 'heading' | 'code'; content: string; items?: undefined }
  | { type: 'ul' | 'ol'; content: string; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++; // skip opening fence
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: 'code', content: codeLines.join('\n') });
      continue;
    }

    // Heading (## or ###)
    const headingMatch = line.match(/^#{1,4}\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: 'heading', content: headingMatch[1] });
      i++;
      continue;
    }

    // Unordered list (- or *)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', content: '', items });
      continue;
    }

    // Ordered list (1. 2. etc.)
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', content: '', items });
      continue;
    }

    // Regular paragraph — collect contiguous non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paraLines.join(' ') });
    }
  }

  return blocks;
}
