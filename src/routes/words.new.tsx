import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { WordForm } from "@/components/WordForm";

export const Route = createFileRoute("/words/new")({
  head: () => ({
    meta: [{ title: "Add word" }],
  }),
  component: NewWordPage,
});

function NewWordPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-5 text-2xl font-semibold">Add word</h1>
        <WordForm />
      </main>
    </div>
  );
}
