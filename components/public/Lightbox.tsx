"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaItem } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";

/** Keyboard-accessible image lightbox built on <dialog>. */
export function Lightbox({
  items,
  index,
  onChange,
  onClose,
}: {
  items: MediaItem[];
  index: number | null;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const item = index !== null ? (items[index] ?? null) : null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink/97 p-0 text-paper backdrop:bg-black/80"
      aria-label="Image viewer"
    >
      {item && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="label">
              {String((index ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm" aria-label="Close viewer">
              Close <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex-1">
            <SmartImage media={item} fill sizes="100vw" className="object-contain" />
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-3 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 backdrop-blur"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-3 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 backdrop-blur"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
          <p className="min-h-14 px-5 py-4 text-center text-sm text-paper-dim">{item.caption || item.alt}</p>
        </div>
      )}
    </dialog>
  );
}
