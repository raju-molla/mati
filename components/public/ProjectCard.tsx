import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectItem } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils/cn";
import { PlaceholderVisual } from "./PlaceholderVisual";

export function ProjectCard({
  project,
  index,
  size = "default",
  priority,
}: {
  project: ProjectItem;
  index: number;
  size?: "default" | "large" | "compact";
  priority?: boolean;
}) {
  const image = project.thumbnail ?? project.coverImage;
  const aspect = size === "large" ? "aspect-[4/3] md:aspect-[16/10]" : size === "compact" ? "aspect-[4/3]" : "aspect-[4/5]";
  return (
    <article className="group relative">
      <Link href={`/work/${project.slug}`} className="block" aria-label={`${project.title} — view project`}>
        <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] bg-ink-2", aspect)}>
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-cinema)] group-hover:scale-[1.035]">
            {image?.url ? (
              <SmartImage
                media={image}
                fill
                priority={priority}
                sizes={size === "large" ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                className="object-cover"
              />
            ) : (
              <PlaceholderVisual title={project.title} label={project.category?.name} index={index} />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {project.featured && (
            <span className="label absolute top-4 left-4 rounded-full bg-ink/70 px-3 py-1 text-paper backdrop-blur">
              Featured
            </span>
          )}
          <span className="absolute right-4 bottom-4 inline-flex size-11 translate-y-3 items-center justify-center rounded-full bg-paper text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium tracking-tight md:text-2xl">{project.title}</h3>
            {project.shortDescription && (
              <p className="mt-1.5 line-clamp-2 max-w-md text-sm text-paper-dim">{project.shortDescription}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {project.category && <p className="label">{project.category.name}</p>}
            {project.year && <p className="label mt-1 text-paper/50">{project.year}</p>}
          </div>
        </div>
      </Link>
    </article>
  );
}
