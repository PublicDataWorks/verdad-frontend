import type { PostgrestError } from '@supabase/supabase-js'
import { capture, captureException } from '@/lib/posthog'
import supabase from '@/lib/supabase'

/** Successful calls slower than this are reported with status 'warning'. */
export const SLOW_THRESHOLD_MS = 20_000

/** PostgreSQL SQLSTATE for `query_canceled`, raised on `statement_timeout`. */
export const POSTGRES_QUERY_CANCELED_CODE = '57014'

export type RpcArgs = Record<string, unknown>

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
 * Calls `supabase.rpc(name, args)`, measures how long it takes and reports the outcome to PostHog
 * as a `supabase_rpc` event (plus `captureException` on failure). Resolves with the RPC's `data`
 * on success and throws the Postgrest error otherwise. Aborted requests are rethrown silently.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function timedRpc<T = any>(
  name: string,
  args: RpcArgs = {},
  { abortSignal }: TimedRpcOptions = {}
): Promise<TimedRpcResult<T>> {
  const startTime = performance.now()

  let query = supabase.rpc(name, args)
  if (abortSignal) {
    query = query.abortSignal(abortSignal)
  }
  const { data, error } = (await query) as { data: T; error: PostgrestError | null }

  const durationMs = Math.round(performance.now() - startTime)

  if (error) {
    if (isAbortError(error, abortSignal)) {
      throw error
    }

    console.error(`Error calling RPC ${name}:`, error)

    const errorCode = error.code
    const isTimeout = isTimeoutError(error)
    const errorProps = {
      ...args,
      rpc_name: name,
      duration_ms: durationMs,
      error_code: errorCode,
      is_timeout: isTimeout
    }
    capture('supabase_rpc', { ...errorProps, status: 'error' })
    captureException(error, errorProps)

    throw error
  }

  capture('supabase_rpc', {
    ...args,
    rpc_name: name,
    duration_ms: durationMs,
    status: durationMs > SLOW_THRESHOLD_MS ? 'warning' : 'success'
  })

  return { data, durationMs }
}
