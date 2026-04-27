import { createFileRoute } from "@tanstack/react-router";
import {
  checkAuth,
  jsonResponse,
  preflight,
  supabaseAdmin,
} from "@/server/vocab-api";

export const Route = createFileRoute("/api/public/vocab/")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const denied = checkAuth(request);
        if (denied) return denied;
        const { data, error } = await supabaseAdmin
          .from("vocabulary")
          .select("*")
          .order("date_added", { ascending: false });
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ words: data ?? [] });
      },

      POST: async ({ request }) => {
        const denied = checkAuth(request);
        if (denied) return denied;
        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON" }, 400);
        }
        const word = typeof body.word === "string" ? body.word.trim() : "";
        const node = typeof body.node === "string" ? body.node.trim() : "";
        if (!word || !node) {
          return jsonResponse({ error: "word and node are required" }, 400);
        }
        const insert = {
          word,
          node,
          word_class:
            typeof body.word_class === "string" ? body.word_class : "other",
          example: typeof body.example === "string" ? body.example : null,
          source_note:
            typeof body.source_note === "string" ? body.source_note : null,
        };
        const { data, error } = await supabaseAdmin
          .from("vocabulary")
          .insert(insert)
          .select()
          .single();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ word: data }, 201);
      },
    },
  },
});
