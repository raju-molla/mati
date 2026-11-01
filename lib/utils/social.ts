import type { SocialLinks } from "@/types";

const LABELS: Record<keyof Omit<SocialLinks, "instagramHandle">, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  vimeo: "Vimeo",
  linkedin: "LinkedIn",
  github: "GitHub",
};

/** Ordered list of configured social links (empty ones are skipped). */
export function socialList(social: SocialLinks): { key: string; label: string; href: string }[] {
  return (Object.keys(LABELS) as (keyof typeof LABELS)[])
    .filter((k) => social[k])
    .map((k) => ({ key: k, label: LABELS[k], href: social[k] }));
}
