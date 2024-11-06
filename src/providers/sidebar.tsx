import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { isMobile } from 'react-device-detect'

interface SidebarState {
  showSidebar: boolean
}

interface SidebarContextType extends SidebarState {
  setShowSidebar: (show: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [showSidebar, setShowSidebarState] = useState<boolean>(true)

  useEffect(() => {
    setShowSidebarState(!isMobile)
  }, [])

  const setShowSidebar = (show: boolean) => {
    setShowSidebarState(show)
  }

  return (
    <SidebarContext.Provider
      value={{
        showSidebar,
        setShowSidebar
      }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
