import React, { createContext, useState } from 'react'

export const AudioContext = createContext<{
  currentAudio: { id: string | null; pause: boolean | null }
  setCurrentAudio: (audio: { id: string | null; pause: boolean | null }) => void
}>({
  currentAudio: { id: null, pause: null },
  setCurrentAudio: () => {}
})

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentAudio, setCurrentAudio] = useState({
    id: null,
    pause: null
  })

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        setCurrentAudio: setCurrentAudio as (audio: { id: string | null; pause: boolean | null }) => void
      }}>
      {children}
    </AudioContext.Provider>
  )
}
