import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { JsonLd } from "@/components/public/JsonLd";
import { getSiteSettings } from "@/services/content";
import { siteUrl } from "@/lib/defaults";
import { socialList } from "@/lib/utils/social";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const socials = socialList(settings.social);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.siteName,
    alternateName: settings.brandName || undefined,
    url: siteUrl(),
    jobTitle: settings.tagline || undefined,
    address: settings.location ? { "@type": "PostalAddress", addressLocality: settings.location } : undefined,
    sameAs: socials.map((s) => s.href),
  };

  return (
    <>
      <JsonLd data={person} />
      <Navbar
        brandName={settings.brandName || settings.siteName}
        siteName={settings.siteName}
        logoUrl={settings.logo?.url}
        socials={socials.map((s) => ({ label: s.label, href: s.href }))}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
