"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-x flex min-h-[70svh] flex-col justify-center pt-32 pb-20">
      <p className="label mb-6">Something went wrong</p>
      <h1 className="text-headline max-w-3xl font-medium">
        The reel <span className="font-serif font-normal italic">jammed.</span>
      </h1>
      <p className="mt-6 max-w-lg text-paper-dim">This page couldn&apos;t load right now. Please try again in a moment.</p>
      <div className="mt-10 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Go home
        </Link>
      </div>
    </section>
  );
}
