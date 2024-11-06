'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { isMobile } from 'react-device-detect'

interface FilterState {
  showSidebar: boolean
  filters: {
    languages: string[]
    states: string[]
    sources: string[]
    labels: string[]
    labeledBy: string[]
    starredBy: string[]
    politicalSpectrum: 'center' | 'center_left' | 'center_right' | 'left' | 'right' | undefined
  }
}

interface FilterContextType extends FilterState {
  setShowSidebar: (show: boolean) => void
  setFilter: (category: string, values: string[]) => void
  clearAll: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

const createInitialState = (isMobileDevice: boolean): FilterState => ({
  showSidebar: !isMobileDevice,
  filters: {
    languages: [],
    states: [],
    sources: [],
    labels: [],
    labeledBy: [],
    starredBy: [],
    politicalSpectrum: undefined
  }
})

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterState, setFilterState] = useState<FilterState>(() => createInitialState(isMobile))

  useEffect(() => {
    setFilterState(prev => ({
      ...prev,
      showSidebar: !isMobile
    }))
  }, [])

  const setFilter = (category: string, values: string[]) => {
    setFilterState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [category]: values
      }
    }))
  }

  const setShowSidebar = (show: boolean) => {
    setFilterState(prev => ({
      ...prev,
      showSidebar: show
    }))
  }

  const clearAll = () => {
    setFilterState(prev => ({
      ...prev,
      filters: createInitialState(isMobile).filters
    }))
  }

  return (
    <FilterContext.Provider
      value={{
        ...filterState,
        setShowSidebar,
        setFilter,
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
