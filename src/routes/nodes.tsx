import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { listWords, type Word } from "@/lib/vocab";
import { triggerCat } from "@/lib/cat-events";

export const Route = createFileRoute("/nodes")({
  head: () => ({
    meta: [
      { title: "Nodes — My Vocabulary" },
      { name: "description", content: "Browse vocabulary grouped by node." },
    ],
  }),
  component: NodesPage,
});

function NodesPage() {
  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "count">("name");

  useEffect(() => {
    (async () => {
      try {
        setWords(await listWords());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
        triggerCat("sad_sleep");
      }
    })();
  }, []);

  const nodes = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of words ?? []) {
      const n = w.node?.trim();
      if (!n) continue;
      map.set(n, (map.get(n) ?? 0) + 1);
    }
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    if (sort === "count") {
      arr.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    } else {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [words, sort]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold">Nodes</h1>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {words === null && !error && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {words && nodes.length === 0 && !error && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No nodes yet.
          </div>
        )}

        {nodes.length > 0 && (
          <ul className="space-y-2">
            {nodes.map((n) => (
              <li
                key={n.name}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4"
              >
                <span className="font-medium truncate">{n.name}</span>
                <Link
                  to="/nodes/$node"
                  params={{ node: n.name }}
                  className="shrink-0 rounded-md bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
                  aria-label={`View ${n.count} words tagged ${n.name}`}
                >
                  {n.count}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
