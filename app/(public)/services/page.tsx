import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/public/PageHeader";
import { ServiceCard } from "@/components/public/ServiceCard";
import { EmptyState } from "@/components/public/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { getServices } from "@/services/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Services",
  description: "Video editing, photography, cinematography and social media content.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="How I can"
        accent="help"
        intro="Available for freelance projects, creative collaborations and roles in content, production and technical support."
      />
      <section className="container-x pb-24">
        {services.length ? (
          <div className="border-b border-line">
            {services.map((s, i) => (
              <Reveal key={s._id}>
                <ServiceCard service={s} index={i} detailed />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState text="Service details are being updated." cta={{ href: "/contact", label: "Get in touch" }} />
        )}
      </section>
      <section className="container-x pb-32">
        <Reveal className="flex flex-col items-start justify-between gap-8 rounded-[var(--radius-card)] border border-line p-8 md:flex-row md:items-center md:p-12">
          <p className="text-3xl font-medium tracking-tight md:text-4xl">
            Have a project <span className="font-serif font-normal italic">in mind?</span>
          </p>
          <Link href="/contact" className="btn-primary">
            Start a project <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
