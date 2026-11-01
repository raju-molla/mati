"use client";

import { useMemo, useState } from "react";
import type { MediaItem } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils/cn";
import { Lightbox } from "./Lightbox";

/** Masonry photo gallery with collection filter (e.g. "Wildlife") and lightbox. */
export function PhotographyGrid({ photos, showFilter = true }: { photos: MediaItem[]; showFilter?: boolean }) {
  const collections = useMemo(
    () => [...new Set(photos.map((p) => p.photoCollection).filter(Boolean))].sort(),
    [photos]
  );
  const [filter, setFilter] = useState<string>("");
  const [active, setActive] = useState<number | null>(null);
  const visible = filter ? photos.filter((p) => p.photoCollection === filter) : photos;

  return (
    <>
      {showFilter && collections.length > 1 && (
        <div role="group" aria-label="Filter photographs by collection" className="mb-10 flex flex-wrap gap-2">
          {["", ...collections].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                filter === c ? "border-paper bg-paper text-ink" : "border-line-strong text-paper-dim hover:border-paper"
              )}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      )}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((p, i) => (
          <button
            key={p._id}
            type="button"
            onClick={() => setActive(i)}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-[var(--radius-card)] bg-ink-2"
            aria-label={`Open photograph${p.alt ? `: ${p.alt}` : ""}`}
          >
            <SmartImage
              media={p}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="h-auto w-full transition-transform duration-[1200ms] ease-[var(--ease-cinema)] group-hover:scale-[1.03]"
            />
            {(p.caption || p.photoCollection) && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/80 to-transparent p-4 text-left opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-sm">{p.caption}</span>
                {p.photoCollection && <span className="label text-paper/80">{p.photoCollection}</span>}
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox items={visible} index={active} onChange={setActive} onClose={() => setActive(null)} />
    </>
  );
}
