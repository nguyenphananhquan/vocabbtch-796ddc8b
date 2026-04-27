import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createWord, updateWord, WORD_CLASSES, type Word } from "@/lib/vocab";

interface Props {
  initial?: Word;
}

export function WordForm({ initial }: Props) {
  const navigate = useNavigate();
  const [word, setWord] = useState(initial?.word ?? "");
  const [wordClass, setWordClass] = useState<string>(initial?.word_class ?? "noun");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [node, setNode] = useState(initial?.node ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [sourceNote, setSourceNote] = useState(initial?.source_note ?? "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!word.trim() || !node.trim()) {
      toast.error("Word and meaning (node) are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        word: word.trim(),
        word_class: wordClass,
        meaning: meaning.trim() || null,
        node: node.trim(),
        example: example.trim() || null,
        source_note: sourceNote.trim() || null,
      };
      if (initial) {
        await updateWord(initial.id, payload);
        toast.success("Word updated");
        navigate({ to: "/words/$id", params: { id: initial.id } });
      } else {
        const created = await createWord(payload);
        toast.success("Word added");
        navigate({ to: "/words/$id", params: { id: created.id } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="word">Word *</Label>
        <Input
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="e.g. ephemeral"
          autoFocus
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="word_class">Word class</Label>
        <Select value={wordClass} onValueChange={setWordClass}>
          <SelectTrigger id="word_class">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORD_CLASSES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="node">Node (meaning) *</Label>
        <Textarea
          id="node"
          value={node}
          onChange={(e) => setNode(e.target.value)}
          placeholder="What it means…"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="example">Example</Label>
        <Textarea
          id="example"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="A sentence using the word…"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source note</Label>
        <Input
          id="source"
          value={sourceNote}
          onChange={(e) => setSourceNote(e.target.value)}
          placeholder="Where you encountered it"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add word"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
