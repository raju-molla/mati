import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink p-6 text-paper md:p-12">
      <p className="label">Error 404 · Scene missing</p>
      <div>
        <p className="text-display font-semibold">404</p>
        <p className="mt-6 max-w-lg font-serif text-3xl italic text-paper-dim">
          This shot didn&apos;t make the final cut.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
        </Link>
        <Link href="/work" className="btn-ghost">
          Browse work
        </Link>
      </div>
    </main>
  );
}
