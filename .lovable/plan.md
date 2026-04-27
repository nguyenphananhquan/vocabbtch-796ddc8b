## Goal
Get your public vocab API working with proper auth, and add a docs page showing how to call it.

## 1. Add the `VOCAB_API_KEY` secret
- Use Lovable Cloud's secret manager to add `VOCAB_API_KEY` (runtime secret, available as `process.env.VOCAB_API_KEY` in server routes).
- I'll trigger the secret-input prompt — you paste in a long random string (recommend `openssl rand -hex 32`, e.g. `7f3a...` 64 hex chars).
- No code change needed for the auth logic — `src/server/vocab-api.ts` already reads it correctly.

## 2. Auth format (already enforced by the code)
- Header: `Authorization: Bearer <VOCAB_API_KEY>`
- `x-api-key` and query-string keys are **not** accepted. If you'd like those supported too, say the word and I'll extend `checkAuth`.

## 3. New API docs route: `/api-docs`
Create `src/routes/api-docs.tsx` with:
- Base URL: `https://vocabbtch.lovable.app`
- Endpoint reference:
  - `GET  /api/public/vocab/` — list all words
  - `POST /api/public/vocab/` — create a word (`word`, `node` required; optional `word_class`, `example`, `source_note`)
  - `GET  /api/public/vocab/random` — random word
  - `GET  /api/public/vocab/:id` — single word (plus PATCH/DELETE if present in `$id.ts`)
- Auth section explaining the `Authorization: Bearer` header.
- Copy-pasteable `curl` examples for each endpoint.
- A JS `fetch` example.
- Note that the key is a server secret — never embed it in client-side code shipped to browsers.

## 4. Link to docs
- Add an "API" link in `AppHeader.tsx` pointing to `/api-docs`.

## 5. Verify
After you set the secret, I'll run a `curl` against `/api/public/vocab/` with the key to confirm it returns `200` instead of `401`.

## Out of scope (ask if you want them)
- Supporting `x-api-key` or query-param auth
- Per-user API keys / multiple keys
- Rate limiting