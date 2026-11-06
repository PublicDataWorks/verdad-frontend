import { capture, captureException } from '@/lib/posthog'
import type { RpcArgs, RpcName, RpcResult } from '@/lib/supabase'
import { rpc } from '@/lib/supabase'

/** Successful calls slower than this are reported with status 'warning'. */
export const SLOW_THRESHOLD_MS = 20_000

/** PostgreSQL SQLSTATE for `query_canceled`, raised on `statement_timeout`. */
export const POSTGRES_QUERY_CANCELED_CODE = '57014'

// Only read-only query RPCs whose args are search filters get their args sent to PostHog; every
// other RPC (profile setup, user lists, like/hide/star mutations, ...) may carry personal data.
export const TELEMETRY_ARGS_ALLOWLIST: ReadonlySet<RpcName> = new Set<RpcName>([
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

/**
 * `rpc`'s arguments followed by the options. A zero-argument function takes `undefined` in the
 * first slot, so the options always sit in the second.
 */
type TimedRpcParams<Fn extends RpcName> =
  RpcArgs<Fn> extends [] ? [args?: undefined, options?: TimedRpcOptions] : [...RpcArgs<Fn>, options?: TimedRpcOptions]

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
 * As with `rpc`, the name and arguments are checked against the generated schema and the
 * result type comes from src/types/rpc.ts: trusted, not validated.
 */
export async function timedRpc<Fn extends RpcName, T = RpcResult<Fn>>(
  name: Fn,
  ...params: TimedRpcParams<Fn>
): Promise<TimedRpcResult<T>> {
  // TypeScript cannot index a conditional tuple type inside the generic body; the public signature
  // above is what checks the arguments.
  const [args, options] = params as [object | undefined, TimedRpcOptions | undefined]
  const abortSignal = options?.abortSignal
  const startTime = performance.now()
  const telemetryArgs = TELEMETRY_ARGS_ALLOWLIST.has(name) ? args ?? {} : {}

  const builder = rpc<Fn, T>(name, ...([args] as unknown as RpcArgs<Fn>))
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
