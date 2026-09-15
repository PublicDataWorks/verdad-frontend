@AGENTS.md

Claude-specific notes:

- Use `npm run typecheck`, `npm run lint` and `npm test` as your verification loop; all three run in under a
  minute and must stay green.
- When a change touches an RPC result shape, update its entry in `src/types/rpc.ts` (derived from the live
  function body, not the backend repo's SQL) and say so in the PR, since nothing validates it at runtime.
- After a migration changes the schema, run `npm run gen:types` (needs `SUPABASE_ACCESS_TOKEN`) and commit
  `src/types/database.ts` with the change.
