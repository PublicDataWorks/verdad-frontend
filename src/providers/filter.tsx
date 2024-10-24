'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Assuming these constants are defined elsewhere in your project
const LANGUAGES = ['All Languages', 'English', 'Spanish', 'French']
const STATES = ['All States', 'California', 'New York', 'Texas']
const STARRED = ['John', 'Jane', 'Bob']
const LABELS = ['Important', 'Urgent', 'Review']

interface FilterContextType {
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  languages: string[]
  setLanguages: React.Dispatch<React.SetStateAction<string[]>>
  states: string[]
  setStates: React.Dispatch<React.SetStateAction<string[]>>
  labeledBy: string[]
  setLabeledBy: React.Dispatch<React.SetStateAction<string[]>>
  starredByFilter: string[]
  setStarredByFilter: React.Dispatch<React.SetStateAction<string[]>>
  labels: string[]
  setLabels: React.Dispatch<React.SetStateAction<string[]>>
  handleMultiSelect: (setter: React.Dispatch<React.SetStateAction<string[]>>, items: string[], item: string) => void
  clearAll: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [languages, setLanguages] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [labeledBy, setLabeledBy] = useState<string[]>([])
  const [starredByFilter, setStarredByFilter] = useState<string[]>([])
  const [labels, setLabels] = useState<string[]>([])

  const handleMultiSelect = (setter: React.Dispatch<React.SetStateAction<string[]>>, items: string[], item: string) => {
    setter(prev => {
      if (item === items[0]) return prev.length === items.length - 1 ? [] : items.slice(1)
      return prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    })
  }

  const clearAll = () => {
    setLanguages([])
    setStates([])
    setLabeledBy([])
    setStarredByFilter([])
    setLabels([])
  }

  return (
    <FilterContext.Provider
      value={{
        showSidebar,
        setShowSidebar,
        languages,
        setLanguages,
        states,
        setStates,
        labeledBy,
        setLabeledBy,
        starredByFilter,
        setStarredByFilter,
        labels,
        setLabels,
        handleMultiSelect,
        clearAll
      }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}
