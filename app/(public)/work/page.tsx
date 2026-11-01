import type { Metadata } from "next";
import { PageHeader } from "@/components/public/PageHeader";
import { CategoryTabs } from "@/components/public/CategoryTabs";
import { ProjectGrid } from "@/components/public/ProjectGrid";
import { getActiveCategories, getPhotography, getPublishedProjects } from "@/services/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects across game development, video editing, cinematography, photography and technical work.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const [projects, categories, photos] = await Promise.all([
    getPublishedProjects(),
    getActiveCategories(),
    getPhotography({ limit: 1 }),
  ]);
  return (
    <>
      <PageHeader
        eyebrow={`Index — ${String(projects.length).padStart(2, "0")} projects`}
        title="Selected"
        accent="work"
        intro="Games, films, photographs and hands-on technical projects."
      >
        <CategoryTabs categories={categories} showPhotography={photos.length > 0} />
      </PageHeader>
      <section className="container-x pb-32">
        <ProjectGrid projects={projects} />
      </section>
    </>
  );
}
