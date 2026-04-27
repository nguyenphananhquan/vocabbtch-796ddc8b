import { createFileRoute } from "@tanstack/react-router";
import {
  checkAuth,
  jsonResponse,
  preflight,
  supabaseAdmin,
} from "@/server/vocab-api";

export const Route = createFileRoute("/api/public/vocab/random")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),

      GET: async ({ request }) => {
        const denied = checkAuth(request);
        if (denied) return denied;
        const { data: ids, error } = await supabaseAdmin
          .from("vocabulary")
          .select("id");
        if (error) return jsonResponse({ error: error.message }, 500);
        if (!ids || ids.length === 0) {
          return jsonResponse({ word: null });
        }
        const pick = ids[Math.floor(Math.random() * ids.length)];
        const { data, error: e2 } = await supabaseAdmin
          .from("vocabulary")
          .select("*")
          .eq("id", pick.id)
          .single();
        if (e2) return jsonResponse({ error: e2.message }, 500);
        return jsonResponse({ word: data });
      },
    },
  },
});
