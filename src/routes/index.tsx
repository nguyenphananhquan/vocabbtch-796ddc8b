import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { listWords, deleteWord, WORD_CLASSES, type Word } from "@/lib/vocab";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Vocabulary" },
      { name: "description", content: "Personal vocabulary collection." },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<
    "newest" | "oldest" | "node_asc" | "node_desc" | "word_asc" | "word_desc"
  >("newest");

  async function load() {
    try {
      setError(null);
      setWords(await listWords());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
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
    .filter((w) => {
      if (classFilter !== "all" && w.word_class !== classFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          w.word.toLowerCase().includes(q) ||
          w.node.toLowerCase().includes(q) ||
          (w.example ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case "newest":
          return (
            new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
          );
        case "oldest":
          return (
            new Date(a.date_added).getTime() - new Date(b.date_added).getTime()
          );
        case "node_asc":
          return a.node.localeCompare(b.node);
        case "node_desc":
          return b.node.localeCompare(a.node);
        case "word_asc":
          return a.word.localeCompare(b.word);
        case "word_desc":
          return b.word.localeCompare(a.word);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search word, meaning, example…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {WORD_CLASSES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {words === null && !error && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {words && filtered.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-3 text-muted-foreground">
              {words.length === 0 ? "No words yet." : "No words match your filters."}
            </p>
            {words.length === 0 && (
              <Button asChild>
                <Link to="/words/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first word
                </Link>
              </Button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <ul className="space-y-2">
            {filtered.map((w) => (
              <li
                key={w.id}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to="/words/$id"
                    params={{ id: w.id }}
                    className="flex-1 min-w-0"
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
