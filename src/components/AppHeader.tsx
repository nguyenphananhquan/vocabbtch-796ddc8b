import { Link } from "@tanstack/react-router";
import { BookOpen, Plus, Shuffle } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Vocab</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            to="/"
            className="rounded-md px-2 py-1.5 hover:bg-accent"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md px-2 py-1.5 bg-accent font-medium" }}
          >
            List
          </Link>
          <Link
            to="/random"
            className="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent"
            activeProps={{
              className: "flex items-center gap-1 rounded-md px-2 py-1.5 bg-accent font-medium",
            }}
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Random</span>
          </Link>
          <Link
            to="/api-docs"
            className="rounded-md px-2 py-1.5 hover:bg-accent"
            activeProps={{ className: "rounded-md px-2 py-1.5 bg-accent font-medium" }}
          >
            API
          </Link>
          <Link
            to="/words/new"
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
