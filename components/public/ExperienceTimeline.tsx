import type { ExperienceItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

export function ExperienceTimeline({ items, compact }: { items: ExperienceItem[]; compact?: boolean }) {
  return (
    <ol className="border-t border-line">
      {items.map((e, i) => (
        <Reveal as="li" key={e._id} className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:gap-6 md:py-10">
          <div className="md:col-span-3">
            <p className="label">{e.period}</p>
            {e.current && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-accent">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" /> Current
              </p>
            )}
          </div>
          <div className="md:col-span-5">
            <h3 className="text-2xl font-medium tracking-tight md:text-3xl">{e.role}</h3>
            <p className="mt-1 text-paper-dim">
              {e.organisation}
              {e.location ? <span className="text-muted"> · {e.location}</span> : null}
            </p>
          </div>
          {!compact && (
            <div className="md:col-span-4">
              {e.summary && <p className="mb-3 text-paper-dim">{e.summary}</p>}
              {e.highlights.length > 0 && (
                <ul className="space-y-1.5 text-sm text-paper-dim">
                  {e.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span className="mt-2 h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {e.tools.length > 0 && (
                <p className="label mt-4 normal-case tracking-normal">{e.tools.join(" · ")}</p>
              )}
            </div>
          )}
          {compact && <span className="label hidden text-right md:col-span-4 md:block">{String(i + 1).padStart(2, "0")}</span>}
        </Reveal>
      ))}
    </ol>
  );
}
