"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import type { HomepageSectionConfig, HomepageSectionKey } from "@/types";
import { cn } from "@/lib/utils/cn";

const NAMES: Record<HomepageSectionKey, { name: string; hint: string }> = {
  featuredWork: { name: "Featured work", hint: "Large project cards" },
  disciplines: { name: "About preview", hint: "Uses the About page preview text and focus areas" },
  photography: { name: "Photography", hint: "Photos marked “featured” in Photography" },
  services: { name: "Services", hint: "Published services" },
  technical: { name: "Technical projects", hint: "Projects from the technical category" },
  experience: { name: "Experience", hint: "Most recent four roles" },
  cta: { name: "Call to action", hint: "“Have a project in mind?” banner" },
};

/** Show/hide, reorder and retitle homepage sections. */
export function HomeSectionsField({
  value,
  onChange,
}: {
  value: HomepageSectionConfig[] | undefined;
  onChange: (v: HomepageSectionConfig[]) => void;
}) {
  const list = value ?? [];
  const update = (i: number, patch: Partial<HomepageSectionConfig>) =>
    onChange(list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x!);
    onChange(next);
  };

  return (
    <ol className="space-y-3">
      {list.map((s, i) => (
        <li key={s.key} className={cn("rounded-lg border bg-white p-4", s.visible ? "border-zinc-200" : "border-dashed border-zinc-300 opacity-70")}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-6 text-sm text-zinc-400">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{NAMES[s.key]?.name ?? s.key}</p>
              <p className="text-xs text-zinc-500">{NAMES[s.key]?.hint}</p>
            </div>
            <button
              type="button"
              className="a-btn-secondary !px-2.5"
              onClick={() => update(i, { visible: !s.visible })}
              aria-pressed={s.visible}
            >
              {s.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {s.visible ? "Visible" : "Hidden"}
            </button>
            <button type="button" className="a-btn-secondary !px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
              <ArrowUp className="size-4" />
            </button>
            <button type="button" className="a-btn-secondary !px-2" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
              <ArrowDown className="size-4" />
            </button>
          </div>
          {s.visible && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="a-label text-xs" htmlFor={`sec-${s.key}-eyebrow`}>
                  Small label
                </label>
                <input id={`sec-${s.key}-eyebrow`} className="a-input" value={s.eyebrow ?? ""} onChange={(e) => update(i, { eyebrow: e.target.value })} />
              </div>
              <div>
                <label className="a-label text-xs" htmlFor={`sec-${s.key}-heading`}>
                  Heading
                </label>
                <input id={`sec-${s.key}-heading`} className="a-input" value={s.heading ?? ""} onChange={(e) => update(i, { heading: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="a-label text-xs" htmlFor={`sec-${s.key}-intro`}>
                  Intro text (optional)
                </label>
                <textarea id={`sec-${s.key}-intro`} rows={2} className="a-input" value={s.intro ?? ""} onChange={(e) => update(i, { intro: e.target.value })} />
              </div>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
