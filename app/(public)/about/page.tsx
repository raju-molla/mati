import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { PageHeader } from "@/components/public/PageHeader";
import { SkillGroups } from "@/components/public/SkillGroups";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal } from "@/components/ui/Reveal";
import { getAbout, getEducation, getSiteSettings, getSkillGroups } from "@/services/content";
import { paragraphs } from "@/lib/utils/media";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return {
    title: about.seo.title || "About",
    description: about.seo.description || about.previewText || undefined,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [about, education, skills, settings] = await Promise.all([
    getAbout(),
    getEducation(),
    getSkillGroups(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHeader eyebrow={about.eyebrow || "About"} title={about.headline || settings.siteName} />

      <section className="container-x grid gap-12 pb-24 md:grid-cols-12 md:pb-36">
        <div className="md:col-span-5">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-ink-2 md:sticky md:top-28">
            {about.portrait?.url ? (
              <SmartImage media={about.portrait} fill priority sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
            ) : (
              <div className="grain flex h-full items-end bg-gradient-to-br from-ink-3 to-ink p-6">
                <span className="font-serif text-6xl italic text-paper/80">{settings.brandName}</span>
              </div>
            )}
          </Reveal>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Reveal className="prose-editorial">
            {paragraphs(about.intro).map((p, i) => (
              <p key={i} className={i === 0 ? "!text-2xl !leading-snug !text-paper md:!text-3xl" : undefined}>
                {p}
              </p>
            ))}
          </Reveal>

          {about.focusAreas.length > 0 && (
            <Reveal className="mt-14">
              <h2 className="label mb-4">What I do</h2>
              <ul className="border-t border-line">
                {about.focusAreas.map((f, i) => (
                  <li key={f} className="flex justify-between gap-4 border-b border-line py-4">
                    <span>{f}</span>
                    <span className="label">{String(i + 1).padStart(2, "0")}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {about.openTo.length > 0 && (
            <Reveal className="mt-14">
              <h2 className="label mb-4">Open to</h2>
              <ul className="flex flex-wrap gap-2">
                {about.openTo.map((o) => (
                  <li key={o} className="rounded-full border border-line-strong px-4 py-1.5 text-sm">
                    {o}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <div className="mt-14 flex flex-wrap gap-3">
            {settings.cvFile?.url && (
              <a href={settings.cvFile.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Download className="size-4" aria-hidden="true" /> {settings.cvLabel || "Download CV"}
              </a>
            )}
            <Link href="/contact" className="btn-ghost">
              Get in touch <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {education.length > 0 && (
        <section className="container-x pb-24 md:pb-36" aria-labelledby="education-heading">
          <div className="mb-10 flex items-baseline justify-between border-t border-line pt-6">
            <h2 id="education-heading" className="label">
              Education
            </h2>
          </div>
          <ol>
            {education.map((e) => (
              <Reveal as="li" key={e._id} className="grid gap-4 border-b border-line py-8 md:grid-cols-12">
                <p className="label md:col-span-3">{e.period}</p>
                <div className="md:col-span-5">
                  <h3 className="text-2xl font-medium tracking-tight">{e.qualification}</h3>
                  <p className="mt-1 text-paper-dim">
                    {e.institution}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <div className="md:col-span-4">
                  {e.grade && <p className="font-serif text-2xl italic text-accent">{e.grade}</p>}
                  {e.details.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-paper-dim">
                      {e.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {skills.length > 0 && (
        <section className="container-x pb-32" aria-labelledby="skills-heading">
          <div className="mb-10 border-t border-line pt-6">
            <h2 id="skills-heading" className="label">
              Skills &amp; tools
            </h2>
          </div>
          <SkillGroups groups={skills} />
        </section>
      )}
    </>
  );
}
