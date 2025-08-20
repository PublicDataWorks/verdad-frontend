# CLAUDE.md - Developer Guidelines for Verdad Frontend

## Build & Development Commands
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Run linter: `npm run lint`
- Format with prettier: `npm run prettier`
- Unit tests: `npm run test:unit`
- E2E tests: `npm run cy:open` (interactive) or `npm run cy:run` (headless)

## Code Style
- TypeScript with strict typing
- React functional components (no class components)
- Prettier for formatting (single quotes, no semicolons, 120 char width)
- File structure: components, hooks, providers, utils, apis, types
- Import order: React, external packages, internal components, hooks, utils
- Error handling: prefer try/catch with toast notifications for user feedback
- Component naming: PascalCase for components, camelCase for functions/hooks

## Libraries
- UI: TailwindCSS with shadcn/ui components
- State: React Context, React Query
- Auth: Supabase
- Routing: React Router
- Data fetching: Axios with React Query