## Issues

**1. Node detail page renders nothing**

In TanStack Router's flat file routing, `nodes.$node.tsx` is treated as a child of `nodes.tsx`. The parent (`nodes.tsx`) doesn't render `<Outlet />`, so when navigating to `/nodes/:node` only the parent's content tries to render and the child is silently dropped.

Fix: rename `src/routes/nodes.$node.tsx` → `src/routes/nodes_.$node.tsx`. The trailing underscore opts the route out of nesting under `nodes`, so it becomes a standalone page (same pattern already used by `words_.$id.edit.tsx`). No other code changes required — the link `to="/nodes/$node"` keeps working.

**2. Sorting on Nodes view**

Add a small sort toggle at the top of `src/routes/nodes.tsx` with two options:
- Alphabetical (A→Z) — current default
- Word count (high → low)

Implementation:
- Local `sort` state (`"name" | "count"`), default `"name"`.
- Two small buttons (or a `ToggleGroup`) above the list, styled with existing tokens.
- Sort the memoized `nodes` array based on the current state.

No other behavior or layout changes.

## Files

- Rename: `src/routes/nodes.$node.tsx` → `src/routes/nodes_.$node.tsx` (content unchanged)
- Edit: `src/routes/nodes.tsx` (add sort state + toggle UI + conditional sort)
