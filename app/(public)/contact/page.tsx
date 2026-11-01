import type { Metadata } from "next";
import { PageHeader } from "@/components/public/PageHeader";
import { ContactForm } from "@/components/public/ContactForm";
import { getServices, getSiteSettings } from "@/services/content";
import { socialList } from "@/lib/utils/social";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project, discuss an opportunity or say hello.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const socials = socialList(settings.social);
  const cp = settings.contactPage;
  return (
    <>
      <PageHeader eyebrow="Contact" title={cp.heading || "Let's work"} accent={cp.heading ? undefined : "together"} intro={cp.intro} />
      <section className="container-x grid gap-16 pb-32 md:grid-cols-12">
        <aside className="space-y-10 md:col-span-3">
          {settings.availability && (
            <div>
              <p className="label mb-2">Availability</p>
              <p className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
                {settings.availability}
              </p>
            </div>
          )}
          {settings.location && (
            <div>
              <p className="label mb-2">Based in</p>
              <p>{settings.location}</p>
            </div>
          )}
          {settings.showEmailPublicly && settings.contactEmail && (
            <div>
              <p className="label mb-2">E-mail</p>
              <a href={`mailto:${settings.contactEmail}`} className="link-underline break-all">
                {settings.contactEmail}
              </a>
            </div>
          )}
          {socials.length > 0 && (
            <div>
              <p className="label mb-2">Elsewhere</p>
              <ul className="space-y-1">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {s.key === "instagram" && settings.social.instagramHandle ? settings.social.instagramHandle : s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <div className="md:col-span-8 md:col-start-5">
          <ContactForm
            services={services.map((s) => s.title)}
            budgetOptions={cp.budgetOptions}
            successMessage={cp.successMessage}
          />
        </div>
      </section>
    </>
  );
}
