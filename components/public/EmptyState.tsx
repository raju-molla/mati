import Link from "next/link";

export function EmptyState({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-start gap-6 border border-dashed border-line px-8 py-16 md:items-center md:text-center">
      <span className="font-serif text-4xl italic text-paper/70">Coming soon</span>
      <p className="max-w-md text-paper-dim">{text}</p>
      {cta && (
        <Link href={cta.href} className="btn-ghost">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
