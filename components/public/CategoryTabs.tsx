import Link from "next/link";
import type { CategoryItem } from "@/types";
import { cn } from "@/lib/utils/cn";

export function CategoryTabs({
  categories,
  active,
  showPhotography,
}: {
  categories: CategoryItem[];
  active?: string;
  showPhotography?: boolean;
}) {
  const tabs = [
    { href: "/work", label: "All", key: "" },
    ...categories.map((c) => ({ href: `/work/category/${c.slug}`, label: c.name, key: c.slug })),
    ...(showPhotography ? [{ href: "/photography", label: "Photo gallery", key: "__photo" }] : []),
  ];
  return (
    <nav aria-label="Filter work by category" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {tabs.map((t) => {
          const isActive = (active ?? "") === t.key;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "border-paper bg-paper text-ink"
                    : "border-line-strong text-paper-dim hover:border-paper hover:text-paper"
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
