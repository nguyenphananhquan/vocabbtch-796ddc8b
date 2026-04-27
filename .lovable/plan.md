## What's actually happening

Hitting `/api/public/vocab` in the browser address bar can never return data — browsers can't attach an `Authorization: Bearer` header to a URL-bar navigation. The `401 Unauthorized` you see is the **correct, secure response**. The API is working.

To verify the key works, you need a request that includes the header. There are two common ways:
1. Use `curl` / Postman from your machine.
2. Use the in-app docs page to send a test request (we'll add this).

## Proposed changes

### 1. Add a "Try it" tester to the API docs page (`src/routes/api-docs.tsx`)
- Input field for the API key (stored in component state only, never persisted).
- A button that calls `GET /api/public/vocab/` with the bearer header and shows the JSON response (or error) below.
- Helpful hint text: "Browser address-bar requests can't send headers — that's why opening `/api/public/vocab` directly returns Unauthorized."

### 2. Tighten the docs copy
- Add a callout at the top explaining that visiting the endpoint in a browser tab will always return 401.
- Note the **trailing slash** on `/api/public/vocab/` (TanStack file routes are exact).

### 3. (Optional) Allow `?key=` query param as an additional auth method
Right now only `Authorization: Bearer` is accepted. If you want the URL bar to "just work" for quick checks, I can extend `checkAuth()` in `src/server/vocab-api.ts` to also accept `?key=YOUR_KEY`. This is **less secure** (keys end up in browser history and server logs) so I'd only recommend it for personal/dev use.

I'll skip this unless you say yes.

## Files touched
- `src/routes/api-docs.tsx` — add tester UI + callout
- `src/server/vocab-api.ts` — only if you opt into the `?key=` query param

## Verification
After changes, on the docs page paste your `VOCAB_API_KEY`, click "Test request", and confirm a `200` with your words list.
