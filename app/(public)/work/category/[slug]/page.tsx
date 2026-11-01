import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/public/PageHeader";
import { CategoryTabs } from "@/components/public/CategoryTabs";
import { ProjectGrid } from "@/components/public/ProjectGrid";
import { ProjectCard } from "@/components/public/ProjectCard";
import { JsonLd } from "@/components/public/JsonLd";
import { getActiveCategories, getCategories, getPhotography, getPublishedProjects } from "@/services/content";
import { siteUrl } from "@/lib/defaults";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) return { title: "Not found" };
  return {
    title: cat.name,
    description: cat.description || `${cat.name} projects.`,
    alternates: { canonical: `/work/category/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [all, active, photos] = await Promise.all([getCategories(), getActiveCategories(), getPhotography({ limit: 1 })]);
  const cat = all.find((c) => c.slug === slug);
  if (!cat) notFound();
  const projects = await getPublishedProjects({ categorySlug: slug });
  const tabs = active.some((c) => c._id === cat._id) ? active : [...active, cat];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Work", item: `${siteUrl()}/work` },
            { "@type": "ListItem", position: 2, name: cat.name, item: `${siteUrl()}/work/category/${cat.slug}` },
          ],
        }}
      />
      <PageHeader eyebrow={`Work / ${cat.name}`} title={cat.name} intro={cat.description}>
        <CategoryTabs categories={tabs} active={cat.slug} showPhotography={photos.length > 0} />
      </PageHeader>
      <section className="container-x pb-32">
        {cat.layout === "masonry" && projects.length > 0 ? (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-12">
            {projects.map((p, i) => (
              <div key={p._id} className="break-inside-avoid">
                <ProjectCard project={p} index={i} size={i % 2 ? "compact" : "default"} />
              </div>
            ))}
          </div>
        ) : (
          <ProjectGrid projects={projects} emptyText={`${cat.name} projects are being prepared — check back soon.`} />
        )}
      </section>
    </>
  );
}
