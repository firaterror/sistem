export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      {/* Title skeleton */}
      <div className="h-7 w-48 rounded bg-muted/40" />
      <div className="mt-2 h-4 w-72 rounded bg-muted/30" />

      {/* Stat cards skeleton */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-5"
          >
            <div className="h-3 w-24 rounded bg-muted/30" />
            <div className="mt-3 h-7 w-16 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="mt-8 rounded-[var(--radius)] border border-border/60 bg-card/40 p-6">
        <div className="h-5 w-32 rounded bg-muted/40" />
        <div className="mt-3 h-4 w-64 rounded bg-muted/30" />
      </div>
    </div>
  );
}
