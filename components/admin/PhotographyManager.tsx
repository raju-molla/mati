"use client";

import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Star, X } from "lucide-react";
import type { MediaItem } from "@/types";
import { api } from "./api";
import { useFeedback } from "./Feedback";
import { MediaPicker } from "./MediaPicker";
import { MediaThumb } from "./MediaThumb";
import { cn } from "@/lib/utils/cn";

/**
 * Curate the public Photography gallery: add images from the library, set
 * collections (e.g. "Wildlife"), mark favourites for the homepage, reorder.
 */
export function PhotographyManager({ initial }: { initial: MediaItem[] }) {
  const { toast } = useFeedback();
  const [photos, setPhotos] = useState<MediaItem[]>(initial);
  const [picker, setPicker] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const collections = [...new Set(photos.map((p) => p.photoCollection).filter(Boolean))];

  const patch = async (id: string, body: Partial<MediaItem>) => {
    await api(`/api/admin/media/${id}`, { method: "PATCH", body });
  };

  const persistOrder = async (list: MediaItem[]) => {
    try {
      await Promise.all(list.map((p, i) => (p.photoOrder !== i ? patch(p._id, { photoOrder: i }) : null)));
      setPhotos(list.map((p, i) => ({ ...p, photoOrder: i })));
      toast("Order saved");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    setPhotos(next);
    persistOrder(next);
  };

  const update = async (p: MediaItem, body: Partial<MediaItem>, msg?: string) => {
    setPhotos((all) => all.map((x) => (x._id === p._id ? { ...x, ...body } : x)));
    try {
      await patch(p._id, body);
      if (msg) toast(msg);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const add = async (items: MediaItem[]) => {
    const fresh = items.filter((m) => !photos.some((p) => p._id === m._id));
    try {
      await Promise.all(fresh.map((m, i) => patch(m._id, { inPhotography: true, photoOrder: photos.length + i })));
      setPhotos((all) => [...all, ...fresh.map((m, i) => ({ ...m, inPhotography: true, photoOrder: all.length + i }))]);
      toast(`${fresh.length} photo${fresh.length === 1 ? "" : "s"} added to the gallery`);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Photography</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Photos shown on the Photography page. Group them into collections such as “Wildlife”, and star favourites to show
            them on the homepage.
          </p>
        </div>
        <button type="button" className="a-btn-primary" onClick={() => setPicker(true)}>
          <ImagePlus className="size-4" /> Add photos
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="a-card flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-zinc-500">The gallery is empty. Upload or choose photos to get started.</p>
          <button type="button" className="a-btn-primary" onClick={() => setPicker(true)}>
            <ImagePlus className="size-4" /> Add photos
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((p, i) => (
            <li
              key={p._id}
              draggable
              onDragStart={() => (dragFrom.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom.current !== null) move(dragFrom.current, i);
                dragFrom.current = null;
              }}
              className="a-card overflow-hidden"
            >
              <div className="relative">
                <MediaThumb media={p} className="aspect-[4/3] w-full" />
                <button
                  type="button"
                  onClick={() => update(p, { photoFeatured: !p.photoFeatured }, p.photoFeatured ? "Removed from homepage" : "Shown on homepage")}
                  className={cn(
                    "absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-white/90 shadow",
                    p.photoFeatured ? "text-amber-500" : "text-zinc-400"
                  )}
                  aria-pressed={p.photoFeatured}
                  aria-label={p.photoFeatured ? "Remove from homepage" : "Show on homepage"}
                >
                  <Star className={cn("size-4", p.photoFeatured && "fill-current")} />
                </button>
              </div>
              <div className="space-y-2 p-3">
                <input
                  className="a-input"
                  list="photo-collections"
                  placeholder="Collection (e.g. Wildlife)"
                  defaultValue={p.photoCollection}
                  aria-label="Collection"
                  onBlur={(e) => e.target.value !== p.photoCollection && update(p, { photoCollection: e.target.value.trim() }, "Collection updated")}
                />
                {!p.alt && <p className="text-xs text-amber-600">Missing alt text — add it in the Media Library.</p>}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-zinc-400">
                    <GripVertical className="size-4" aria-hidden="true" /> Drag to reorder
                  </span>
                  <span className="flex">
                    <button type="button" className="p-1 text-zinc-400 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move earlier">
                      ←
                    </button>
                    <button type="button" className="p-1 text-zinc-400 disabled:opacity-30" disabled={i === photos.length - 1} onClick={() => move(i, i + 1)} aria-label="Move later">
                      →
                    </button>
                    <button
                      type="button"
                      className="p-1 text-zinc-400 hover:text-red-600"
                      onClick={async () => {
                        await update(p, { inPhotography: false, photoFeatured: false }, "Removed from gallery (file kept in library)");
                        setPhotos((all) => all.filter((x) => x._id !== p._id));
                      }}
                      aria-label="Remove from gallery"
                    >
                      <X className="size-4" />
                    </button>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <datalist id="photo-collections">
        {collections.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <MediaPicker open={picker} onClose={() => setPicker(false)} kind="image" multiple onSelect={add} />
    </div>
  );
}
