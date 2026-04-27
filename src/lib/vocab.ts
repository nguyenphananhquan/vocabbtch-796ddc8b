import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Word = Tables<"vocabulary">;
export type WordInsert = TablesInsert<"vocabulary">;
export type WordUpdate = TablesUpdate<"vocabulary">;

export const WORD_CLASSES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "idiom",
  "other",
] as const;

export async function listWords(): Promise<Word[]> {
  const { data, error } = await supabase
    .from("vocabulary")
    .select("*")
    .order("date_added", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getWord(id: string): Promise<Word | null> {
  const { data, error } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createWord(input: WordInsert): Promise<Word> {
  const { data, error } = await supabase
    .from("vocabulary")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWord(id: string, input: WordUpdate): Promise<Word> {
  const { data, error } = await supabase
    .from("vocabulary")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWord(id: string): Promise<void> {
  const { error } = await supabase.from("vocabulary").delete().eq("id", id);
  if (error) throw error;
}

export async function listNodes(): Promise<string[]> {
  const { data, error } = await supabase.from("vocabulary").select("node");
  if (error) throw error;
  const set = new Set<string>();
  for (const r of data ?? []) {
    const v = (r as { node: string | null }).node?.trim();
    if (v) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function getRandomWord(): Promise<Word | null> {
  // Fetch all ids then pick one client-side (simple, fine for personal vocab size).
  const { data, error } = await supabase.from("vocabulary").select("id");
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const pick = data[Math.floor(Math.random() * data.length)];
  return getWord(pick.id);
}
