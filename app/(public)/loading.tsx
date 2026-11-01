export default function Loading() {
  return (
    <div className="container-x pt-32 pb-20 md:pt-44" aria-busy="true" aria-label="Loading">
      <div className="h-3 w-32 animate-pulse rounded bg-ink-3" />
      <div className="mt-8 h-16 w-3/4 animate-pulse rounded bg-ink-3 md:h-28" />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[var(--radius-card)] bg-ink-2" />
        ))}
      </div>
    </div>
  );
}
