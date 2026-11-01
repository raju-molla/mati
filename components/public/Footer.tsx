import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteSettingsData } from "@/types";
import { socialList } from "@/lib/utils/social";

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const socials = socialList(settings.social);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line pt-20 pb-10">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label mb-6">Get in touch</p>
            <Link href="/contact" className="group inline-block">
              <span className="text-headline font-medium">
                Let&apos;s make <span className="font-serif font-normal italic">something</span>
                <br />
                worth watching
                <ArrowUpRight
                  className="ml-3 inline size-[0.7em] align-baseline text-accent transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
            {settings.showEmailPublicly && settings.contactEmail && (
              <p className="mt-6">
                <a href={`mailto:${settings.contactEmail}`} className="link-underline text-paper-dim">
                  {settings.contactEmail}
                </a>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-5">
            <div>
              <p className="label mb-4">Explore</p>
              <ul className="space-y-2 text-sm text-paper-dim">
                {[
                  ["/work", "Work"],
                  ["/photography", "Photography"],
                  ["/about", "About"],
                  ["/services", "Services"],
                  ["/experience", "Experience"],
                  ["/contact", "Contact"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="link-underline hover:text-paper">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {socials.length > 0 && (
              <div>
                <p className="label mb-4">Follow</p>
                <ul className="space-y-2 text-sm text-paper-dim">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-paper">
                        {s.key === "instagram" && settings.social.instagramHandle
                          ? settings.social.instagramHandle
                          : s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings.siteName}
            {settings.location ? ` · ${settings.location}` : ""}
          </p>
          {settings.footerText && <p className="max-w-xl">{settings.footerText}</p>}
          <p className="font-serif text-base italic text-paper-dim">{settings.brandName}</p>
        </div>
      </div>
    </footer>
  );
}
