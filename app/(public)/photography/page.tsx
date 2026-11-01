import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/public/PageHeader";
import { PhotographyGrid } from "@/components/public/PhotographyGrid";
import { EmptyState } from "@/components/public/EmptyState";
import { getPhotography, getSiteSettings } from "@/services/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Photography",
  description: "Photography, including wildlife work.",
  alternates: { canonical: "/photography" },
};

export default async function PhotographyPage() {
  const [photos, settings] = await Promise.all([getPhotography(), getSiteSettings()]);
  const ig = settings.social.instagram;
  return (
    <>
      <PageHeader eyebrow="Photography" title="Through" accent="the lens">
        {ig && (
          <a href={ig} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            {settings.social.instagramHandle || "Instagram"} <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
      </PageHeader>
      <section className="container-x pb-32">
        {photos.length ? (
          <PhotographyGrid photos={photos} />
        ) : (
          <EmptyState text="The photo gallery is being curated." cta={ig ? { href: ig, label: "Follow on Instagram" } : undefined} />
        )}
      </section>
    </>
  );
}
