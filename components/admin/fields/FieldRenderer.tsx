"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Plus, Trash2, X } from "lucide-react";
import type { MediaItem } from "@/types";
import { api } from "../api";
import { MediaPicker } from "../MediaPicker";
import { MediaThumb } from "../MediaThumb";
import { ICON_NAMES, Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";
import type { FieldDef } from "./types";
import { HomeSectionsField } from "./HomeSectionsField";
import { ProjectSectionsField } from "./ProjectSectionsField";

type OnChange = (value: unknown) => void;

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldDef;
  value: unknown;
  onChange: OnChange;
  error?: string;
}) {
  const id = `f-${field.name.replace(/\./g, "-")}`;
  const describedBy = [field.help ? `${id}-help` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

  const label =
    field.type === "toggle" ? null : (
      <label htmlFor={id} className="a-label">
        {field.label}
        {field.required && <span className="text-red-600"> *</span>}
      </label>
    );

  let control: React.ReactNode;
  switch (field.type) {
    case "text":
    case "url":
    case "email":
      control = (
        <input
          id={id}
          type={field.type === "text" ? "text" : field.type}
          className="a-input"
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          required={field.required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "textarea":
      control = (
        <textarea
          id={id}
          className="a-input min-h-[90px] resize-y leading-relaxed"
          rows={field.rows ?? 4}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "number":
      control = (
        <input
          id={id}
          type="number"
          className="a-input max-w-[160px]"
          value={value === undefined || value === null ? "" : String(value)}
          min={field.min}
          max={field.max}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            className="h-9 w-12 cursor-pointer rounded border border-zinc-300"
            value={(value as string) || "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            className="a-input max-w-[120px] font-mono"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${field.label} hex value`}
          />
        </div>
      );
      break;
    case "toggle":
      control = (
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
          <span className="relative mt-0.5 inline-flex">
            <input
              id={id}
              type="checkbox"
              className="peer sr-only"
              checked={Boolean(value)}
              aria-describedby={describedBy}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="h-5 w-9 rounded-full bg-zinc-300 transition-colors peer-checked:bg-zinc-900 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900 peer-focus-visible:ring-offset-2" />
            <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
          <span className="text-sm font-medium text-zinc-800">{field.label}</span>
        </label>
      );
      break;
    case "select":
      control = (
        <select
          id={id}
          className="a-input"
          value={(value as string) ?? ""}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "list":
      control = <ListField id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={field.placeholder} suggestions={field.suggestions} />;
      break;
    case "media":
      control = <MediaField id={id} value={value as MediaItem | null} onChange={onChange} accept={field.accept} />;
      break;
    case "mediaList":
      control = <MediaListField id={id} value={(value as MediaItem[]) ?? []} onChange={onChange} accept={field.accept} />;
      break;
    case "relation":
      control = (
        <RelationField
          id={id}
          value={value}
          onChange={onChange}
          resource={field.resource}
          labelKey={field.labelKey}
          emptyLabel={field.emptyLabel}
        />
      );
      break;
    case "relationMulti":
      control = (
        <RelationMultiField
          value={(value as unknown[]) ?? []}
          onChange={onChange}
          resource={field.resource}
          labelKey={field.labelKey}
          filterPublished={field.filterPublished}
        />
      );
      break;
    case "icon":
      control = (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.label}>
          {["", ...ICON_NAMES].map((n) => (
            <button
              key={n || "none"}
              type="button"
              role="radio"
              aria-checked={(value ?? "") === n}
              title={n || "None"}
              onClick={() => onChange(n)}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md border text-zinc-700",
                (value ?? "") === n ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 hover:bg-zinc-50"
              )}
            >
              {n ? <Icon name={n} className="size-5" /> : <X className="size-4" />}
              <span className="sr-only">{n || "None"}</span>
            </button>
          ))}
        </div>
      );
      break;
    case "homeSections":
      control = <HomeSectionsField value={value as never} onChange={onChange} />;
      break;
    case "projectSections":
      control = <ProjectSectionsField value={(value as never) ?? []} onChange={onChange} />;
      break;
  }

  return (
    <div className={cn(field.full && "sm:col-span-2")}>
      {label}
      {control}
      {field.help && (
        <p id={`${id}-help`} className="a-help">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ───────── List of short strings (tools, highlights, …) ───────── */

function ListField({
  id,
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  id: string;
  value: string[];
  onChange: OnChange;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    onChange(next);
  };
  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {value.map((v, i) => (
            <li key={`${v}-${i}`} className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white py-1 pr-1 pl-3 text-sm">
              <input
                className="flex-1 border-0 bg-transparent p-0 text-sm focus:ring-0 focus:outline-none"
                value={v}
                aria-label={`Item ${i + 1}`}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="size-3.5" />
              </button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-zinc-400 hover:text-red-600" aria-label={`Remove ${v}`}>
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          className="a-input"
          value={draft}
          placeholder={placeholder ?? "Type and press Enter"}
          list={suggestions ? `${id}-suggestions` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <button type="button" className="a-btn-secondary" onClick={() => add(draft)} aria-label="Add item">
          <Plus className="size-4" />
        </button>
        {suggestions && (
          <datalist id={`${id}-suggestions`}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}

/* ───────── Single media ───────── */

function MediaField({ id, value, onChange, accept }: { id: string; value: MediaItem | null; onChange: OnChange; accept: "image" | "video" | "document" }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value && typeof value === "object" ? (
        <div className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-2">
          <MediaThumb media={value} className="h-16 w-24 shrink-0 rounded" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.filename}</p>
            <p className={cn("truncate text-xs", value.alt || value.kind !== "image" ? "text-zinc-500" : "text-amber-600")}>
              {value.kind === "image" ? value.alt || "No alt text — add it in the Media Library" : value.kind}
            </p>
          </div>
          <button type="button" className="a-btn-secondary" onClick={() => setOpen(true)}>
            Replace
          </button>
          <button type="button" className="rounded p-2 text-zinc-400 hover:text-red-600" onClick={() => onChange(null)} aria-label="Remove">
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <button id={id} type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50">
          <ImagePlus className="size-4" /> Choose or upload {accept === "document" ? "a PDF" : accept === "video" ? "a video" : "an image"}
        </button>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} kind={accept} onSelect={(items) => onChange(items[0] ?? null)} initialSelected={value?._id ? [value._id] : []} />
    </div>
  );
}

/* ───────── Media list (gallery) ───────── */

function MediaListField({ id, value, onChange, accept }: { id: string; value: MediaItem[]; onChange: OnChange; accept: "image" | "video" | "document" }) {
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const items = value.filter((v) => v && typeof v === "object");
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    onChange(next);
  };
  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m, i) => (
            <li
              key={m._id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              className="group relative overflow-hidden rounded-md border border-zinc-200 bg-white"
            >
              <MediaThumb media={m} className="aspect-[4/3] w-full" />
              <div className="flex items-center justify-between px-1.5 py-1">
                <GripVertical className="size-4 cursor-grab text-zinc-400" aria-hidden="true" />
                <div className="flex">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded p-1 text-zinc-500 disabled:opacity-30" aria-label="Move earlier">
                    <ArrowUp className="size-3.5 -rotate-90" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="rounded p-1 text-zinc-500 disabled:opacity-30" aria-label="Move later">
                    <ArrowDown className="size-3.5 -rotate-90" />
                  </button>
                  <button type="button" onClick={() => onChange(items.filter((x) => x._id !== m._id))} className="rounded p-1 text-zinc-500 hover:text-red-600" aria-label="Remove">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button id={id} type="button" className="a-btn-secondary" onClick={() => setOpen(true)}>
        <ImagePlus className="size-4" /> Add {accept === "video" ? "videos" : "images"}
      </button>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        kind={accept}
        multiple
        onSelect={(sel) => onChange([...items, ...sel.filter((s) => !items.some((x) => x._id === s._id))])}
      />
    </div>
  );
}

/* ───────── Relations ───────── */

type Option = { _id: string; published?: boolean } & Record<string, unknown>;

function useOptions(resource: string) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    let alive = true;
    api<Option[]>(`/api/admin/${resource}`)
      .then((d) => alive && setOptions(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [resource]);
  return options;
}

function RelationField({ id, value, onChange, resource, labelKey, emptyLabel }: { id: string; value: unknown; onChange: OnChange; resource: string; labelKey: string; emptyLabel?: string }) {
  const options = useOptions(resource);
  const current = value == null ? "" : typeof value === "string" ? value : ((value as Option)._id ?? "");
  return (
    <select id={id} className="a-input" value={current} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{emptyLabel ?? "— None —"}</option>
      {options.map((o) => (
        <option key={o._id} value={o._id}>
          {String(o[labelKey] ?? o._id)}
        </option>
      ))}
    </select>
  );
}

function RelationMultiField({ value, onChange, resource, labelKey, filterPublished }: { value: unknown[]; onChange: OnChange; resource: string; labelKey: string; filterPublished?: boolean }) {
  const options = useOptions(resource).filter((o) => !filterPublished || o.published);
  const ids = value.map((v) => (typeof v === "string" ? v : (v as Option)._id));
  const selected = ids.map((i) => options.find((o) => o._id === i)).filter(Boolean) as Option[];
  const available = options.filter((o) => !ids.includes(o._id));
  const move = (i: number, d: number) => {
    const next = [...ids];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {selected.length === 0 && <p className="text-sm text-zinc-500">None chosen — projects marked “Featured” will be shown automatically.</p>}
      <ol className="space-y-1.5">
        {selected.map((o, i) => (
          <li key={o._id} className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm">
            <span className="w-5 text-xs text-zinc-400">{i + 1}</span>
            <span className="flex-1">{String(o[labelKey])}</span>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-zinc-400 disabled:opacity-30" aria-label="Move up">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="p-1 text-zinc-400 disabled:opacity-30" aria-label="Move down">
              <ArrowDown className="size-3.5" />
            </button>
            <button type="button" onClick={() => onChange(ids.filter((x) => x !== o._id))} className="p-1 text-zinc-400 hover:text-red-600" aria-label="Remove">
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ol>
      {available.length > 0 && (
        <select className="a-input" value="" onChange={(e) => e.target.value && onChange([...ids, e.target.value])} aria-label="Add item">
          <option value="">+ Add…</option>
          {available.map((o) => (
            <option key={o._id} value={o._id}>
              {String(o[labelKey])}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
