import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { RpcReturns } from '@/types/rpc'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

type DatabaseFunctions = Database['public']['Functions']
export type RpcName = keyof DatabaseFunctions

/** The declared shape of an RPC result: ours when we have one, else the generated `Returns`. */
export type RpcResult<Fn extends RpcName> = Fn extends keyof RpcReturns
  ? RpcReturns[Fn]
  : DatabaseFunctions[Fn]['Returns']

interface RpcBuilder<T> extends PromiseLike<PostgrestSingleResponse<T>> {
  abortSignal: (signal: AbortSignal) => PromiseLike<PostgrestSingleResponse<T>>
}

/**
 * Typed wrapper around `supabase.rpc`. The function name and its arguments are checked
 * against the generated schema (src/types/database.ts); the result type comes from
 * src/types/rpc.ts, which is hand-written from the live function bodies and trusted, not
 * validated - exactly as a generated `Returns` would be.
 */
export const rpc = <Fn extends RpcName, T = RpcResult<Fn>>(
  fn: Fn,
  args?: DatabaseFunctions[Fn]['Args']
): RpcBuilder<T> => supabaseClient.rpc(fn as never, args as never) as unknown as RpcBuilder<T>

export default supabaseClient
