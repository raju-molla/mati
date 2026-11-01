/**
 * Plain-text sanitising. All user-editable content on this site is stored and
 * rendered as text (React escapes it), so we strip any markup and control
 * characters on the way in as an extra layer of defence against XSS.
 */
export function cleanText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

/** Accept only http(s) URLs or site-relative paths. Returns "" for anything else (javascript:, data:, …). */
export function safeUrl(input: string): string {
  const v = input.trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#")) return v;
  if (v.startsWith("mailto:")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
