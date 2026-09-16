@AGENTS.md

Claude-specific notes:

- Use `npm run typecheck`, `npm run lint` and `npm test` as your verification loop; all three run in under a
  minute and must stay green.
- When a change touches an RPC result shape, update the `rpc<T>()` type argument in `src/apis/` and the matching
  interface in `src/types/`, and say so in the PR since nothing validates it at runtime.
