import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

interface RpcBuilder<T> extends PromiseLike<PostgrestSingleResponse<T>> {
  abortSignal: (signal: AbortSignal) => PromiseLike<PostgrestSingleResponse<T>>
}

// No generated Supabase types yet: callers declare `T` and it is trusted, not validated.
export const rpc = <T>(fn: string, args?: Record<string, unknown>): RpcBuilder<T> =>
  supabaseClient.rpc(fn, args) as unknown as RpcBuilder<T>

export default supabaseClient
