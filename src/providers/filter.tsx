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
  sources: string[]
  setSources: React.Dispatch<React.SetStateAction<string[]>>
  clearAll: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [languages, setLanguages] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [labeledBy, setLabeledBy] = useState<string[]>([])
  const [starredByFilter, setStarredByFilter] = useState<string[]>([])
  const [labels, setLabels] = useState<string[]>([])

  const clearAll = () => {
    setLanguages([])
    setStates([])
    setSources([])
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
        sources,
        setSources,
        labeledBy,
        setLabeledBy,
        starredByFilter,
        setStarredByFilter,
        labels,
        setLabels,
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
