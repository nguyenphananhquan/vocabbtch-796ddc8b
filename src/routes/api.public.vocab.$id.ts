import { createFileRoute } from "@tanstack/react-router";
import {
  checkAuth,
  jsonResponse,
  preflight,
  supabaseAdmin,
} from "@/server/vocab-api";

export const Route = createFileRoute("/api/public/vocab/$id")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request, params }) => {
        const denied = checkAuth(request);
        if (denied) return denied;
        const { data, error } = await supabaseAdmin
          .from("vocabulary")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();
        if (error) return jsonResponse({ error: error.message }, 500);
        if (!data) return jsonResponse({ error: "Not found" }, 404);
        return jsonResponse({ word: data });
      },

      PATCH: async ({ request, params }) => {
        const denied = checkAuth(request);
        if (denied) return denied;
        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON" }, 400);
        }
        const update: Record<string, unknown> = {};
        for (const k of ["word", "word_class", "node", "example", "source_note"]) {
          if (k in body) update[k] = body[k];
        }
        if (Object.keys(update).length === 0) {
          return jsonResponse({ error: "No fields to update" }, 400);
        }
        const { data, error } = await supabaseAdmin
          .from("vocabulary")
          .update(update)
          .eq("id", params.id)
          .select()
          .single();
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ word: data });
      },

      DELETE: async ({ request, params }) => {
        const denied = checkAuth(request);
        if (denied) return denied;
        const { error } = await supabaseAdmin
          .from("vocabulary")
          .delete()
          .eq("id", params.id);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
      },
    },
  },
});
