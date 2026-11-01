import type { SkillGroupItem } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";

const PROFICIENCY_LABEL = { familiar: "Familiar", proficient: "Proficient", advanced: "Advanced" } as const;

export function SkillGroups({ groups }: { groups: SkillGroupItem[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3">
      {groups.map((g, gi) => (
        <Reveal key={g.category._id} delay={gi * 0.06} className="bg-ink p-6 md:p-8">
          <div className="mb-6 flex items-baseline justify-between">
            <h3 className="font-serif text-3xl italic">{g.category.name}</h3>
            <span className="label">{String(g.skills.length).padStart(2, "0")}</span>
          </div>
          {g.category.description && <p className="mb-6 text-sm text-paper-dim">{g.category.description}</p>}
          <ul className="divide-y divide-line border-t border-line">
            {g.skills.map((s) => (
              <li key={s._id} className="flex items-center justify-between gap-3 py-3">
                <span className="flex items-center gap-3">
                  {s.icon?.url && (
                    <span className="relative size-5 shrink-0">
                      <SmartImage media={s.icon} fill sizes="20px" alt="" className="object-contain" />
                    </span>
                  )}
                  {s.name}
                </span>
                {s.proficiency && <span className="label">{PROFICIENCY_LABEL[s.proficiency]}</span>}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}
