import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({
  index,
  eyebrow,
  heading,
  intro,
  link,
}: {
  index?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  link?: { href: string; label: string };
}) {
  return (
    <Reveal className="mb-12 grid gap-6 border-t border-line pt-6 md:mb-16 md:grid-cols-12">
      <div className="flex items-center gap-3 md:col-span-3">
        {index && <span className="label text-accent">{index}</span>}
        {eyebrow && <span className="label">{eyebrow}</span>}
      </div>
      <div className="md:col-span-9">
        {heading && <h2 className="text-headline font-medium">{heading}</h2>}
        <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {intro ? <p className="max-w-xl text-lg text-paper-dim">{intro}</p> : <span />}
          {link && (
            <Link href={link.href} className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium">
              <span className="link-underline">{link.label}</span>
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  );
}
