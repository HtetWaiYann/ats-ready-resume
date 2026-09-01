"use client";
import { useEffect, useRef, useState } from "react";
import MyResume from "@/components/templates/MyResume";
import { paginate, type Block } from "@/lib/paginate";
import type { ResumeData } from "@/types/resume";
import type { ResumeTheme } from "@/types/theme";

// A4 at 96dpi. MyResume renders at 210mm width (≈793.7px). We measure the
// natural layout, then push each section that would straddle a page boundary
// onto the next sheet so nothing is cut mid-line.
const A4_W = 794;
const A4_H = 1123;
const PAGE_PAD = 40; // top margin a pushed section keeps on its new page

export default function PaperPreview({
  data,
  theme,
  scale = 0.82,
}: {
  data: ResumeData;
  theme: ResumeTheme;
  scale?: number;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [breaks, setBreaks] = useState<Record<string, number>>({});

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const compute = () => {
      const top = el.getBoundingClientRect().top;
      const cols: Record<string, Block[]> = { main: [], sidebar: [] };
      el.querySelectorAll<HTMLElement>("[data-block-id]").forEach((b) => {
        const rect = b.getBoundingClientRect();
        (cols[b.dataset.col ?? "main"] ??= []).push({ id: b.dataset.blockId!, top: rect.top - top, height: rect.height });
      });
      // Each column flows independently; break points align to the same A4 grid.
      const merged: Record<string, number> = {};
      let bottom = 0;
      for (const list of Object.values(cols)) {
        const { breaks: b, maxBottom } = paginate(list, A4_H, PAGE_PAD);
        Object.assign(merged, b);
        bottom = Math.max(bottom, maxBottom);
      }
      setBreaks(merged);
      setPages(Math.max(1, Math.ceil(Math.max(bottom, el.scrollHeight) / A4_H)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, theme]);

  return (
    <>
      {/* Off-screen measurer: natural (un-broken) layout at 1× — must live
          OUTSIDE the scale transform below or getBoundingClientRect returns
          scaled coords and the A4_H math is off. */}
      <div style={{ position: "absolute", left: -99999, top: 0, width: A4_W, height: 0, overflow: "hidden", visibility: "hidden", pointerEvents: "none" }}>
        <div ref={measureRef}>
          <MyResume data={data} theme={theme} />
        </div>
      </div>

      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {Array.from({ length: pages }).map((_, i) => (
        <div key={i} style={{ marginBottom: 30 }}>
          <div
            style={{
              width: A4_W,
              height: A4_H,
              overflow: "hidden",
              background: "#fff",
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(16,24,40,0.16), 0 1px 3px rgba(16,24,40,0.10)",
              position: "relative",
            }}
          >
            <div style={{ transform: `translateY(${-i * A4_H}px)` }}>
              <MyResume data={data} theme={theme} breaks={breaks} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 500, letterSpacing: 0.3, color: "#9aa1ad" }}>
            Page {i + 1} of {pages}
          </div>
        </div>
      ))}
      </div>
    </>
  );
}
