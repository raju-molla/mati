"use client";

import { FileText, Film } from "lucide-react";
import type { MediaItem } from "@/types";
import { cldTransform } from "@/lib/utils/media";
import { cn } from "@/lib/utils/cn";

/** Small, cheap preview of any media item for the admin UI. */
export function MediaThumb({ media, className }: { media: MediaItem | null | undefined; className?: string }) {
  if (!media) return <div className={cn("bg-zinc-100", className)} />;
  if (media.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cldTransform(media.url, "f_auto,q_auto,c_fill,w_400,h_300")}
        alt={media.alt || ""}
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  }
  if (media.kind === "video") {
    return (
      <div className={cn("relative bg-zinc-900", className)}>
        {media.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.posterUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-70" />
        )}
        <Film className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-white" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 bg-zinc-100 p-2 text-zinc-500", className)}>
      <FileText className="size-6" aria-hidden="true" />
      <span className="line-clamp-1 max-w-full text-[10px]">{media.filename}</span>
    </div>
  );
}
