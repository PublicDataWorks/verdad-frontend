'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface FilterState {
  showSidebar: boolean
  languages: string[]
  states: string[]
  labeledBy: string[]
  starredByFilter: string[]
  labels: string[]
  sources: string[]
}

interface FilterContextType extends FilterState {
  setShowSidebar: (show: boolean) => void
  setLanguages: (languages: string[]) => void
  setStates: (states: string[]) => void
  setLabeledBy: (labeledBy: string[]) => void
  setStarredByFilter: (starredBy: string[]) => void
  setLabels: (labels: string[]) => void
  setSources: (sources: string[]) => void
  clearAll: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

const initialState: FilterState = {
  showSidebar: false,
  languages: [],
  states: [],
  labeledBy: [],
  starredByFilter: [],
  labels: [],
  sources: []
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterState, setFilterState] = useState<FilterState>(initialState)

  const updateState = (key: keyof FilterState) => (value: any) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Modified clearAll function
  const clearAll = () => {
    setFilterState(prev => ({
      ...initialState,
      showSidebar: prev.showSidebar // Preserve sidebar state
    }))
  }

  return (
    <FilterContext.Provider
      value={{
        ...filterState,
        setShowSidebar: updateState('showSidebar'),
        setLanguages: updateState('languages'),
        setStates: updateState('states'),
        setSources: updateState('sources'),
        setLabeledBy: updateState('labeledBy'),
        setStarredByFilter: updateState('starredByFilter'),
        setLabels: updateState('labels'),
        clearAll
      }}
    >
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
