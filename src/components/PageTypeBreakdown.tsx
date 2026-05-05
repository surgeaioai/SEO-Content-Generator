"use client";

type PageTypeBreakdownProps = {
  breakdown: Record<string, number>;
};

export function PageTypeBreakdown({ breakdown }: PageTypeBreakdownProps) {
  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);

  if (!total) {
    return (
      <p className="text-sm text-muted-foreground">
        Page type data will appear after classification finishes.
      </p>
    );
  }

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(([type, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={type} className="rounded-lg border bg-card/60 p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="truncate pr-2">{type}</span>
              <span className="shrink-0 text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {count} result{count === 1 ? "" : "s"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
