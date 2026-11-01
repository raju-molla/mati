"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Loader2, Search, Trash2, X } from "lucide-react";
import type { MediaItem, MediaKind } from "@/types";
import { api, ApiError } from "./api";
import { useFeedback } from "./Feedback";
import { MediaThumb } from "./MediaThumb";
import { MediaUploader } from "./MediaUploader";
import { formatBytes } from "@/lib/utils/media";
import { cn } from "@/lib/utils/cn";

export function MediaLibrary() {
  const { toast, confirm } = useFeedback();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState<MediaKind | "">("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (kind) params.set("kind", kind);
        if (search) params.set("q", search);
        const data = await api<{ items: MediaItem[]; total: number }>(`/api/admin/media?${params}`);
        setItems((prev) => (p === 1 ? data.items : [...prev, ...data.items]));
        setTotal(data.total);
        setPage(p);
      } catch (e) {
        toast((e as Error).message, "error");
      } finally {
        setLoading(false);
      }
    },
    [kind, search, toast]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const remove = async (m: MediaItem, force = false): Promise<void> => {
    if (!force) {
      const ok = await confirm({
        title: "Delete this file?",
        body: `${m.filename} will be removed from the media server. This can't be undone.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
    }
    try {
      await api(`/api/admin/media/${m._id}${force ? "?force=1" : ""}`, { method: "DELETE" });
      setItems((all) => all.filter((x) => x._id !== m._id));
      setTotal((t) => t - 1);
      setSelected(null);
      toast("File deleted");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && Array.isArray(e.payload.usage)) {
        const usage = e.payload.usage as string[];
        const ok = await confirm({
          title: "This file is in use",
          body: (
            <div>
              <p>It&apos;s currently used in:</p>
              <ul className="mt-2 list-disc pl-5">
                {usage.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <p className="mt-3">Delete anyway? It will be removed from those places.</p>
            </div>
          ),
          confirmLabel: "Delete anyway",
          danger: true,
        });
        if (ok) return remove(m, true);
        return;
      }
      toast((e as Error).message, "error");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Media library</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All images, videos and documents. Files are stored on Cloudinary and optimised automatically.
        </p>
      </div>

      <div className="mb-6">
        <MediaUploader
          onUploaded={(up) => {
            setItems((prev) => [...up, ...prev]);
            setTotal((t) => t + up.length);
            toast(`${up.length} file${up.length > 1 ? "s" : ""} uploaded — remember to add alt text`);
            if (up.length === 1) setSelected(up[0]!);
          }}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input className="a-input pl-9" placeholder="Search and press Enter" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" />
        </form>
        <div className="flex gap-1 rounded-md border border-zinc-200 bg-white p-1" role="group" aria-label="Filter by type">
          {(["", "image", "video", "document"] as const).map((k) => (
            <button
              key={k || "all"}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cn("rounded px-3 py-1.5 text-sm", kind === k ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}
            >
              {k === "" ? "All" : k === "document" ? "Documents" : `${k[0]!.toUpperCase()}${k.slice(1)}s`}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-zinc-500">{total} files</p>

      {items.length === 0 && !loading ? (
        <div className="a-card py-16 text-center text-sm text-zinc-500">No files match. Upload something above.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {items.map((m) => (
            <li key={m._id}>
              <button
                type="button"
                onClick={() => setSelected(m)}
                className="group block w-full overflow-hidden rounded-md border border-zinc-200 bg-white text-left hover:border-zinc-400"
              >
                <MediaThumb media={m} className="aspect-[4/3] w-full" />
                <span className="block px-2 py-1.5">
                  <span className="block truncate text-xs font-medium">{m.filename}</span>
                  <span className={cn("block truncate text-[11px]", m.kind === "image" && !m.alt ? "text-amber-600" : "text-zinc-500")}>
                    {m.kind === "image" && !m.alt ? "Missing alt text" : formatBytes(m.size)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && <Loader2 className="mx-auto my-8 size-5 animate-spin text-zinc-400" />}
      {!loading && items.length < total && (
        <div className="mt-6 text-center">
          <button type="button" className="a-btn-secondary" onClick={() => load(page + 1)}>
            Load more
          </button>
        </div>
      )}

      {selected && (
        <MediaDetails
          key={selected._id}
          media={selected}
          onClose={() => setSelected(null)}
          onSaved={(m) => {
            setItems((all) => all.map((x) => (x._id === m._id ? m : x)));
            setSelected(null);
          }}
          onDelete={() => remove(selected)}
        />
      )}
    </div>
  );
}

function MediaDetails({
  media,
  onClose,
  onSaved,
  onDelete,
}: {
  media: MediaItem;
  onClose: () => void;
  onSaved: (m: MediaItem) => void;
  onDelete: () => void;
}) {
  const { toast } = useFeedback();
  const [alt, setAlt] = useState(media.alt);
  const [caption, setCaption] = useState(media.caption);
  const [inPhotography, setInPhotography] = useState(media.inPhotography);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api<MediaItem>(`/api/admin/media/${media._id}`, {
        method: "PATCH",
        body: { alt, caption, ...(media.kind === "image" ? { inPhotography } : {}) },
      });
      toast("Details saved");
      onSaved(updated);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 ml-auto h-[100dvh] max-h-none w-full max-w-lg bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-900/30"
      aria-label="File details"
    >
      <form onSubmit={save} className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="truncate font-semibold">{media.filename}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {media.kind === "video" ? (
            <video src={media.url} poster={media.posterUrl || undefined} controls className="w-full rounded bg-black" />
          ) : (
            <MediaThumb media={media} className="max-h-72 w-full rounded object-contain" />
          )}
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-zinc-500">Type</dt>
            <dd>{media.format.toUpperCase()}</dd>
            <dt className="text-zinc-500">Size</dt>
            <dd>{formatBytes(media.size)}</dd>
            {media.width ? (
              <>
                <dt className="text-zinc-500">Dimensions</dt>
                <dd>
                  {media.width} × {media.height}
                </dd>
              </>
            ) : null}
            <dt className="text-zinc-500">Uploaded</dt>
            <dd>{new Date(media.createdAt).toLocaleDateString("en-GB")}</dd>
          </dl>
          <button
            type="button"
            className="a-btn-secondary"
            onClick={() => {
              navigator.clipboard.writeText(media.url).then(() => toast("Link copied", "info"));
            }}
          >
            <Copy className="size-4" /> Copy link
          </button>
          {media.kind !== "document" && (
            <div>
              <label htmlFor="m-alt" className="a-label">
                Alt text {media.kind === "image" && <span className="text-amber-600">(recommended)</span>}
              </label>
              <input id="m-alt" className="a-input" value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what's in the image" />
              <p className="a-help">Read aloud by screen readers and used by search engines. e.g. “Red fox crossing a frosted field at dawn”.</p>
            </div>
          )}
          <div>
            <label htmlFor="m-caption" className="a-label">
              Caption (optional)
            </label>
            <textarea id="m-caption" rows={2} className="a-input" value={caption} maxLength={600} onChange={(e) => setCaption(e.target.value)} />
          </div>
          {media.kind === "image" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={inPhotography} onChange={(e) => setInPhotography(e.target.checked)} className="size-4 rounded border-zinc-300" />
              Show in the Photography gallery
            </label>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button type="button" onClick={onDelete} className="a-btn text-red-600 hover:bg-red-50">
            <Trash2 className="size-4" /> Delete
          </button>
          <button type="submit" className="a-btn-primary" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
