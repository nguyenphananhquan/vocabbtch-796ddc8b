import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { listWords, deleteWord, type Word } from "@/lib/vocab";
import { triggerCat } from "@/lib/cat-events";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/nodes/$node")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.node} — Nodes` },
      { name: "description", content: `Words tagged with ${params.node}.` },
    ],
  }),
  component: NodeDetailPage,
});

function NodeDetailPage() {
  const { node } = Route.useParams();
  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setWords(await listWords());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      triggerCat("sad_sleep");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string, w: string) {
    if (!confirm(`Delete "${w}"?`)) return;
    try {
      await deleteWord(id);
      toast.success("Deleted");
      setWords((prev) => prev?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  const filtered = (words ?? [])
    .filter((w) => w.node === node)
    .sort(
      (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
    );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/nodes">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-semibold truncate">{node}</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {words === null && !error && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {words && filtered.length === 0 && !error && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No words for this node.
          </div>
        )}

        {filtered.length > 0 && (
          <ul className="space-y-2">
            {filtered.map((w) => (
              <li
                key={w.id}
                data-cat-anchor
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to="/words/$id"
                    params={{ id: w.id }}
                    className="flex-1 min-w-0"
                    onMouseDown={(e) =>
                      triggerCat("walk_to", {
                        target: e.currentTarget.closest("li") as HTMLElement,
                      })
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{w.word}</span>
                      <Badge variant="secondary" className="text-xs">
                        {w.word_class}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {w.node}
                    </p>
                  </Link>
                  <div className="flex shrink-0 gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link to="/words/$id/edit" params={{ id: w.id }}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(w.id, w.word)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
