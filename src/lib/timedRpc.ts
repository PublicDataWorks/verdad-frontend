import { capture, captureException } from '@/lib/posthog'
import { rpc } from '@/lib/supabase'

/** Successful calls slower than this are reported with status 'warning'. */
export const SLOW_THRESHOLD_MS = 20_000

/** PostgreSQL SQLSTATE for `query_canceled`, raised on `statement_timeout`. */
export const POSTGRES_QUERY_CANCELED_CODE = '57014'

export type RpcArgs = Record<string, unknown>

// Only read-only query RPCs whose args are search filters get their args sent to PostHog; every
// other RPC (profile setup, user lists, like/hide/star mutations, ...) may carry personal data.
export const TELEMETRY_ARGS_ALLOWLIST: ReadonlySet<string> = new Set([
  'get_snippets',
  'get_trending_topics',
  'get_topic_details',
  'get_filtering_options',
  'search_related_snippets_public',
  'get_public_snippet',
  'get_landing_page_content'
])

export interface TimedRpcOptions {
  abortSignal?: AbortSignal
}

export interface TimedRpcResult<T> {
  data: T
  durationMs: number
}

interface ErrorLike {
  code?: string
  message?: string
  name?: string
}

const asErrorLike = (error: unknown): ErrorLike =>
  error !== null && typeof error === 'object' ? (error as ErrorLike) : {}

/** True when a Supabase/Postgrest error was caused by a database statement timeout. */
export const isTimeoutError = (error: unknown): boolean => {
  const { code, message = '' } = asErrorLike(error)
  return code === POSTGRES_QUERY_CANCELED_CODE || /statement timeout|canceling statement|timeout/i.test(message)
}

const isAbortError = (error: unknown, abortSignal?: AbortSignal): boolean => {
  const { name = '', message = '' } = asErrorLike(error)
  return abortSignal?.aborted === true || name === 'AbortError' || /AbortError/i.test(message)
}

/**
 * Calls `rpc(name, args)`, measures how long it takes and reports the outcome to PostHog as a
 * `supabase_rpc` event (plus `captureException` on failure). RPC args are attached to the
 * telemetry only for RPCs in `TELEMETRY_ARGS_ALLOWLIST`. Resolves with the RPC's `data`
 * on success and throws the Postgrest error otherwise. Aborted requests are rethrown silently.
 *
 * As with `rpc`, `T` is declared by the caller and trusted, not validated.
 */
export async function timedRpc<T>(
  name: string,
  args: RpcArgs = {},
  { abortSignal }: TimedRpcOptions = {}
): Promise<TimedRpcResult<T>> {
  const startTime = performance.now()
  const telemetryArgs = TELEMETRY_ARGS_ALLOWLIST.has(name) ? args : {}

  const builder = rpc<T>(name, args)
  const { data, error } = await (abortSignal ? builder.abortSignal(abortSignal) : builder)

  const durationMs = Math.round(performance.now() - startTime)

  if (error) {
    if (isAbortError(error, abortSignal)) {
      throw error
    }

    console.error(`Error calling RPC ${name}:`, error)

    const errorProps = {
      ...telemetryArgs,
      rpc_name: name,
      duration_ms: durationMs,
      error_code: error.code,
      is_timeout: isTimeoutError(error)
    }
    capture('supabase_rpc', { ...errorProps, status: 'error' })
    captureException(error, errorProps)

    throw error
  }

  capture('supabase_rpc', {
    ...telemetryArgs,
    rpc_name: name,
    duration_ms: durationMs,
    status: durationMs > SLOW_THRESHOLD_MS ? 'warning' : 'success'
  })

  return { data, durationMs }
}
