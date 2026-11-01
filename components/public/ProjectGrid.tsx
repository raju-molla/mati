import type { ProjectItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "./EmptyState";

/**
 * Editorial grid: every third card spans wider so the layout has rhythm
 * instead of a uniform card wall.
 */
export function ProjectGrid({ projects, emptyText }: { projects: ProjectItem[]; emptyText?: string }) {
  if (!projects.length) return <EmptyState text={emptyText ?? "New work is on its way."} />;
  return (
    <div className="grid gap-x-6 gap-y-16 md:grid-cols-12 md:gap-y-24">
      {projects.map((p, i) => {
        const pattern = i % 3;
        const span =
          pattern === 0 ? "md:col-span-7" : pattern === 1 ? "md:col-span-5 md:mt-32" : "md:col-span-8 md:col-start-3";
        return (
          <Reveal key={p._id} className={span} delay={(i % 2) * 0.08}>
            <ProjectCard project={p} index={i} size={pattern === 2 ? "large" : "default"} priority={i < 2} />
          </Reveal>
        );
      })}
    </div>
  );
}
