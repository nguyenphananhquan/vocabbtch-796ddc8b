## Goals

1. Add a sort mode on the list page (index) to sort vocabulary entries by **Node** (alphabetical), in addition to the current default (most recently added).
2. In the Add/Edit form, help the user **reuse existing nodes** instead of typing a new one each time — by suggesting matching nodes already in the database as they type.

## 1. Sort mode on the list page

In `src/routes/index.tsx`, add a small `Select` next to the search/class filter:

- Options:
  - **Newest first** (current default — by `date_added` desc)
  - **Oldest first** (`date_added` asc)
  - **Node A → Z**
  - **Node Z → A**
  - **Word A → Z**
  - **Word Z → A**

The list is already loaded into state, so sorting is done client-side on the `filtered` array using `localeCompare` for text fields. No DB changes needed.

State: `const [sortMode, setSortMode] = useState<"newest" | "oldest" | "node_asc" | "node_desc" | "word_asc" | "word_desc">("newest")`.

## 2. Node suggestions in the form (reuse existing nodes)

In `src/components/WordForm.tsx`, replace the plain `Textarea` for **Node** with an input that suggests existing nodes:

- On mount, fetch the distinct list of nodes already in the database (a lightweight query — `select node from vocabulary`, then deduplicate client-side; vocab size is small/personal).
- As the user types in the Node field, show a dropdown list of existing nodes whose text contains (case-insensitive) the current input. Limit to ~8 suggestions.
- Clicking a suggestion fills the Node field with that exact value (so the same node string is reused — no duplicates from typos/casing).
- The user can still freely type a brand-new node; suggestions are non-blocking hints.
- Also display a tiny helper line: "Tip: pick an existing node when possible to keep groups tight."

Implementation detail: build it as a small inline component using a `Textarea` + an absolutely-positioned suggestion list below it (shown only when focused and there are matches that are not exactly equal to the current value). No new dependency required — uses existing shadcn primitives.

Add a helper in `src/lib/vocab.ts`:
```ts
export async function listNodes(): Promise<string[]> { ... }
```
returning the deduplicated, sorted list of non-empty `node` values.

## Files touched

- `src/routes/index.tsx` — add sort `Select` + sorting logic.
- `src/lib/vocab.ts` — add `listNodes()` helper.
- `src/components/WordForm.tsx` — replace Node textarea with a suggesting variant; fetch existing nodes on mount.

## Out of scope (for later)

- Renaming a node across all its words (bulk rename) — can be added later if you want to clean up node groups.
- Grouping the list page by node — the new "Node A→Z" sort already gives you that effect visually.
