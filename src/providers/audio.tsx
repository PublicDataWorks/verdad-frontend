import React, { createContext, useState } from 'react'

export interface CurrentAudio {
  id: string | null
  pause: (() => void) | null
}

export const AudioContext = createContext<{
  currentAudio: CurrentAudio
  setCurrentAudio: (audio: CurrentAudio) => void
}>({
  currentAudio: { id: null, pause: null },
  setCurrentAudio: () => {}
})

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentAudio, setCurrentAudio] = useState<CurrentAudio>({
    id: null,
    pause: null
  })

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        setCurrentAudio
      }}>
      {children}
    </AudioContext.Provider>
  )
}
