"use client";
import { useEffect, useState } from "react";

// Shown only under 1024px via CSS (see .vg in globals.css). The editor lays a
// full A4 page beside its controls, which needs a laptop or landscape tablet.
// This component only fills in the live pixel width — the gate itself is CSS,
// so there's no desktop flash and nothing to hydrate-match.
export default function ViewportGuard() {
  const [w, setW] = useState<number | null>(null);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  return (
    <div className="vg" role="alertdialog" aria-modal="true" aria-labelledby="vg-title">
      <div className="vg-card">
        <div className="vg-stage" aria-hidden="true">
          <span className="vg-cal vg-cal-l" />
          <span className="vg-cal vg-cal-r" />
          <div className="vg-paper">
            <div className="vg-name" />
            <div className="vg-head" />
            <div className="vg-cols">
              <div className="vg-col">
                <i /><i /><i /><i />
              </div>
              <div className="vg-col vg-col--side">
                <i /><i /><i />
              </div>
            </div>
          </div>
        </div>

        <p className="vg-eyebrow">Screen too narrow</p>
        <h1 className="vg-title" id="vg-title">Give your résumé room to breathe</h1>
        <p className="vg-body">
          The editor lays a full A4 page beside its controls — that needs a laptop
          or a landscape tablet. Reopen it on a wider screen and you’ll land right
          where you left off; your resume is saved in this browser.
        </p>

        <div className="vg-chip">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 7l-4 5 4 5" />
            <path d="M16 7l4 5-4 5" />
            <path d="M4 12h16" />
          </svg>
          <span>
            Now <b>{w ? `${w}px` : "—"}</b> · needs <b>1024px+</b>
          </span>
        </div>
      </div>
    </div>
  );
}
