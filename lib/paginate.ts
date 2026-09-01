export type Block = { id: string; top: number; height: number };

// Push any block that would straddle a page boundary down to the top of the
// next page (plus `pad` for a top margin) so nothing is sliced mid-section.
// Blocks taller than a page are left alone — they have to split somewhere.
// ponytail: section granularity only; a single over-tall section still breaks
// internally. Add entry-level break points if that ever bites.
export function paginate(blocks: Block[], pageH: number, pad = 40) {
  const breaks: Record<string, number> = {};
  let shift = 0;
  let maxBottom = 0;
  for (const b of blocks) {
    let top = b.top + shift;
    if (b.height <= pageH) {
      const start = Math.floor(top / pageH);
      const end = Math.floor((top + b.height - 1) / pageH);
      if (end > start) {
        const push = (start + 1) * pageH - top + pad;
        shift += push;
        breaks[b.id] = push;
        top += push;
      }
    }
    maxBottom = Math.max(maxBottom, top + b.height);
  }
  return { breaks, maxBottom };
}

// self-check: `PAGINATE_SELFCHECK=1 npx tsx lib/paginate.ts`
if (process.env.PAGINATE_SELFCHECK) {
  const { breaks, maxBottom } = paginate(
    [
      { id: "a", top: 0, height: 900 },
      { id: "b", top: 900, height: 400 }, // straddles 1000 → pushed to 1040
      { id: "c", top: 1300, height: 200 },
    ],
    1000,
    40,
  );
  console.assert(breaks.a === undefined, "a fits on page 1");
  console.assert(breaks.b === 140, `b pushed to next page, got ${breaks.b}`);
  console.assert(breaks.c === undefined, "c flows after pushed b, no margin of its own");
  console.assert(maxBottom === 1640, `maxBottom ${maxBottom}`);
  console.log("paginate self-check ok");
}
