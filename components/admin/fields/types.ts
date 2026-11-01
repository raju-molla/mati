import type { MediaKind } from "@/types";

interface Base {
  /** Dot path into the form value, e.g. "seo.title". */
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  /** Spans both columns in a two-column form. */
  full?: boolean;
}

export type FieldDef =
  | (Base & { type: "text" | "url" | "email"; placeholder?: string; maxLength?: number })
  | (Base & { type: "textarea"; rows?: number; placeholder?: string; maxLength?: number })
  | (Base & { type: "number"; min?: number; max?: number })
  | (Base & { type: "color" })
  | (Base & { type: "toggle" })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "list"; placeholder?: string; suggestions?: string[] })
  | (Base & { type: "media"; accept: MediaKind })
  | (Base & { type: "mediaList"; accept: MediaKind })
  | (Base & { type: "relation"; resource: string; labelKey: string; emptyLabel?: string })
  | (Base & { type: "relationMulti"; resource: string; labelKey: string; filterPublished?: boolean })
  | (Base & { type: "icon" })
  | (Base & { type: "homeSections" })
  | (Base & { type: "projectSections" });

export interface FieldGroup {
  title: string;
  description?: string;
  fields: FieldDef[];
}

/* ───────── value helpers ───────── */

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setPath<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone: Record<string, unknown> = { ...obj };
  let cur = clone;
  keys.slice(0, -1).forEach((k) => {
    const next = cur[k];
    cur[k] = next && typeof next === "object" && !Array.isArray(next) ? { ...(next as object) } : {};
    cur = cur[k] as Record<string, unknown>;
  });
  cur[keys[keys.length - 1]!] = value;
  return clone as T;
}

const idOf = (v: unknown): string | null =>
  v == null ? null : typeof v === "string" ? v : ((v as { _id?: string })._id ?? null);

/**
 * Convert form state (which holds populated objects for previews) into the
 * API payload (ids only), including only the fields that the form defines.
 */
export function toPayload(fields: FieldDef[], values: Record<string, unknown>): Record<string, unknown> {
  let out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = getPath(values, f.name);
    let next: unknown = v;
    switch (f.type) {
      case "media":
      case "relation":
        next = idOf(v);
        break;
      case "mediaList":
      case "relationMulti":
        next = Array.isArray(v) ? v.map(idOf).filter(Boolean) : [];
        break;
      case "number":
        next = v === "" || v == null ? undefined : Number(v);
        break;
      case "list":
        next = Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
        break;
      case "toggle":
        next = Boolean(v);
        break;
      case "homeSections":
        next = Array.isArray(v) ? v : undefined;
        break;
      case "projectSections":
        next = Array.isArray(v)
          ? v.map((s: Record<string, unknown>) => ({
              ...(s._id ? { _id: s._id } : {}),
              type: s.type,
              heading: s.heading ?? "",
              body: s.body ?? "",
              embedUrl: s.embedUrl ?? "",
              media: Array.isArray(s.media) ? s.media.map(idOf).filter(Boolean) : [],
            }))
          : [];
        break;
      default:
        next = v ?? "";
    }
    if (next !== undefined) out = setPath(out, f.name, next);
  }
  return out;
}
