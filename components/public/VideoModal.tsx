"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Accessible full-screen player for a YouTube/Vimeo embed URL or an MP4. */
export function VideoModal({
  open,
  onClose,
  embedUrl,
  mp4Url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  embedUrl?: string;
  mp4Url?: string;
  title: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,1280px)] bg-transparent p-0 backdrop:bg-black/90"
      aria-label={title}
    >
      {open && (
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-12 right-0 inline-flex items-center gap-2 text-sm text-paper"
            aria-label="Close video"
          >
            Close <X className="size-5" aria-hidden="true" />
          </button>
          <div className="aspect-video w-full overflow-hidden bg-black">
            {embedUrl ? (
              <iframe
                src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                title={title}
                className="size-full"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            ) : mp4Url ? (
              <video src={mp4Url} controls autoPlay playsInline className="size-full" />
            ) : null}
          </div>
        </div>
      )}
    </dialog>
  );
}
