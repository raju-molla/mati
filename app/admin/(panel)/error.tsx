"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="a-card mx-auto mt-10 max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto size-8 text-amber-500" aria-hidden="true" />
      <h1 className="mt-4 text-lg font-semibold">This page couldn&apos;t load</h1>
      <p className="mt-2 text-sm text-zinc-500">
        This is usually a temporary connection problem with the database. Please try again. If it keeps happening, check
        that MONGODB_URI is set correctly in your hosting settings.
      </p>
      <button type="button" onClick={reset} className="a-btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
