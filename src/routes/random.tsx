import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRandomWord, type Word } from "@/lib/vocab";
import { Shuffle } from "lucide-react";

export const Route = createFileRoute("/random")({
  head: () => ({ meta: [{ title: "Random word" }] }),
  component: RandomPage,
});

function RandomPage() {
  const [word, setWord] = useState<Word | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const draw = useCallback(() => {
    setWord(undefined);
    setError(null);
    getRandomWord()
      .then(setWord)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  useEffect(() => draw(), [draw]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto flex flex-col items-center px-4 py-10">
        <p className="mb-4 text-sm text-muted-foreground">
          Preview of what your future Android notification will show.
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {word === undefined && !error && (
          <p className="text-sm text-muted-foreground">Picking…</p>
        )}

        {word === null && (
          <p className="text-sm text-muted-foreground">No words yet — add some first.</p>
        )}

        {word && (
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{word.word}</h1>
              <Badge variant="secondary">{word.word_class}</Badge>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-base">{word.node}</p>
            <div className="mt-5 flex gap-3">
              <Button asChild variant="outline">
                <Link to="/words/$id" params={{ id: word.id }}>See full entry</Link>
              </Button>
            </div>
          </div>
        )}

        <Button className="mt-6" onClick={draw}>
          <Shuffle className="mr-2 h-4 w-4" /> Draw another
        </Button>
      </main>
    </div>
  );
}
