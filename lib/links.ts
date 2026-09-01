// Shared link normalization — used by web preview, PDF export, and plain text.

/** Prepend https:// if the stored value doesn't already start with http. */
export function httpsHref(url: string): string {
  const u = url.trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

/** Clean display text for a URL: drop scheme and trailing slash. */
export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export const mailto = (email: string) => `mailto:${email.trim()}`;
export const tel = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;
