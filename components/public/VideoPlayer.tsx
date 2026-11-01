"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { MediaItem } from "@/types";
import { parseVideoEmbed } from "@/lib/utils/media";

/**
 * Click-to-load player: shows a poster first and only loads the third-party
 * iframe (or the MP4) when the visitor presses play — keeps pages fast.
 */
export function VideoPlayer({
  embedUrl,
  media,
  title,
  poster,
}: {
  embedUrl?: string;
  media?: MediaItem | null;
  title: string;
  poster?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embed = parseVideoEmbed(embedUrl);
  if (!embed && !media?.url) return null;
  const posterUrl = poster || media?.posterUrl || embed?.thumbnail || "";

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-ink-2">
        {playing ? (
          embed ? (
            <iframe
              src={`${embed.embedUrl}&autoplay=1`}
              title={title}
              className="absolute inset-0 size-full"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video src={media!.url} poster={posterUrl || undefined} controls autoPlay playsInline className="absolute inset-0 size-full" />
          )
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 size-full" aria-label={`Play video: ${title}`}>
            {posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
            ) : (
              <span className="grain absolute inset-0 bg-gradient-to-br from-ink-3 to-ink" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:scale-110">
                <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
              </span>
            </span>
          </button>
        )}
      </div>
      {media?.caption && <figcaption className="label mt-3">{media.caption}</figcaption>}
    </figure>
  );
}
