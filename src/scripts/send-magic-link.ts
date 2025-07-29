import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function sendMagicLink(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Don't create a new user
        emailRedirectTo: `${window.location.origin}/onboarding`
      }
    })

    if (error) {
      console.error('Error sending magic link:', error)
      return
    }

    console.log('Magic link sent successfully to:', email)
  } catch (err) {
    console.error('Failed to send magic link:', err)
  }
}

// Send magic link to the user
sendMagicLink('romero-craftk@brennan.law.nyu.edu')