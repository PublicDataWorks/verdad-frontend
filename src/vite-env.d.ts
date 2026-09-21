/// <reference types="vite/client" />

// Keep in sync with .env.production.example
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_BASE_URL: string
  readonly VITE_AUTH_REDIRECT_URL: string
  readonly VITE_AUDIO_BASE_URL: string
  readonly VITE_LIVEBLOCKS_PUBKEY: string
  readonly VITE_POSTHOG_KEY: string
  readonly VITE_POSTHOG_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
