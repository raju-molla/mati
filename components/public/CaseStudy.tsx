import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import type { ProjectItem, ProjectSection } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { paragraphs } from "@/lib/utils/media";
import { PlaceholderVisual } from "./PlaceholderVisual";
import { ProjectGallery } from "./ProjectGallery";
import { VideoPlayer } from "./VideoPlayer";

function Prose({ text }: { text: string }) {
  return (
    <div className="prose-editorial">
      {paragraphs(text).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

function Block({ label, index, children }: { label: string; index: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-6 border-t border-line pt-6 md:grid-cols-12">
      <div className="flex gap-3 md:col-span-3">
        <span className="label text-accent">{index}</span>
        <h2 className="label">{label}</h2>
      </div>
      <div className="md:col-span-8 md:col-start-5">{children}</div>
    </Reveal>
  );
}

function FlexibleSection({ section, title }: { section: ProjectSection; title: string }) {
  switch (section.type) {
    case "quote":
      return (
        <Reveal className="mx-auto max-w-4xl py-6 text-center">
          <blockquote className="font-serif text-3xl leading-tight italic md:text-5xl">“{section.body}”</blockquote>
          {section.heading && <p className="label mt-6">{section.heading}</p>}
        </Reveal>
      );
    case "image":
      return section.media[0] ? (
        <Reveal>
          <figure>
            <SmartImage media={section.media[0]} sizes="100vw" className="h-auto w-full rounded-[var(--radius-card)]" />
            {(section.heading || section.media[0].caption) && (
              <figcaption className="label mt-3">{section.heading || section.media[0].caption}</figcaption>
            )}
          </figure>
        </Reveal>
      ) : null;
    case "gallery":
      return (
        <div>
          {section.heading && <h3 className="mb-6 text-2xl font-medium">{section.heading}</h3>}
          <ProjectGallery images={section.media} />
        </div>
      );
    case "video":
      return (
        <div>
          {section.heading && <h3 className="mb-6 text-2xl font-medium">{section.heading}</h3>}
          <VideoPlayer embedUrl={section.embedUrl} media={section.media.find((m) => m.kind === "video")} title={section.heading || title} />
        </div>
      );
    default:
      return (
        <Reveal className="grid gap-6 md:grid-cols-12">
          {section.heading && <h3 className="text-2xl font-medium md:col-span-4">{section.heading}</h3>}
          <div className={section.heading ? "md:col-span-8" : "md:col-span-8 md:col-start-5"}>
            <Prose text={section.body} />
          </div>
        </Reveal>
      );
  }
}

export function CaseStudy({ project, next }: { project: ProjectItem; next?: ProjectItem | null }) {
  const cover = project.coverImage ?? project.thumbnail;
  const meta = [
    ["Category", project.category?.name],
    ["Year", project.year],
    ["Role", project.role],
    ["Client", project.client],
    ["Duration", project.duration],
  ].filter(([, v]) => v) as [string, string][];

  const stack = [...new Set([...project.technologies, ...project.tools])];
  let n = 0;
  const idx = () => String(++n).padStart(2, "0");

  return (
    <article>
      {/* Hero */}
      <header className="container-x pt-32 md:pt-44">
        <nav aria-label="Breadcrumb" className="label mb-10 flex gap-2">
          <Link href="/work" className="hover:text-paper">
            Work
          </Link>
          {project.category && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/work/category/${project.category.slug}`} className="hover:text-paper">
                {project.category.name}
              </Link>
            </>
          )}
        </nav>
        <h1 className="text-headline max-w-6xl font-medium md:text-[clamp(3rem,7vw,7.5rem)]">{project.title}</h1>
        {project.subtitle && <p className="mt-6 max-w-3xl font-serif text-2xl italic text-paper-dim md:text-3xl">{project.subtitle}</p>}
        {meta.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-6 md:grid-cols-5">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd className="mt-2 text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="container-x mt-12 md:mt-16">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-ink-2">
          {cover?.url ? (
            <SmartImage media={cover} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <PlaceholderVisual title={project.title} label={project.category?.name} />
          )}
        </div>
      </div>

      <div className="container-x mt-24 space-y-24 md:mt-32 md:space-y-32">
        {(project.fullDescription || project.shortDescription) && (
          <Block label="Overview" index={idx()}>
            <p className="mb-8 text-2xl leading-snug md:text-3xl">{project.shortDescription}</p>
            {project.fullDescription && <Prose text={project.fullDescription} />}
          </Block>
        )}

        {project.challenge && (
          <Block label="Challenge" index={idx()}>
            <Prose text={project.challenge} />
          </Block>
        )}

        {project.process && (
          <Block label="Process" index={idx()}>
            <Prose text={project.process} />
          </Block>
        )}

        {(stack.length > 0 || project.projectURL || project.githubURL) && (
          <Block label="Tools" index={idx()}>
            {stack.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {stack.map((t) => (
                  <li key={t} className="rounded-full border border-line-strong px-4 py-1.5 text-sm">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {(project.projectURL || project.githubURL) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.projectURL && (
                  <a href={project.projectURL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    View project <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                )}
                {project.githubURL && (
                  <a href={project.githubURL} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    <Github className="size-4" aria-hidden="true" /> Source code
                  </a>
                )}
              </div>
            )}
          </Block>
        )}

        {(project.embeddedVideo || project.videos.length > 0) && (
          <section aria-label="Video" className="space-y-10">
            {project.embeddedVideo && <VideoPlayer embedUrl={project.embeddedVideo} title={project.title} />}
            {project.videos.map((v) => (
              <VideoPlayer key={v._id} media={v} title={v.caption || project.title} />
            ))}
          </section>
        )}

        {project.gallery.length > 0 && (
          <section aria-label="Gallery">
            <ProjectGallery images={project.gallery} layout={project.category?.layout ?? "grid"} />
          </section>
        )}

        {project.sections.map((s, i) => (
          <FlexibleSection key={s._id ?? i} section={s} title={project.title} />
        ))}

        {project.outcome && (
          <Block label="Outcome" index={idx()}>
            <Prose text={project.outcome} />
          </Block>
        )}
      </div>

      {next && (
        <Link href={`/work/${next.slug}`} className="group mt-32 block border-t border-line">
          <div className="container-x flex flex-col gap-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
            <div>
              <p className="label mb-4">Next project</p>
              <p className="text-headline font-medium transition-colors duration-500 group-hover:text-accent">{next.title}</p>
            </div>
            <ArrowUpRight
              className="size-14 text-paper-dim transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-accent"
              aria-hidden="true"
            />
          </div>
        </Link>
      )}
    </article>
  );
}
