// src/api/labels.js
import { useQuery } from '@tanstack/react-query'
import supabase from '../lib/supabase'

export const fetchAllLabels = async () => {
  const { data, error } = await supabase.from('labels').select('text').order('text')

  if (error) {
    throw new Error(error.message)
  }

  return data.map(label => label.text)
}

export const useLabels = () => {
  return useQuery({
    queryKey: ['labels'],
    queryFn: fetchAllLabels
  })
}
