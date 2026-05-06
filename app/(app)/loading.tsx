export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-muted/60" />
        <div className="h-7 w-56 animate-pulse rounded bg-muted/60" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border bg-card/40 p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-muted/60" />
            <div className="h-8 w-32 animate-pulse rounded bg-muted/60" />
            <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>

      <div className="h-64 animate-pulse rounded-xl border border-border bg-card/40" />
    </div>
  );
}
