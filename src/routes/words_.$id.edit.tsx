import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { WordForm } from "@/components/WordForm";
import { getWord, type Word } from "@/lib/vocab";

export const Route = createFileRoute("/words_/$id/edit")({
  head: () => ({ meta: [{ title: "Edit word" }] }),
  component: EditWordPage,
});

function EditWordPage() {
  const { id } = Route.useParams();
  const [word, setWord] = useState<Word | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWord(id)
      .then(setWord)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-5 text-2xl font-semibold">Edit word</h1>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {word === undefined && !error && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {word === null && <p className="text-sm text-muted-foreground">Not found.</p>}
        {word && <WordForm initial={word} />}
      </main>
    </div>
  );
}
