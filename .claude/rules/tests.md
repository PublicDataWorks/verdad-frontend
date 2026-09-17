---
paths:
  - '**/__tests__/**'
  - 'src/setupTests.ts'
  - 'vite.config.ts'
---

# Tests

## Setup

Vitest, configured in the `test` block of `vite.config.ts`: `globals: true` (so `describe`/`it`/`expect` need
no import, though existing tests import them from `vitest` anyway), `environment: 'jsdom'`, and
`setupFiles: ['./src/setupTests.ts']`, which only imports `@testing-library/jest-dom/vitest` for the extra
matchers. Specs live in `__tests__/` folders next to the code and are named `*.test.ts(x)`; `@/` resolves via
`vite-tsconfig-paths`.

```bash
npm test               # vitest run - one pass, no watch
npm run test:watch     # watch mode
npm run test:coverage  # vitest run --coverage (istanbul, output in vitest-coverage/)
```

## Patterns to copy

- **RPC calls**: mock the module, not the network - `vi.mock('@/lib/supabase', () => ({ rpc: vi.fn(),
default: {} }))`, then `const mockedRpc = vi.mocked(rpc)`. `rpc()` returns a thenable that also has
  `.abortSignal()`, so a mock return value must provide both; `src/apis/__tests__/snippet.test.ts` has a
  small `rpcResult()` helper for that shape. Mock `@/lib/posthog` the same way when the api captures events.
  Assert on the call: `expect(mockedRpc).toHaveBeenCalledWith('get_snippets', {...})`.
- **Hooks that use the router**: `renderHook` with a `MemoryRouter` wrapper and `initialEntries` for the
  starting URL (`src/hooks/__tests__/useSnippetFilters.test.tsx`). Wrap state updates in `act()`. To assert
  on what a hook wrote to the URL, compose it with `useLocation()` in the hook under test.
- **Hooks that query**: wrap in a `QueryClientProvider` with retries off, and mock the `apis/` function
  rather than `rpc` so the hook's own behavior is what is under test.

Nothing may hit the network or a real Supabase project; there is no MSW setup, so mock at the module
boundary.

## Lint rules specific to tests

`__tests__/**` gets `plugin:testing-library/react` with `prefer-user-event`, `prefer-explicit-assert` and
`no-manual-cleanup` as errors, and `no-magic-numbers` off. So use `userEvent` over `fireEvent`, assert
explicitly (`expect(el).toBeInTheDocument()`, not a bare `getBy*` as the assertion), and do not call
`cleanup()` yourself. `import/no-extraneous-dependencies` allows devDependency imports only from
`**/__tests__/*`, `src/setupTests.ts`, `vite.config.ts`, `cypress.config.ts` and two paths that do not exist
yet (`src/mocks/**`, `src/testUtils.tsx`) - put shared test helpers in one of those, not in `src/utils/`.

Cypress is configured but `cypress/e2e/` does not exist - do not add specs there as a substitute for a unit
test. Never weaken, skip or delete a test to make a change pass; report it instead.
