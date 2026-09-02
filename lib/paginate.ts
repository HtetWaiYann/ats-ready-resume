export type Block = { id: string; top: number; height: number };

// Push any block that would cross into a page's bottom margin down to the top
// of the next page, keeping `pad` of margin at both the bottom of the page it
// leaves and the top of the page it lands on. Blocks taller than the usable
// band (page minus both margins) are left alone — they have to split somewhere.
//
// Callers decide granularity: pass whole-section blocks for a section short
// enough to fit a page (it moves as a unit), or per-entry blocks for a long
// section so it breaks between entries instead of stranding a half-empty page.
export function paginate(blocks: Block[], pageH: number, pad = 48) {
  const breaks: Record<string, number> = {};
  const usable = pageH - 2 * pad;
  let shift = 0;
  let maxBottom = 0;
  for (const b of blocks) {
    let top = b.top + shift;
    if (b.height <= usable) {
      const pageStart = Math.floor(top / pageH) * pageH;
      const bottomLimit = pageStart + pageH - pad;
      if (top + b.height > bottomLimit) {
        const push = pageStart + pageH + pad - top;
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
      { id: "a", top: 0, height: 800 },
      { id: "b", top: 800, height: 300 }, // crosses 950 bottom-limit → next page
      { id: "c", top: 1100, height: 100 },
    ],
    1000,
    50,
  );
  console.assert(breaks.a === undefined, "a fits on page 1");
  console.assert(breaks.b === 250, `b pushed to page 2 top+pad, got ${breaks.b}`);
  console.assert(breaks.c === undefined, "c flows after pushed b");
  console.assert(maxBottom === 1450, `maxBottom ${maxBottom}`);
  console.log("paginate self-check ok");
}
