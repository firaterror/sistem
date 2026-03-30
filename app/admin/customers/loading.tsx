export default function CustomersLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="h-7 w-40 rounded bg-muted/30 animate-pulse" />
      <div className="mt-2 h-4 w-72 rounded bg-muted/20 animate-pulse" />
      <div className="mt-6 flex gap-3">
        <div className="h-8 w-72 rounded-[var(--radius)] bg-muted/20 animate-pulse" />
        <div className="h-8 w-48 rounded-[var(--radius)] bg-muted/20 animate-pulse" />
      </div>
      <div className="mt-6 rounded-[var(--radius)] border border-border/60 bg-card/40">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/60 px-6 py-4"
          >
            <div className="h-9 w-9 rounded-full bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-muted/30 animate-pulse" />
              <div className="h-3 w-56 rounded bg-muted/20 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
