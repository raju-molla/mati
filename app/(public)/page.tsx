import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/public/Hero";
import { SectionHeading } from "@/components/public/SectionHeading";
import { ProjectGrid } from "@/components/public/ProjectGrid";
import { ProjectCard } from "@/components/public/ProjectCard";
import { PhotographyGrid } from "@/components/public/PhotographyGrid";
import { ServiceCard } from "@/components/public/ServiceCard";
import { ExperienceTimeline } from "@/components/public/ExperienceTimeline";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import {
  getAbout,
  getExperience,
  getHomepage,
  getPhotography,
  getPublishedProjects,
  getServices,
  getSiteSettings,
} from "@/services/content";
import { paragraphs } from "@/lib/utils/media";
import type { HomepageSectionConfig } from "@/types";

export const revalidate = 3600;

export default async function HomePage() {
  const [home, settings] = await Promise.all([getHomepage(), getSiteSettings()]);
  const visible = home.sections.filter((s) => s.visible);
  const want = (k: HomepageSectionConfig["key"]) => visible.some((s) => s.key === k);

  const [flagged, about, photos, services, technical, experience] = await Promise.all([
    want("featuredWork") && home.featuredProjects.length === 0
      ? getPublishedProjects({ featured: true, limit: 6 })
      : Promise.resolve([]),
    want("disciplines") ? getAbout() : Promise.resolve(null),
    want("photography") ? getPhotography({ featuredOnly: true, limit: 9 }) : Promise.resolve([]),
    want("services") ? getServices() : Promise.resolve([]),
    want("technical") && home.technicalCategorySlug
      ? getPublishedProjects({ categorySlug: home.technicalCategorySlug, limit: 3 })
      : Promise.resolve([]),
    want("experience") ? getExperience() : Promise.resolve([]),
  ]);
  const featured = home.featuredProjects.length ? home.featuredProjects : flagged;

  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  const render = (s: HomepageSectionConfig) => {
    switch (s.key) {
      case "featuredWork":
        if (!featured.length) return null;
        return (
          <section key={s.key} className="container-x py-24 md:py-36">
            <SectionHeading index={num()} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} link={{ href: "/work", label: "View all work" }} />
            <ProjectGrid projects={featured} />
          </section>
        );

      case "disciplines": {
        if (!about || (!about.previewText && !about.focusAreas.length)) return null;
        return (
          <section key={s.key} className="container-x py-24 md:py-36">
            <SectionHeading index={num()} eyebrow={s.eyebrow} heading={s.heading} />
            <div className="grid gap-12 md:grid-cols-12">
              <Reveal className="md:col-span-7">
                {paragraphs(about.previewText).map((p, i) => (
                  <p key={i} className="mb-6 text-2xl leading-snug md:text-4xl md:leading-[1.15]">
                    {p}
                  </p>
                ))}
                <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                  <span className="link-underline">More about me</span>
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Reveal>
              <div className="md:col-span-4 md:col-start-9">
                {about.portrait?.url && (
                  <Reveal className="relative mb-10 aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-ink-2">
                    <SmartImage media={about.portrait} fill sizes="(min-width:768px) 30vw, 100vw" className="object-cover" />
                  </Reveal>
                )}
                {about.focusAreas.length > 0 && (
                  <ul className="border-t border-line">
                    {about.focusAreas.map((f, i) => (
                      <li key={f} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
                        <span className="text-lg">{f}</span>
                        <span className="label">{String(i + 1).padStart(2, "0")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        );
      }

      case "photography":
        if (!photos.length) return null;
        return (
          <section key={s.key} className="container-x py-24 md:py-36">
            <SectionHeading
              index={num()}
              eyebrow={s.eyebrow}
              heading={s.heading}
              intro={s.intro}
              link={{ href: "/photography", label: settings.social.instagramHandle ? `See more · ${settings.social.instagramHandle}` : "See the full gallery" }}
            />
            <PhotographyGrid photos={photos} showFilter={false} />
          </section>
        );

      case "services":
        if (!services.length) return null;
        return (
          <section key={s.key} className="container-x py-24 md:py-36">
            <SectionHeading index={num()} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} link={{ href: "/services", label: "All services" }} />
            <div className="border-b border-line">
              {services.map((sv, i) => (
                <Reveal key={sv._id}>
                  <Link href="/services" className="block">
                    <ServiceCard service={sv} index={i} />
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        );

      case "technical":
        if (!technical.length) return null;
        return (
          <section key={s.key} className="container-x py-24 md:py-36">
            <SectionHeading
              index={num()}
              eyebrow={s.eyebrow}
              heading={s.heading}
              intro={s.intro}
              link={{ href: `/work/category/${home.technicalCategorySlug}`, label: "All technical projects" }}
            />
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">
              {technical.map((p, i) => (
                <Reveal key={p._id} delay={i * 0.08}>
                  <ProjectCard project={p} index={i} size="compact" />
                </Reveal>
              ))}
            </div>
          </section>
        );

      case "experience":
        if (!experience.length) return null;
        return (
          <section key={s.key} className="container-x py-24 md:py-36">
            <SectionHeading index={num()} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} link={{ href: "/experience", label: "Full experience" }} />
            <ExperienceTimeline items={experience.slice(0, 4)} compact />
          </section>
        );

      case "cta":
        return (
          <section key={s.key} className="grain relative overflow-hidden border-t border-line bg-ink-2 py-28 md:py-40">
            <div className="container-x">
              <Reveal className="max-w-5xl">
                {s.eyebrow && <p className="label mb-8">{s.eyebrow}</p>}
                <h2 className="text-headline font-medium">{s.heading || "Have a project in mind?"}</h2>
                {s.intro && <p className="mt-8 max-w-xl text-lg text-paper-dim">{s.intro}</p>}
                <div className="mt-12 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary">
                    Start a project <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                  {settings.cvFile?.url && (
                    <a href={settings.cvFile.url} className="btn-ghost" target="_blank" rel="noopener noreferrer">
                      {settings.cvLabel || "Download CV"}
                    </a>
                  )}
                </div>
              </Reveal>
            </div>
          </section>
        );
    }
  };

  return (
    <>
      <Hero hero={home.hero} location={settings.location} />
      {visible.map(render)}
    </>
  );
}
