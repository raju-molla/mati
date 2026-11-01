import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/public/CaseStudy";
import { JsonLd } from "@/components/public/JsonLd";
import { getAllPublishedSlugs, getNextProject, getProjectBySlug, getSiteSettings } from "@/services/content";
import { siteUrl } from "@/lib/defaults";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllPublishedSlugs()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: "Project not found", robots: { index: false } };
  const title = p.seo.title || p.title;
  const description = p.seo.description || p.shortDescription || p.subtitle || undefined;
  const og = p.seo.ogImage ?? p.coverImage ?? p.thumbnail;
  return {
    title,
    description,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/work/${p.slug}`,
      images: og?.url ? [{ url: og.url, width: og.width, height: og.height, alt: og.alt || p.title }] : undefined,
    },
    twitter: { card: og?.url ? "summary_large_image" : "summary", title, description, images: og?.url ? [og.url] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const [next, settings] = await Promise.all([getNextProject(project), getSiteSettings()]);
  const url = `${siteUrl()}/work/${project.slug}`;
  const image = (project.coverImage ?? project.thumbnail)?.url;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            headline: project.subtitle || project.title,
            description: project.shortDescription || undefined,
            url,
            image,
            dateCreated: project.year || undefined,
            genre: project.category?.name,
            keywords: [...project.technologies, ...project.tools].join(", ") || undefined,
            creator: { "@type": "Person", name: settings.siteName, url: siteUrl() },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Work", item: `${siteUrl()}/work` },
              ...(project.category
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: project.category.name,
                      item: `${siteUrl()}/work/category/${project.category.slug}`,
                    },
                  ]
                : []),
              { "@type": "ListItem", position: project.category ? 3 : 2, name: project.title, item: url },
            ],
          },
        ]}
      />
      <CaseStudy project={project} next={next} />
    </>
  );
}
