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
const FIT_INSET = 28; // breathing room so the sheet never touches the pane edge
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;

export default function PaperPreview({
  data,
  theme,
}: {
  data: ResumeData;
  theme: ResumeTheme;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [breaks, setBreaks] = useState<Record<string, number>>({});
  // "fit" auto-scales to the pane width; a number is a user-chosen zoom.
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [fitScale, setFitScale] = useState(0.82);

  // Section-aware pagination (independent of zoom — measured at natural size).
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

  // Fit-to-width: track the available pane width and derive a scale that keeps
  // the whole A4 sheet visible (never upscaled past 100% automatically).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const avail = el.clientWidth - FIT_INSET;
      setFitScale(Math.min(1, Math.max(MIN_ZOOM, avail / A4_W)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = zoom === "fit" ? fitScale : zoom;
  const pct = Math.round(scale * 100);
  const stepTo = (v: number) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(v * 100) / 100)));

  return (
    <div ref={wrapRef} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Off-screen measurer: natural (un-broken) layout at 1×. height:0 so it
          doesn't inflate the page's scroll region. */}
      <div style={{ position: "absolute", left: -99999, top: 0, width: A4_W, height: 0, overflow: "hidden", visibility: "hidden", pointerEvents: "none" }}>
        <div ref={measureRef}>
          <MyResume data={data} theme={theme} />
        </div>
      </div>

      {Array.from({ length: pages }).map((_, i) => (
        <div key={i} style={{ marginBottom: 30 }}>
          {/* Sizer reclaims the scaled footprint so the pane never overflows;
              the sheet inside scales from the top-left corner to fill it. */}
          <div style={{ width: A4_W * scale, height: A4_H * scale }}>
            <div
              style={{
                width: A4_W,
                height: A4_H,
                overflow: "hidden",
                background: "#fff",
                borderRadius: 3,
                boxShadow: "0 10px 40px rgba(16,24,40,0.16), 0 1px 3px rgba(16,24,40,0.10)",
                position: "relative",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <div style={{ transform: `translateY(${-i * A4_H}px)` }}>
                <MyResume data={data} theme={theme} breaks={breaks} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 500, letterSpacing: 0.3, color: "#9aa1ad" }}>
            Page {i + 1} of {pages}
          </div>
        </div>
      ))}

      {/* Zoom control — sticks to the bottom of the preview pane. */}
      <div
        style={{
          position: "sticky",
          bottom: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid #e7e7ea",
          boxShadow: "0 6px 20px rgba(16,24,40,0.14)",
        }}
      >
        <ZoomBtn label="Zoom out" onClick={() => stepTo(scale - 0.1)} disabled={scale <= MIN_ZOOM + 0.001}>
          <path d="M5 12h14" />
        </ZoomBtn>
        <button
          onClick={() => setZoom("fit")}
          title="Fit to width"
          style={{ minWidth: 46, height: 30, border: "none", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#17181c", fontVariantNumeric: "tabular-nums" }}
        >
          {pct}%
        </button>
        <ZoomBtn label="Zoom in" onClick={() => stepTo(scale + 0.1)} disabled={scale >= MAX_ZOOM - 0.001}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </ZoomBtn>
        <span style={{ width: 1, height: 18, background: "#e7e7ea", margin: "0 3px" }} />
        <button
          onClick={() => setZoom("fit")}
          title="Fit to width"
          style={{
            height: 30,
            padding: "0 11px",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: zoom === "fit" ? "#2563eb" : "#6b7280",
            background: zoom === "fit" ? "#eef4ff" : "transparent",
          }}
        >
          Fit
        </button>
      </div>
    </div>
  );
}

function ZoomBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        width: 30,
        height: 30,
        display: "grid",
        placeItems: "center",
        border: "none",
        borderRadius: "50%",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? "#c3c4cb" : "#17181c",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
