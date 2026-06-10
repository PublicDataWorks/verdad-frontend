# 2026-06-10 Supabase Signup Run

## Execution Board

- Done: hardened email signup confirmation against single-use link scanners.
- Done: confirmed the production frontend bundle uses a Supabase publishable key accepted by the VERDAD project.
- Done: checked Fly app ownership/status for `verdad-frontend` under the `verdad` organization.
- Done: reviewed Supabase Auth logs showing recent `/signup` requests returning `200` and subsequent `/verify` failures with `One-time token not found`.
- Done: Supabase Confirm signup email template was updated by the user to the token-hash `/auth/confirm` link.
- Done: added fallback copy for legacy `/onboarding#error_code=otp_expired` redirects.

## Worklog

- Created branch `codex/fix-supabase-signup-keys` from detached HEAD before changes.
- Could not read `WORKFLOW.md`, execution board, blocker register, current-cycle worklog, or reference index because this checkout did not contain those files.
- Added `/auth/confirm` frontend route that consumes `token_hash` only after the user clicks the confirmation button.
- Kept successful confirmation redirect constrained to same-origin paths, defaulting to `/onboarding`.
- Validated the new component with targeted ESLint, production build, and browser render check.
- Added onboarding handling for `#error_code=otp_expired`, including URL-fragment cleanup and actions to sign up again or return to login.

## Blocker Register

- Production Fly deployment from a local build requires the public Vite build args that are normally supplied by GitHub Actions secrets. Do not deploy a local build without those args, because this app bakes them into the static bundle.

## Reference Index

- Supabase project: `dzujjhzgzguciwryzwlx`
- Fly app: `verdad-frontend`
- Supabase docs consulted through MCP: Production Checklist email link validity; Password-based Auth PKCE/token hash confirmation; JavaScript `verifyOtp`.
- Validation: `npx eslint src/components/AuthConfirmPage.tsx --ext ts,tsx --report-unused-disable-directives --max-warnings 0`; `npm run build`; browser render at `/auth/confirm?token_hash=dummy&type=email&next=...`; browser render at `/onboarding#error_code=otp_expired...` confirmed expired-link copy and URL-fragment cleanup.

## Run Receipt

Set the Supabase Auth "Confirm signup" email template link to the scanner-safe route:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
  Confirm email address
</a>
```

The previous default `{{ .ConfirmationURL }}` remains a single-use `/auth/v1/verify` link that email security scanners can consume before the user clicks it.

The template is now fixed in Supabase admin. After the frontend route is deployed, fresh signup emails should land on `/auth/confirm` first. Legacy emails can still redirect to `/onboarding#error_code=otp_expired`; the onboarding page now shows an explicit expired-link message for that case.
