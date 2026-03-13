/**
 * Renders a string with inline markdown: **bold**, *italic*, `code`.
 * No external deps — just a small regex-split renderer.
 */
export function InlineMarkdown({ text, className }: { text: string; className?: string }) {
  const parts = tokenize(text);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === 'bold')   return <strong key={i} className="font-semibold text-white">{part.value}</strong>;
        if (part.type === 'italic') return <em key={i} className="italic text-gray-200">{part.value}</em>;
        if (part.type === 'code')   return <code key={i} className="font-mono text-xs bg-gray-700 text-yellow-200 px-1 py-0.5 rounded">{part.value}</code>;
        return <span key={i}>{part.value}</span>;
      })}
    </span>
  );
}

type Token = { type: 'text' | 'bold' | 'italic' | 'code'; value: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  // Order matters: code first (to avoid ** inside `` being parsed as bold), then bold, then italic
  const pattern = /(`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > last) tokens.push({ type: 'text', value: input.slice(last, match.index) });

    if (match[2] !== undefined)      tokens.push({ type: 'code',   value: match[2] });
    else if (match[3] !== undefined) tokens.push({ type: 'bold',   value: match[3] });
    else if (match[4] !== undefined) tokens.push({ type: 'italic', value: match[4] });

    last = match.index + match[0].length;
  }

  if (last < input.length) tokens.push({ type: 'text', value: input.slice(last) });
  return tokens;
}
