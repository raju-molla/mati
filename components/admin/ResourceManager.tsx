"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ExternalLink, GripVertical, Loader2, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { api, ApiError } from "./api";
import { useFeedback } from "./Feedback";
import { MediaThumb } from "./MediaThumb";
import { FieldRenderer } from "./fields/FieldRenderer";
import { getPath, setPath, toPayload } from "./fields/types";
import { RESOURCE_CONFIGS } from "./resource-configs";
import { cn } from "@/lib/utils/cn";

type Item = Record<string, unknown> & { _id: string };

/**
 * Generic list + editor used for categories, experience, education, skills,
 * services and the project list. Supports search, drag-and-drop ordering,
 * publish/feature toggles, side-panel editing and confirmed deletion.
 */
export function ResourceManager({ configKey, initialItems }: { configKey: string; initialItems: Item[] }) {
  const cfg = RESOURCE_CONFIGS[configKey]!;
  const { toast, confirm } = useFeedback();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const dragFrom = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${cfg.primary(i)} ${cfg.secondary?.(i) ?? ""}`.toLowerCase().includes(q));
  }, [items, query, cfg]);

  const refresh = async () => setItems(await api<Item[]>(`/api/admin/${cfg.resource}`));

  const saveOrder = async (next: Item[]) => {
    const prev = items;
    setItems(next);
    try {
      await api(`/api/admin/${cfg.resource}/reorder`, { method: "POST", body: { ids: next.map((i) => i._id) } });
      toast("Order saved");
    } catch (e) {
      setItems(prev);
      toast((e as Error).message, "error");
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    saveOrder(next);
  };

  const patch = async (item: Item, body: Record<string, unknown>, msg: string) => {
    setBusyId(item._id);
    try {
      await api(`/api/admin/${cfg.resource}/${item._id}`, { method: "PATCH", body });
      setItems((all) => all.map((i) => (i._id === item._id ? { ...i, ...body } : i)));
      toast(msg);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item: Item) => {
    const ok = await confirm({
      title: `Delete this ${cfg.singular}?`,
      body: (
        <>
          <strong>{cfg.primary(item)}</strong> will be permanently removed. This can&apos;t be undone.
        </>
      ),
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusyId(item._id);
    try {
      await api(`/api/admin/${cfg.resource}/${item._id}`, { method: "DELETE" });
      setItems((all) => all.filter((i) => i._id !== item._id));
      toast(`${cfg.singular[0]!.toUpperCase()}${cfg.singular.slice(1)} deleted`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const canDrag = cfg.orderable && !query;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cfg.title}</h1>
          {cfg.description && <p className="mt-1 max-w-2xl text-sm text-zinc-500">{cfg.description}</p>}
        </div>
        {cfg.newPath ? (
          <Link href={cfg.newPath} className="a-btn-primary">
            <Plus className="size-4" /> New {cfg.singular}
          </Link>
        ) : (
          <button type="button" className="a-btn-primary" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> New {cfg.singular}
          </button>
        )}
      </div>

      {items.length > 6 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input className="a-input pl-9" placeholder={`Search ${cfg.title.toLowerCase()}`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
        </div>
      )}

      {items.length === 0 ? (
        <div className="a-card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="text-sm text-zinc-500">{cfg.emptyText}</p>
          {cfg.newPath ? (
            <Link href={cfg.newPath} className="a-btn-primary">
              <Plus className="size-4" /> Add {cfg.singular}
            </Link>
          ) : (
            <button type="button" className="a-btn-primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" /> Add {cfg.singular}
            </button>
          )}
        </div>
      ) : (
        <ul className="a-card divide-y divide-zinc-100">
          {filtered.map((item) => {
            const index = items.indexOf(item);
            const thumb = cfg.thumb?.(item);
            const publicHref = cfg.publicPath?.(item);
            return (
              <li
                key={item._id}
                draggable={canDrag}
                onDragStart={() => (dragFrom.current = index)}
                onDragOver={(e) => canDrag && e.preventDefault()}
                onDrop={() => {
                  if (dragFrom.current !== null) move(dragFrom.current, index);
                  dragFrom.current = null;
                }}
                className={cn("flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-4", busyId === item._id && "opacity-60")}
              >
                {canDrag && (
                  <div className="flex flex-col items-center">
                    <GripVertical className="hidden size-4 cursor-grab text-zinc-300 sm:block" aria-hidden="true" />
                    <div className="flex sm:hidden">
                      <button type="button" className="p-1 text-zinc-400" onClick={() => move(index, index - 1)} aria-label="Move up">
                        ↑
                      </button>
                      <button type="button" className="p-1 text-zinc-400" onClick={() => move(index, index + 1)} aria-label="Move down">
                        ↓
                      </button>
                    </div>
                  </div>
                )}
                {cfg.thumb && <MediaThumb media={thumb ?? null} className="h-12 w-16 shrink-0 rounded" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{cfg.primary(item) || "Untitled"}</p>
                  {cfg.secondary && <p className="truncate text-xs text-zinc-500">{cfg.secondary(item)}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {cfg.featurable && (
                    <button
                      type="button"
                      onClick={() => patch(item, { featured: !item.featured }, item.featured ? "Removed from featured" : "Marked as featured")}
                      className={cn("rounded p-2", item.featured ? "text-amber-500" : "text-zinc-300 hover:text-zinc-500")}
                      aria-pressed={Boolean(item.featured)}
                      aria-label={item.featured ? "Unfeature" : "Feature"}
                      title={item.featured ? "Featured" : "Mark as featured"}
                    >
                      <Star className={cn("size-4", Boolean(item.featured) && "fill-current")} />
                    </button>
                  )}
                  {cfg.publishable && (
                    <button
                      type="button"
                      onClick={() => patch(item, { published: !item.published }, item.published ? "Hidden from website" : "Published")}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        item.published ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      )}
                      title={item.published ? "Click to hide" : "Click to publish"}
                    >
                      {item.published ? "Published" : "Draft"}
                    </button>
                  )}
                  {publicHref && (
                    <a href={publicHref} target="_blank" rel="noopener noreferrer" className="rounded p-2 text-zinc-400 hover:text-zinc-800" aria-label="View on website">
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  {cfg.editPath ? (
                    <Link href={cfg.editPath(item._id)} className="rounded p-2 text-zinc-500 hover:text-zinc-900" aria-label={`Edit ${cfg.primary(item)}`}>
                      <Pencil className="size-4" />
                    </Link>
                  ) : (
                    <button type="button" onClick={() => setEditing(item)} className="rounded p-2 text-zinc-500 hover:text-zinc-900" aria-label={`Edit ${cfg.primary(item)}`}>
                      <Pencil className="size-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => remove(item)} className="rounded p-2 text-zinc-400 hover:text-red-600" aria-label={`Delete ${cfg.primary(item)}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {canDrag && items.length > 1 && <p className="mt-3 text-xs text-zinc-500">Tip: drag rows to reorder (or use the arrows on mobile). Order saves automatically.</p>}

      {editing && (
        <EditorPanel
          configKey={configKey}
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function EditorPanel({
  configKey,
  item,
  onClose,
  onSaved,
}: {
  configKey: string;
  item: Item | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const cfg = RESOURCE_CONFIGS[configKey]!;
  const { toast } = useFeedback();
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...cfg.blank, ...(item ?? {}) }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = toPayload(cfg.fields, values);
      if (item) await api(`/api/admin/${cfg.resource}/${item._id}`, { method: "PATCH", body });
      else await api(`/api/admin/${cfg.resource}`, { method: "POST", body });
      toast(item ? "Changes saved" : `${cfg.singular[0]!.toUpperCase()}${cfg.singular.slice(1)} added`);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.payload.fieldErrors) setErrors(err.payload.fieldErrors as Record<string, string>);
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={(el) => {
        dialog.current = el;
        if (el && !el.open) el.showModal();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-0 ml-auto h-[100dvh] max-h-none w-full max-w-xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-900/30"
      aria-labelledby="editor-title"
    >
      <form onSubmit={save} className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 id="editor-title" className="text-lg font-semibold">
            {item ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="grid flex-1 content-start gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
          {cfg.fields.map((f) => (
            <div key={f.name} className={cn(f.type === "textarea" || f.type === "list" || f.type === "media" || f.full ? "sm:col-span-2" : "")}>
              <FieldRenderer field={f} value={getPath(values, f.name)} onChange={(v) => setValues((s) => setPath(s, f.name, v))} error={errors[f.name]} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
          <button type="button" className="a-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="a-btn-primary" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {item ? "Save changes" : `Add ${cfg.singular}`}
          </button>
        </div>
      </form>
    </dialog>
  );
}
