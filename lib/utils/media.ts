/**
 * Client-safe helpers for Cloudinary URLs and video embeds.
 */

/** Insert a Cloudinary transformation into a delivery URL. Non-Cloudinary URLs pass through. */
export function cldTransform(url: string, transformation: string): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transformation}/`);
}

/** next/image loader for Cloudinary — lets Cloudinary resize and pick AVIF/WebP. */
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return cldTransform(src, `f_auto,q_${quality ?? "auto"},c_limit,w_${width}`);
}

export function isCloudinary(url: string | undefined | null): boolean {
  return !!url && url.includes("res.cloudinary.com");
}

/** Poster frame for a Cloudinary video. */
export function videoPoster(url: string): string {
  if (!isCloudinary(url)) return "";
  return cldTransform(url, "so_1,f_jpg,q_auto,w_1600").replace(/\.(mp4|mov|webm)$/i, ".jpg");
}

export interface EmbedInfo {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  thumbnail: string;
}

/** Parse a YouTube/Vimeo URL into a safe embed URL. Anything else returns null. */
export function parseVideoEmbed(raw: string | undefined | null): EmbedInfo | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let yt: string | null = null;
  if (host === "youtu.be") yt = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") yt = u.searchParams.get("v");
    else if (/^\/(embed|shorts|live)\//.test(u.pathname)) yt = u.pathname.split("/")[2] ?? null;
  }
  if (yt && /^[A-Za-z0-9_-]{6,20}$/.test(yt)) {
    return {
      provider: "youtube",
      id: yt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`,
      thumbnail: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean).find((p) => /^\d+$/.test(p));
    if (id) {
      const h = u.searchParams.get("h");
      return {
        provider: "vimeo",
        id,
        embedUrl: `https://player.vimeo.com/video/${id}?dnt=1${h ? `&h=${encodeURIComponent(h)}` : ""}`,
        thumbnail: "",
      };
    }
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

/** Split a text block into paragraphs on blank lines. */
export function paragraphs(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
