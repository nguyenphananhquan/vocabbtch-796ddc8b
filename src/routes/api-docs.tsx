import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocsPage,
  head: () => ({
    meta: [
      { title: "API Docs — Vocab" },
      {
        name: "description",
        content: "Reference and examples for the Vocab public REST API.",
      },
    ],
  }),
});

const BASE_URL = "https://vocabbtch.lovable.app";

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Endpoint({
  method,
  path,
  children,
}: {
  method: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 font-mono text-sm">
        <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">
          {method}
        </span>
        <span>{path}</span>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Vocab API</h1>
          <p className="text-muted-foreground">
            REST endpoints to read and manage your vocabulary list.
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium">Heads up: opening the URL in a browser tab will return <code className="rounded bg-muted px-1">401 Unauthorized</code>.</p>
          <p className="mt-1 text-muted-foreground">
            Browsers can't attach an <code className="rounded bg-muted px-1">Authorization</code> header to address-bar navigation. Use the tester below, <code>curl</code>, or <code>fetch</code> with the bearer token. Also note the trailing slash on <code className="rounded bg-muted px-1">/api/public/vocab/</code> — routes are matched exactly.
          </p>
        </div>

        <ApiTester />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Base URL</h2>
          <Code>{BASE_URL}</Code>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Authentication</h2>
          <p className="text-sm text-muted-foreground">
            All endpoints require a bearer token in the{" "}
            <code className="rounded bg-muted px-1">Authorization</code> header.
            The token is the value of the{" "}
            <code className="rounded bg-muted px-1">VOCAB_API_KEY</code> server
            secret. Other auth methods (<code>x-api-key</code>, query params)
            are not accepted.
          </p>
          <Code>{`Authorization: Bearer YOUR_VOCAB_API_KEY`}</Code>
          <p className="text-xs text-muted-foreground">
            Never embed this key in code that ships to browsers. Use it from
            servers, scripts, or trusted backends only.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Endpoints</h2>

          <Endpoint method="GET" path="/api/public/vocab/">
            <p>List all vocabulary entries, newest first.</p>
            <Code>{`curl ${BASE_URL}/api/public/vocab/ \\
  -H "Authorization: Bearer YOUR_VOCAB_API_KEY"`}</Code>
          </Endpoint>

          <Endpoint method="POST" path="/api/public/vocab/">
            <p>
              Create a word. Required: <code>word</code>, <code>node</code>.
              Optional: <code>word_class</code>, <code>example</code>,{" "}
              <code>source_note</code>.
            </p>
            <Code>{`curl -X POST ${BASE_URL}/api/public/vocab/ \\
  -H "Authorization: Bearer YOUR_VOCAB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "word": "ephemeral",
    "node": "lasting briefly",
    "word_class": "adjective",
    "example": "An ephemeral trend.",
    "source_note": "podcast"
  }'`}</Code>
          </Endpoint>

          <Endpoint method="GET" path="/api/public/vocab/random">
            <p>Return one random word.</p>
            <Code>{`curl ${BASE_URL}/api/public/vocab/random \\
  -H "Authorization: Bearer YOUR_VOCAB_API_KEY"`}</Code>
          </Endpoint>

          <Endpoint method="GET" path="/api/public/vocab/:id">
            <p>Fetch a single word by ID.</p>
            <Code>{`curl ${BASE_URL}/api/public/vocab/THE_ID \\
  -H "Authorization: Bearer YOUR_VOCAB_API_KEY"`}</Code>
          </Endpoint>

          <Endpoint method="PATCH" path="/api/public/vocab/:id">
            <p>Update any subset of fields.</p>
            <Code>{`curl -X PATCH ${BASE_URL}/api/public/vocab/THE_ID \\
  -H "Authorization: Bearer YOUR_VOCAB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "example": "Updated example sentence." }'`}</Code>
          </Endpoint>

          <Endpoint method="DELETE" path="/api/public/vocab/:id">
            <p>Delete a word.</p>
            <Code>{`curl -X DELETE ${BASE_URL}/api/public/vocab/THE_ID \\
  -H "Authorization: Bearer YOUR_VOCAB_API_KEY"`}</Code>
          </Endpoint>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">JavaScript example</h2>
          <Code>{`const res = await fetch("${BASE_URL}/api/public/vocab/", {
  headers: {
    Authorization: \`Bearer \${process.env.VOCAB_API_KEY}\`,
  },
});
const { words } = await res.json();
console.log(words);`}</Code>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Responses</h2>
          <p className="text-sm text-muted-foreground">
            Successful responses are JSON. Errors return{" "}
            <code className="rounded bg-muted px-1">
              {`{ "error": "..." }`}
            </code>{" "}
            with an appropriate status:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <code>401</code> — missing or wrong bearer token
            </li>
            <li>
              <code>400</code> — invalid JSON or missing required fields
            </li>
            <li>
              <code>404</code> — word not found
            </li>
            <li>
              <code>500</code> — server / database error
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
