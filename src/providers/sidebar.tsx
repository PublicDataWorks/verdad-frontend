import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarState {
  showSidebar: boolean
}

interface SidebarContextType extends SidebarState {
  setShowSidebar: (show: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const initialState: SidebarState = {
  showSidebar: true
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [filterState, setFilterState] = useState<SidebarState>(initialState)

  const setShowSidebar = (show: boolean) => {
    setFilterState(prev => ({
      ...prev,
      showSidebar: show
    }))
  }

  return (
    <SidebarContext.Provider
      value={{
        ...filterState,
        setShowSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider')
  }
  return context
}
