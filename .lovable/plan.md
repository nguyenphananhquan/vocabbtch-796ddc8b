
# Vocabulary Learning App — Plan

A responsive web app (works on laptop and phone browser) for collecting and reviewing vocabulary, plus a public REST API so a native Android app you build later can sync the same data and drive the lockscreen notifications and homescreen floating box.

## Scope

**In scope (built now):**
- Vocabulary database with full CRUD
- Dashboard page (laptop-friendly) for managing words
- Mobile-friendly input page (works in phone browser)
- Word browser / list view with search and filters
- Word detail view showing all metadata
- "Random word" view (manually triggered, mimics what the notification will show)
- Public sync API for the future Android app

**Out of scope (requires native Android — build later, outside Lovable):**
- Lockscreen notifications every 3 hours
- Homescreen floating overlay box
- Background scheduler

The web app gives you the data layer and a nice input experience today. The Android app you build later just calls the sync API.

## Pages

1. **Home / Dashboard (`/`)** — list of all words with search, filter by word class, sort by date. Inline edit + delete. Big "Add word" button. Works on both laptop and phone, with a denser table on desktop and a stacked card layout on mobile.
2. **Add / Edit word (`/words/new`, `/words/$id/edit`)** — form with all fields below.
3. **Word detail (`/words/$id`)** — read-only full view of one word.
4. **Random (`/random`)** — picks a random word from the DB and shows it; refresh button to draw another. This is what the future Android notification will surface.

## Vocabulary fields

- **Word** (required, text)
- **Word class** (dropdown: noun, verb, adjective, adverb, phrase, idiom, other)
- **Node** — the meaning (required, multi-line text)
- **Example** (optional, multi-line text)
- **Source note** (optional, short text — where you encountered it)
- **Date added** (auto-set on creation, displayed and sortable)

## Sync API for future Android app

Public REST endpoints under `/api/public/vocab/`:
- `GET /api/public/vocab` — list all words (for full sync)
- `GET /api/public/vocab/random` — return one randomly selected word (the Android app calls this every 3 hours from its own scheduler)
- `GET /api/public/vocab/:id` — fetch one word
- `POST /api/public/vocab` — create (so the Android app can also add words)
- `PATCH /api/public/vocab/:id` — update
- `DELETE /api/public/vocab/:id` — delete

Protected by a single shared API key (a secret you set once and paste into the Android app). Single-user, no login screen on the web app itself — keep the URL private as you confirmed.

## How the Android app (future) will use this

You (or another tool) will build a small native Android app that:
1. Runs a `WorkManager` job every 3 hours.
2. Calls `GET /api/public/vocab/random` with the API key.
3. Posts an Android notification showing **word + node** on the lockscreen.
4. On notification tap, opens the app and displays the full metadata (fetched via `GET /api/public/vocab/:id`).
5. Uses `SYSTEM_ALERT_WINDOW` permission to draw the floating overlay box on the homescreen if the screen turns on without the notification being tapped.

Lovable will not build that Android app, but the API is designed to be exactly what it needs.

## Technical notes

- TanStack Start web app with Lovable Cloud (Postgres) for storage.
- Single `vocabulary` table: `id`, `word`, `word_class`, `node`, `example`, `source_note`, `date_added`.
- No auth on the web UI (single-user, private URL). Sync API protected by a shared bearer token stored as a server secret.
- Mobile-first responsive layout using Tailwind; the dashboard list collapses to cards under `md`.
- Random selection done in SQL (`ORDER BY random() LIMIT 1`) so it's cheap and stateless.
- API key will be added as a secret after you approve this plan.
