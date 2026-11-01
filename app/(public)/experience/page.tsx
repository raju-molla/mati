import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/public/PageHeader";
import { ExperienceTimeline } from "@/components/public/ExperienceTimeline";
import { EmptyState } from "@/components/public/EmptyState";
import { getExperience, getSiteSettings } from "@/services/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience across video editing, social media, cinematography and operations.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const [items, settings] = await Promise.all([getExperience(), getSiteSettings()]);
  return (
    <>
      <PageHeader eyebrow="Experience" title="Where I've" accent="worked">
        {settings.cvFile?.url && (
          <a href={settings.cvFile.url} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <Download className="size-4" aria-hidden="true" /> {settings.cvLabel || "Download CV"}
          </a>
        )}
      </PageHeader>
      <section className="container-x pb-32">
        {items.length ? <ExperienceTimeline items={items} /> : <EmptyState text="Experience is being updated." />}
      </section>
    </>
  );
}
