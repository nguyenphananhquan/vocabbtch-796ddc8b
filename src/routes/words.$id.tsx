import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteWord, getWord, type Word } from "@/lib/vocab";
import { triggerCat } from "@/lib/cat-events";
import { toast } from "sonner";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightWord(text: string, word: string) {
  if (!word) return text;
  // Match the word and common inflections (plural / -ed / -ing / -s) as whole words, case-insensitive.
  const re = new RegExp(`\\b(${escapeRegex(word)}\\w*)\\b`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold not-italic">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export const Route = createFileRoute("/words/$id")({
  head: () => ({ meta: [{ title: "Word" }] }),
  component: WordDetailPage,
});

function WordDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getWord(id)
      .then((w) => {
        setWord(w);
        if (w) {
          // Let the article render, then ask the cat to look toward it.
          window.setTimeout(() => {
            triggerCat("look", { target: articleRef.current });
          }, 50);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  async function onDelete() {
    if (!word) return;
    if (!confirm(`Delete "${word.word}"?`)) return;
    try {
      await deleteWord(word.id);
      toast.success("Deleted");
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link to="/">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {word === undefined && !error && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {word === null && (
          <p className="text-sm text-muted-foreground">Word not found.</p>
        )}

        {word && (
          <article className="max-w-2xl space-y-5">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{word.word}</h1>
                <Badge variant="secondary">{word.word_class}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Added {new Date(word.date_added).toLocaleDateString()}
              </p>
            </header>

            {word.meaning && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Meaning
                </h2>
                <p className="mt-1 whitespace-pre-wrap">{word.meaning}</p>
              </section>
            )}

            <section>
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Node
              </h2>
              <p className="mt-1 whitespace-pre-wrap">{word.node}</p>
            </section>

            {word.example && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Example
                </h2>
                <p className="mt-1 whitespace-pre-wrap italic">
                  {highlightWord(word.example, word.word)}
                </p>
              </section>
            )}

            {word.source_note && (
              <section>
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Source
                </h2>
                <p className="mt-1 whitespace-pre-wrap">{word.source_note}</p>
              </section>
            )}

            <div className="flex gap-3 pt-3">
              <Button asChild>
                <Link to="/words/$id/edit" params={{ id: word.id }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
