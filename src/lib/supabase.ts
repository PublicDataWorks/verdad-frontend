import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzujjhzgzguciwryzwlx.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dWpqaHpnemd1Y2l3cnl6d2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1NzU4OTgsImV4cCI6MjA0MTE1MTg5OH0.siE0Uya6nIp0EpTfnIjIB4-YC9YAhGhER3XH7Bws_Bo'

const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export default supabaseClient
