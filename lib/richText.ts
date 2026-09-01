export type Run = { text: string; bold?: boolean; italic?: boolean; href?: string };
export type RichBlock = { type: "p"; runs: Run[] } | { type: "ul"; items: Run[][] };

// Inline markdown: [label](url), **bold**, *italic*. Links win over emphasis;
// nesting (e.g. bold+italic) isn't supported — one style per run.
// ponytail: no `_italic_` on purpose — it false-fires on file_names and URLs.
const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function parseInline(text: string): Run[] {
  const runs: Run[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) runs.push({ text: text.slice(last, at) });
    if (m[1] !== undefined) runs.push({ text: m[1], href: m[2] });
    else if (m[3] !== undefined) runs.push({ text: m[3], bold: true });
    else if (m[4] !== undefined) runs.push({ text: m[4], italic: true });
    last = at + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs.length ? runs : [{ text }];
}

// Block markdown: consecutive -, *, or • lines become one bullet list; every
// other non-blank line is a paragraph. Each line's text is parsed for inline runs.
export function parseRich(content: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  let bullets: Run[][] = [];
  const flush = () => {
    if (bullets.length) blocks.push({ type: "ul", items: bullets });
    bullets = [];
  };
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    const m = line.match(/^[-*•]\s+(.*)$/);
    if (m) {
      bullets.push(parseInline(m[1]));
      continue;
    }
    flush();
    if (line) blocks.push({ type: "p", runs: parseInline(line) });
  }
  flush();
  return blocks;
}

// self-check: `RICHTEXT_SELFCHECK=1 npx tsx lib/richText.ts`
if (process.env.RICHTEXT_SELFCHECK) {
  const b = parseRich("See **bold** and *nice* and [me](example.com)\n\n- a\n- b");
  console.assert(b.length === 2, `2 blocks, got ${b.length}`);
  console.assert(b[0].type === "p" && b[0].runs.length === 6, `6 runs, got ${b[0].type === "p" && b[0].runs.length}`);
  const runs = b[0].type === "p" ? b[0].runs : [];
  console.assert(runs[1].bold && runs[1].text === "bold", "bold run");
  console.assert(runs[3].italic && runs[3].text === "nice", "italic run");
  console.assert(runs[5].href === "example.com" && runs[5].text === "me", "link run");
  console.assert(b[1].type === "ul" && b[1].items.length === 2, "2 bullets");
  console.log("richText self-check ok");
}
