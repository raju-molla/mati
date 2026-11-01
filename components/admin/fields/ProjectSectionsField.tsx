"use client";

import { ArrowDown, ArrowUp, Film, GalleryHorizontal, Image as ImageIcon, Quote, Trash2, Type } from "lucide-react";
import type { MediaItem, ProjectSection } from "@/types";
import { FieldRenderer } from "./FieldRenderer";

type Section = Omit<ProjectSection, "media"> & { media: MediaItem[] };

const TYPES: { type: Section["type"]; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { type: "video", label: "Video", icon: Film },
  { type: "quote", label: "Quote", icon: Quote },
];

/** Flexible extra blocks for a case study (shown after the standard sections). */
export function ProjectSectionsField({ value, onChange }: { value: Section[]; onChange: (v: Section[]) => void }) {
  const update = (i: number, patch: Partial<Section>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((s, i) => {
        const meta = TYPES.find((t) => t.type === s.type)!;
        const key = s._id ?? `new-${i}`;
        return (
          <div key={key} className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <meta.icon className="size-4 text-zinc-500" aria-hidden="true" />
              <span className="flex-1 text-sm font-semibold">{meta.label} block</span>
              <button type="button" className="rounded p-1.5 text-zinc-500 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" className="rounded p-1.5 text-zinc-500 disabled:opacity-30" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                <ArrowDown className="size-4" />
              </button>
              <button type="button" className="rounded p-1.5 text-zinc-500 hover:text-red-600" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove block">
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="grid gap-4">
              <FieldRenderer
                field={{ name: `s${i}.heading`, label: s.type === "quote" ? "Attribution (optional)" : "Heading (optional)", type: "text" }}
                value={s.heading}
                onChange={(v) => update(i, { heading: v as string })}
              />
              {(s.type === "text" || s.type === "quote") && (
                <FieldRenderer
                  field={{ name: `s${i}.body`, label: s.type === "quote" ? "Quote" : "Text", type: "textarea", rows: 5, help: "Leave a blank line between paragraphs." }}
                  value={s.body}
                  onChange={(v) => update(i, { body: v as string })}
                />
              )}
              {s.type === "image" && (
                <FieldRenderer
                  field={{ name: `s${i}.media`, label: "Image", type: "media", accept: "image" }}
                  value={s.media[0] ?? null}
                  onChange={(v) => update(i, { media: v ? [v as MediaItem] : [] })}
                />
              )}
              {s.type === "gallery" && (
                <FieldRenderer
                  field={{ name: `s${i}.media`, label: "Images", type: "mediaList", accept: "image" }}
                  value={s.media}
                  onChange={(v) => update(i, { media: v as MediaItem[] })}
                />
              )}
              {s.type === "video" && (
                <>
                  <FieldRenderer
                    field={{ name: `s${i}.embedUrl`, label: "YouTube or Vimeo link", type: "url", placeholder: "https://youtube.com/watch?v=…" }}
                    value={s.embedUrl}
                    onChange={(v) => update(i, { embedUrl: v as string })}
                  />
                  <FieldRenderer
                    field={{ name: `s${i}.media`, label: "…or an uploaded MP4", type: "media", accept: "video" }}
                    value={s.media[0] ?? null}
                    onChange={(v) => update(i, { media: v ? [v as MediaItem] : [] })}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            className="a-btn-secondary"
            onClick={() => onChange([...value, { type: t.type, heading: "", body: "", media: [], embedUrl: "" }])}
          >
            <t.icon className="size-4" aria-hidden="true" /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
