import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = ''
const supabaseAnonKey = ''

const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export default supabaseClient
