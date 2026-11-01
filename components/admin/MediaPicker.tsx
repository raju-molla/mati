"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import type { MediaItem, MediaKind } from "@/types";
import { api } from "./api";
import { MediaThumb } from "./MediaThumb";
import { MediaUploader } from "./MediaUploader";
import { cn } from "@/lib/utils/cn";

/**
 * Modal for choosing existing media (or uploading new) — used everywhere an
 * image, video or document can be attached.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  kind,
  multiple,
  initialSelected = [],
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  kind?: MediaKind;
  multiple?: boolean;
  initialSelected?: string[];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(
    async (p = 1, search = q) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (kind) params.set("kind", kind);
        if (search) params.set("q", search);
        const data = await api<{ items: MediaItem[]; total: number }>(`/api/admin/media?${params}`);
        setItems((prev) => (p === 1 ? data.items : [...prev, ...data.items]));
        setTotal(data.total);
        setPage(p);
      } finally {
        setLoading(false);
      }
    },
    [kind, q]
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
      setSelected([]);
      load(1, "");
      setQ("");
    } else if (d.open) d.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (m: MediaItem) => {
    if (!multiple) {
      onSelect([m]);
      onClose();
      return;
    }
    setSelected((s) => (s.some((x) => x._id === m._id) ? s.filter((x) => x._id !== m._id) : [...s, m]));
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto h-[min(88vh,820px)] w-[min(96vw,1100px)] rounded-xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-900/50"
      aria-label="Choose media"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold">
            Choose {kind === "video" ? "a video" : kind === "document" ? "a document" : multiple ? "images" : "an image"}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-hidden md:grid-cols-[280px_1fr]">
          <div className="space-y-4 overflow-y-auto border-b border-zinc-200 p-5 md:border-r md:border-b-0">
            <p className="text-sm font-medium">Upload new</p>
            <MediaUploader
              compact
              accept={kind ? [kind] : undefined}
              multiple={multiple}
              onUploaded={(up) => {
                setItems((prev) => [...up, ...prev]);
                if (!multiple && up[0]) {
                  onSelect([up[0]]);
                  onClose();
                } else setSelected((s) => [...s, ...up]);
              }}
            />
            <p className="text-xs text-zinc-500">
              Tip: add descriptive alt text in the Media Library — it helps accessibility and search engines.
            </p>
          </div>

          <div className="flex min-h-0 flex-col">
            <form
              className="flex gap-2 border-b border-zinc-200 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                load(1, q);
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by file name, alt text or caption"
                  className="a-input pl-9"
                  aria-label="Search media"
                />
              </div>
              <button type="submit" className="a-btn-secondary">
                Search
              </button>
            </form>
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 && !loading ? (
                <p className="py-16 text-center text-sm text-zinc-500">No files yet — upload one on the left.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((m) => {
                    const isSel = selected.some((s) => s._id === m._id) || (!multiple && initialSelected.includes(m._id));
                    return (
                      <li key={m._id}>
                        <button
                          type="button"
                          onClick={() => toggle(m)}
                          aria-pressed={isSel}
                          className={cn(
                            "group relative block w-full overflow-hidden rounded-md border-2 text-left",
                            isSel ? "border-zinc-900" : "border-transparent hover:border-zinc-300"
                          )}
                        >
                          <MediaThumb media={m} className="aspect-[4/3] w-full" />
                          {isSel && (
                            <span className="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white">
                              <Check className="size-4" />
                            </span>
                          )}
                          <span className="block truncate px-1 py-1 text-xs text-zinc-600">{m.alt || m.filename}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {loading && <Loader2 className="mx-auto my-6 size-5 animate-spin text-zinc-400" />}
              {!loading && items.length < total && (
                <div className="mt-4 text-center">
                  <button type="button" className="a-btn-secondary" onClick={() => load(page + 1)}>
                    Load more
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {multiple && (
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-5 py-3">
            <span className="text-sm text-zinc-600">{selected.length} selected</span>
            <div className="flex gap-2">
              <button type="button" className="a-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="a-btn-primary"
                disabled={!selected.length}
                onClick={() => {
                  onSelect(selected);
                  onClose();
                }}
              >
                Add selected
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
