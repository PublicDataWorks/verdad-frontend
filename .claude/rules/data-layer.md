---
paths:
  - 'src/apis/**'
  - 'src/hooks/**'
  - 'src/types/**'
  - 'src/lib/**'
---

# Data layer (apis, hooks, types, lib)

## Everything goes through `timedRpc()`

There is no backend API for data: the browser calls Supabase `SECURITY DEFINER` RPCs with the anon key.
`timedRpc(fn, args, { abortSignal })` in `src/lib/timedRpc.ts` wraps `rpc(fn, args)` from
`src/lib/supabase.ts`, reports duration and errors to PostHog and throws the Postgrest error. So:

- One function per call in `src/apis/` (no React, no hooks there). Do not pass a type argument: `fn` and
  `args` are checked against the generated `src/types/database.ts`, and the result type comes from the
  `RpcReturns` map in `src/types/rpc.ts`.
- `RpcReturns` is a declaration, not a validation. Each entry is read off the live function body
  (`select pg_get_functiondef(...)`); the backend repo `publicDataWorks/verdad` (`supabase/migrations/`) is
  the next best source, but its `supabase/database/sql/` has drifted. A renamed column arrives as
  `undefined` rather than an error.
- After a migration changes a signature, regenerate `src/types/database.ts` with `npm run gen:types`
  (needs `SUPABASE_ACCESS_TOKEN`); do not hand-edit it except as a stopgap.
- Pass TanStack Query's `signal` as `abortSignal` for cancellable list queries (see `fetchSnippets`).
- Never add an `eslint-disable` for `@typescript-eslint/no-unsafe-assignment`/`-call`/`-member-access`.
  An unsafe-any complaint means a result is untyped - add its shape to `RpcReturns`.

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
