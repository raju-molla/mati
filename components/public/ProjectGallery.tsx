"use client";

import { useState } from "react";
import type { MediaItem } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils/cn";
import { Lightbox } from "./Lightbox";

/**
 * Gallery with two layouts: an editorial grid (first image wide) or a
 * masonry column layout for photography-style sets.
 */
export function ProjectGallery({ images, layout = "grid" }: { images: MediaItem[]; layout?: "grid" | "masonry" }) {
  const [active, setActive] = useState<number | null>(null);
  const items = images.filter((m) => m?.kind === "image");
  if (!items.length) return null;

  return (
    <>
      {layout === "masonry" ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {items.map((m, i) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setActive(i)}
              className="group block w-full break-inside-avoid overflow-hidden rounded-[var(--radius-card)]"
              aria-label={`Open image ${i + 1}${m.alt ? `: ${m.alt}` : ""}`}
            >
              <SmartImage
                media={m}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((m, i) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "group relative block overflow-hidden rounded-[var(--radius-card)] bg-ink-2",
                i % 3 === 0 ? "aspect-[16/9] md:col-span-2" : "aspect-[4/3]"
              )}
              aria-label={`Open image ${i + 1}${m.alt ? `: ${m.alt}` : ""}`}
            >
              <SmartImage
                media={m}
                fill
                sizes={i % 3 === 0 ? "100vw" : "(min-width:768px) 50vw, 100vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>
      )}
      <Lightbox items={items} index={active} onChange={setActive} onClose={() => setActive(null)} />
    </>
  );
}
