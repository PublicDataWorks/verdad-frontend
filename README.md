# VERDAD frontend

Web app for reviewing AI-flagged radio snippets produced by the [verdad](https://github.com/publicDataWorks/verdad)
pipeline: search, listen, label, and discuss. React 18 + Vite + TypeScript, data via Supabase RPC, deployed to Fly.io.

**Working on this repo? Read [AGENTS.md](./AGENTS.md)** for the architecture, commands, environment variables,
lint policy and gotchas. It is the single source of truth and this README stays short on purpose.

## Quick start

Requires Node 22 (`.nvmrc`) and npm.

```bash
npm ci
cp .env.production.example .env   # then fill in real values
npm run dev                       # http://0.0.0.0:5173
```

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint, zero warnings
npm test            # vitest run   (npm run test:watch, npm run test:coverage)
npm run build       # production build to dist/
npm run prettier    # format everything
npm run cy:open     # Cypress UI against a dev server on :3000 (no specs exist yet)
```

## Contributing

Husky installs a pre-commit hook on `npm ci` (`prepare` script) that runs lint-staged: ESLint with `--fix` and
Prettier on staged files. Prettier config is in `.prettierrc.json`; point your editor at it. CI runs typecheck,
lint, tests and build on every pull request.
