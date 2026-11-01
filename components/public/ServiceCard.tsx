import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceItem } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Icon } from "@/components/ui/Icon";

export function ServiceCard({ service, index, detailed }: { service: ServiceItem; index: number; detailed?: boolean }) {
  const href = service.ctaUrl || `/contact?service=${encodeURIComponent(service.title)}`;
  return (
    <article className="group grid gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-8">
      <div className="flex items-start justify-between md:col-span-1 md:block">
        <span className="label text-accent">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="md:col-span-5">
        <h3 className="text-3xl font-medium tracking-tight transition-colors duration-500 group-hover:text-accent md:text-5xl">
          {service.title}
        </h3>
        {service.price && <p className="label mt-4">{service.price}</p>}
      </div>
      <div className="md:col-span-4">
        {service.description && <p className="text-paper-dim">{service.description}</p>}
        {detailed && service.deliverables.length > 0 && (
          <ul className="mt-6 space-y-2 text-sm">
            {service.deliverables.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        )}
        {detailed && (
          <Link href={href} className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
            <span className="link-underline">{service.ctaLabel || "Start a project"}</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="hidden md:col-span-2 md:block">
        <div className="relative ml-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-[var(--radius-card)] bg-ink-2">
          {service.image?.url ? (
            <SmartImage
              media={service.image}
              fill
              sizes="140px"
              className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-paper-dim transition-colors group-hover:text-accent">
              <Icon name={service.iconName} className="size-10" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
