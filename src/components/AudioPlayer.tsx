'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration))
    }
  }

  const changeSpeed = (speed: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = speed
      setPlaybackRate(speed)
    }
  }

  const onProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) {
      const time = parseFloat(e.target.value)
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-background rounded-lg shadow-md">
      <audio ref={audioRef} src="/path-to-your-audio-file.mp3" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-x-4">
            <Button variant="outline" onClick={() => skip(-5)} aria-label="Rewind 5 seconds">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="outline" onClick={() => skip(5)} aria-label="Forward 5 seconds">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {playbackRate}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeSpeed(0.5)}>0.5x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSpeed(1)}>1x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSpeed(1.5)}>1.5x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSpeed(2)}>2x</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={onProgressChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
