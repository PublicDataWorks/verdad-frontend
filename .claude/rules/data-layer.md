---
paths:
  - 'src/apis/**'
  - 'src/hooks/**'
  - 'src/types/**'
  - 'src/lib/**'
---

# Data layer (apis, hooks, types, lib)

## Everything goes through `rpc<T>()`

There is no backend API for data: the browser calls Supabase `SECURITY DEFINER` RPCs with the anon key.
`rpc<T>(fn, args)` in `src/lib/supabase.ts` is a cast, not a validation - `T` is simply asserted onto
`PostgrestSingleResponse<T>`. So:

- One function per call in `src/apis/` (no React, no hooks there), each passing an explicit `T`.
- The interfaces behind `T` live in `src/types/` (`snippet.ts`, `trending.ts`) or next to the api function.
  Keep them matching the SQL: the source of truth is the **backend repo** `publicDataWorks/verdad` under
  `supabase/` (`supabase/database/sql/*.sql` plus `supabase/migrations/`). Read the function there before
  trusting a field; `src/types/snippet.ts` has lagged the SQL before, and a renamed column arrives as
  `undefined` rather than an error.
- `rpc()` returns a thenable that also exposes `.abortSignal(signal)`; pass TanStack Query's `signal`
  through for cancellable list queries (see `fetchSnippets`).
- Never add an `eslint-disable` for `@typescript-eslint/no-unsafe-assignment`/`-call`/`-member-access`.
  An unsafe-any complaint means the result is untyped - give `rpc<T>()` a real `T`.

## Hooks wrap apis, they do not call Supabase

`src/hooks/` holds the TanStack Query hooks. Query keys are built by factories, not inline strings:
`snippetKeys` in `src/hooks/useSnippets.tsx` (`all` / `lists(...)` / `detail(...)` / `related(...)`). Reuse
and extend those factories so invalidation in `useSnippetActions.ts` keeps working; a hand-written
`['snippets', ...]` array silently misses invalidation.

## Filter state lives in the URL

`useSnippetFilters.tsx` is the single source of truth for filters: it reads and writes `useSearchParams`,
arrays as comma-separated values, and only serializes non-empty values (so a cleared filter disappears from
the URL). Do not mirror filter state into React state or context - add the field to `SnippetFilters`, parse
it there, and let the URL stay shareable. Note the comment on `PoliticalSpectrum`: its values must match the
`CASE` branches in the backend `get_snippets`.

## Tests are required here

New or changed logic in `apis/`, `hooks/`, `utils/` and `lib/` comes with a Vitest test - these four are the
tested layers of the app. See `.claude/rules/tests.md` for the mocking patterns.
