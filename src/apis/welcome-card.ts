import supabaseClient from '@/lib/supabase'

export type Feature = {
  icon: string
  text: string
}

export type WelcomeCard = {
  id: string
  language_code: string
  title: string
  subtitle: string | null
  features: Feature[]
  footer_text: string | null
  contact_email: string | null
  is_default: boolean
  updated_at: string
  contact_text: string | null
}

export const getWelcomeContent = async (language: string): Promise<WelcomeCard> => {
  const { data, error } = await supabaseClient.rpc('get_welcome_card', { p_language: language })
  if (error) throw error
  return data
}
