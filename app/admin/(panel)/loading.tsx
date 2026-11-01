export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="h-4 w-80 animate-pulse rounded bg-zinc-200" />
      <div className="a-card mt-6 space-y-3 p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}
