import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const jsonHeaders = {
  "Content-Type": "application/json",
  ...corsHeaders,
};

export function checkAuth(request: Request): Response | null {
  const expected = process.env.VOCAB_API_KEY;
  if (!expected) {
    return new Response(
      JSON.stringify({ error: "VOCAB_API_KEY not configured on server" }),
      { status: 500, headers: jsonHeaders },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }
  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export { supabaseAdmin };
