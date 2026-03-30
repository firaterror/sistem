export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="h-7 w-40 rounded bg-muted/30 animate-pulse" />
      <div className="mt-2 h-4 w-64 rounded bg-muted/20 animate-pulse" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius)] border border-border/60 bg-card/40 animate-pulse"
          />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-[var(--radius)] border border-border/60 bg-card/40 animate-pulse" />
    </div>
  );
}
