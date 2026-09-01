"use client";
import { useEffect } from "react";
import { googleCssHref } from "@/lib/theme";

/** Injects (and swaps) the Google Fonts stylesheet for the chosen resume font. */
export default function FontLoader({ family }: { family: string }) {
  useEffect(() => {
    const id = "resume-font";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = googleCssHref(family);
  }, [family]);
  return null;
}
