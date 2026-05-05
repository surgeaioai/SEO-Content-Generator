"use client";

import type { SerpResult } from "@/types";

type HeadingsListProps = {
  serpResults: SerpResult[];
};

function collectHeadings(serpResults: SerpResult[], level: "h2" | "h3") {
  const counts = new Map<string, number>();

  for (const row of serpResults) {
    const list = row.headings?.[level] ?? [];
    for (const text of list) {
      const key = text.trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([text, count]) => ({ text, count }));
}

export function HeadingsList({ serpResults }: HeadingsListProps) {
  const h2s = collectHeadings(serpResults, "h2");
  const h3s = collectHeadings(serpResults, "h3");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Common H2 themes</h3>
        <ul className="space-y-2 text-sm">
          {h2s.length === 0 ? (
            <li className="text-muted-foreground">No H2 headings captured.</li>
          ) : (
            h2s.map((item) => (
              <li
                key={item.text}
                className="flex items-start justify-between gap-3 rounded-md border bg-card/60 px-3 py-2"
              >
                <span className="text-pretty">{item.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ×{item.count}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Common H3 themes</h3>
        <ul className="space-y-2 text-sm">
          {h3s.length === 0 ? (
            <li className="text-muted-foreground">No H3 headings captured.</li>
          ) : (
            h3s.map((item) => (
              <li
                key={item.text}
                className="flex items-start justify-between gap-3 rounded-md border bg-card/60 px-3 py-2"
              >
                <span className="text-pretty">{item.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ×{item.count}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
