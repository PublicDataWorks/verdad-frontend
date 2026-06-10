# 2026-06-10 Supabase Signup Run

## Execution Board

- Done: hardened email signup confirmation against single-use link scanners.
- Done: confirmed the production frontend bundle uses a Supabase publishable key accepted by the VERDAD project.
- Done: checked Fly app ownership/status for `verdad-frontend` under the `verdad` organization.
- Done: reviewed Supabase Auth logs showing recent `/signup` requests returning `200` and subsequent `/verify` failures with `One-time token not found`.

## Worklog

- Created branch `codex/fix-supabase-signup-keys` from detached HEAD before changes.
- Could not read `WORKFLOW.md`, execution board, blocker register, current-cycle worklog, or reference index because this checkout did not contain those files.
- Added `/auth/confirm` frontend route that consumes `token_hash` only after the user clicks the confirmation button.
- Kept successful confirmation redirect constrained to same-origin paths, defaulting to `/onboarding`.
- Validated the new component with targeted ESLint, production build, and browser render check.

## Blocker Register

- Hosted Supabase email template config is not stored in this repo and no focused template update tool is available in this session. The frontend route is ready, but production will not use it until the Confirm signup email template is updated in Supabase.

## Reference Index

- Supabase project: `dzujjhzgzguciwryzwlx`
- Fly app: `verdad-frontend`
- Supabase docs consulted through MCP: Production Checklist email link validity; Password-based Auth PKCE/token hash confirmation; JavaScript `verifyOtp`.
- Validation: `npx eslint src/components/AuthConfirmPage.tsx --ext ts,tsx --report-unused-disable-directives --max-warnings 0`; `npm run build`; browser render at `/auth/confirm?token_hash=dummy&type=email&next=...`.

## Run Receipt

Set the Supabase Auth "Confirm signup" email template link to the scanner-safe route:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
  Confirm email address
</a>
```

The previous default `{{ .ConfirmationURL }}` remains a single-use `/auth/v1/verify` link that email security scanners can consume before the user clicks it.
