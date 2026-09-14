# VERDAD frontend

React 18 + Vite + TypeScript single-page app for journalists and researchers to review AI-flagged radio
snippets: search and filter them, listen, label, upvote, star, hide, and discuss in Liveblocks comment threads.

## How it fits together

- **Backend**: [publicDataWorks/verdad](https://github.com/publicDataWorks/verdad) (Python, Prefect on Fly.io)
  records radio, runs the detection pipeline and writes results to **Supabase**. Audio lives in Cloudflare R2.
- **Data access**: this app never talks to the Python backend for data. It calls Supabase `SECURITY DEFINER`
  RPCs from the browser with the anon key (`src/lib/supabase.ts`); their SQL lives in the backend repo under
  `supabase/`.
- **Auth**: Supabase Auth (email/password and Google OAuth) in `src/providers/auth.tsx`. Authenticated routes are
  wrapped by `src/layouts/AuthenticatedLayout.tsx`, which also authenticates Liveblocks against
  `${VITE_BASE_URL}/api/liveblocks-auth` (the only thing the backend HTTP server does for this app).
- **State**: TanStack Query for server data, filter state in the URL search params. Analytics: PostHog,
  optional.

## Commands

| Command               | What it does                                                         |
| --------------------- | -------------------------------------------------------------------- |
| `npm ci`              | Install (Node 22, see `.nvmrc`; npm only, there is one lockfile)     |
| `npm run dev`         | Vite dev server on http://0.0.0.0:5173, needs a `.env` (below)       |
| `npm run typecheck`   | `tsc --noEmit`. `vite build` does not type-check, so run this        |
| `npm run lint`        | ESLint, zero warnings allowed, then `npm run check:rules`            |
| `npm run check:rules` | Assert every `.claude/rules/` `paths` glob matches a tracked file    |
| `npm test`            | Vitest, run once (`npm run test:watch` to watch, `test:coverage`)    |
| `npm run build`       | Production build to `dist/` (needs the `VITE_*` vars)                |
| `npm run prettier`    | Format everything (the pre-commit hook already formats staged files) |
| `npm run cy:open`     | Cypress against a dev server on :3000; there are currently no specs  |

CI (`.github/workflows/ci.yml`) runs typecheck, lint, `check:rules`, test and build on every PR and push to `main`.

## Environment variables

All read via `import.meta.env` and typed in `src/vite-env.d.ts`. Copy `.env.production.example` to `.env` for
local development and fill in real values; never commit `.env`.

| Variable                 | Meaning                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                                                    |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (safe for the browser; RLS/RPCs enforce access)       |
| `VITE_BASE_URL`          | Backend HTTP server, used for Liveblocks auth and the broadcast API     |
| `VITE_AUTH_REDIRECT_URL` | Path to land on after OAuth login, e.g. `/search`                       |
| `VITE_AUDIO_BASE_URL`    | Public base URL of the R2 bucket; `${VITE_AUDIO_BASE_URL}/${file_path}` |
| `VITE_LIVEBLOCKS_PUBKEY` | Passed as a Docker build arg but not read by the app today              |
| `VITE_POSTHOG_KEY`       | PostHog project key; leave empty to disable analytics                   |
| `VITE_POSTHOG_HOST`      | PostHog host, defaults to `https://us.i.posthog.com`                    |

## Layout

`@/` maps to `src/` (tsconfig `paths` + `vite-tsconfig-paths`).

- Path-specific guidance lives in `.claude/rules/` (components, data layer, tests); each file loads only
  when you read files it matches.
- `src/apis/` - one function per RPC/HTTP call, typed with `rpc<T>()`; no React here
- `src/hooks/` - TanStack Query hooks and URL-state hooks wrapping `apis/`
- `src/components/` - feature components; `components/ui/` is shadcn/ui (`components.json`)
- `src/layouts/`, `src/pages/`, `src/providers/` (React contexts), `src/lib/` (clients: supabase, axios, posthog)
- `src/constants/` (routes, translations), `src/types/`, `src/utils/` (pure helpers, the easiest place to test)
- Tests live in `__tests__/` folders next to the code, named `*.test.ts(x)`

## Deploy

Push to `main` -> `.github/workflows/deploy.yml` -> `flyctl deploy` (app `verdad-frontend`, Dockerfile builds
with `VITE_*` as build args from GitHub secrets, nginx serves `dist/`). Every PR gets a preview app
`pr-<n>-verdad-frontend.fly.dev` from `fly-pr-preview.yml`, destroyed on close. Previews do not get the PostHog
build args.

## Lint policy

ESLint was unusable (1078 errors) so the config was brought down to what the code meets. Each relaxation below
is a candidate to ratchet back; re-enable one, fix the findings, remove the line here.

- Presets: `@typescript-eslint/all` -> `recommended-type-checked` + `stylistic-type-checked`;
  `react/all` -> `react/recommended` (+ `jsx-runtime`). airbnb, airbnb-typescript, prettier kept.
- `react/prop-types`, `react/require-default-props` off: TypeScript covers props.
- `import/extensions` off and `import/resolver: typescript` added: `@/` imports resolve without extensions.
- `import/prefer-default-export` off: named exports are the convention here.
- `no-nested-ternary` off: JSX conditionals; purely stylistic.
- `react/no-array-index-key` off: a dozen static lists use the index; re-enable after stable keys land.
- `@typescript-eslint/prefer-nullish-coalescing` off: `||` -> `??` changes behavior on `''`/`0`; needs a manual audit.
- `@typescript-eslint/no-throw-literal` off: supabase-js 2.39 throws a plain-object `PostgrestError`; re-enable
  after upgrading supabase-js or wrapping RPC errors in `Error`.
- `no-console` allows `warn`/`error`; `no-misused-promises` ignores JSX attributes (async event handlers);
  `react/jsx-handler-names` no longer checks inline arrows; `no-use-before-define` allows hoisted functions;
  `jsx-a11y/label-has-associated-control` accepts `htmlFor` alone; `react/no-unknown-property` ignores
  `cmdk-input-wrapper`; `no-unused-vars` ignores rest siblings and `_`-prefixed args. The a11y relaxations
  and the JSX rules that reject otherwise-fine markup are listed in `.claude/rules/components.md`.
- One inline disable: `jsx-a11y/heading-has-content` in `components/ui/card.tsx` (shadcn primitive).
- Do not add `eslint-disable` for `no-unsafe-*`. Type the RPC result with `rpc<T>()` instead.

## Gotchas

- No runtime env validation: a missing `VITE_SUPABASE_URL` fails deep inside `createClient` with an opaque error.
- RPC results are only as typed as the `T` you pass to `rpc<T>()`; nothing validates them, and `src/types/`
  has lagged the SQL. Generating Supabase types (`supabase gen types typescript`) is the intended follow-up.
- The bundle is one ~2.3 MB chunk; Vite warns on every build. `manualChunks` is the follow-up.
- `src/components/PrivateRoute.tsx` is not mounted anywhere; routes are guarded by `AuthenticatedLayout`.

## Rules for agents

- Before committing: `npm run typecheck && npm run lint && npm test`. CI runs the same plus `npm run build`.
- The pre-commit hook runs lint-staged (eslint --fix + prettier on staged files). Do not bypass it with
  `--no-verify`; if it fails, fix the code.
- Never weaken or delete a test to make it pass; report it instead. New logic in `utils/`, `hooks/`, `apis/`
  and `lib/` should come with a Vitest test.
- Never commit `.env*` files with real values or paste keys into code or docs.
- Prefer small, focused commits with imperative-mood messages. Do not mix reformatting with behavior changes.
