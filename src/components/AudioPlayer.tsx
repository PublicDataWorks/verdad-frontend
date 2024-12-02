'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Rewind5 from '../assets/rewind_5.svg'
import Forward5 from '../assets/forward_5.svg'
import Play from '../assets/play_filled.svg'
import { Pause, ChevronDown } from 'lucide-react'

interface AudioPlayerProps {
  audioSrc: string
  startTime?: string
}

export default function AudioPlayer({ audioSrc, startTime }: AudioPlayerProps) {
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
      if (startTime) {
        const [hours, minutes, seconds] = startTime.split(':').map(Number)
        const startSeconds = hours * 3600 + minutes * 60 + seconds
        audio.currentTime = startSeconds
        setCurrentTime(startSeconds)
      }
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [startTime])

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
    <div className='w-full max-w-3xl rounded-lg bg-background p-4 shadow-md'>
      <audio ref={audioRef} src={audioSrc} />
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='space-x-4'>
            <Button
              variant='ghost'
              onClick={() => skip(-5)}
              aria-label='Rewind 5 seconds'
              className='group relative border-none bg-transparent p-2 hover:bg-transparent'>
              <div className='absolute inset-0 rounded-full transition-colors duration-200 group-hover:bg-secondary/10'></div>
              <img src={Rewind5} alt='Rewind 5 seconds' className='relative h-8 w-8' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='group relative h-12 w-12 border-none bg-transparent p-2 hover:bg-transparent'
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}>
              <div className='absolute inset-0 rounded-full transition-colors duration-200 group-hover:bg-secondary/10'></div>
              {isPlaying ? (
                <Pause className='relative h-8 w-8' />
              ) : (
                <img src={Play} alt='Play' className='relative h-8 w-8' />
              )}
            </Button>
            <Button
              variant='ghost'
              onClick={() => skip(5)}
              aria-label='Forward 5 seconds'
              className='group relative border-none bg-transparent p-2 hover:bg-transparent'>
              <div className='absolute inset-0 rounded-full transition-colors duration-200 group-hover:bg-secondary/10'></div>
              <img src={Forward5} alt='Forward 5 seconds' className='relative h-8 w-8' />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                {playbackRate === 1 ? '1x' : `${playbackRate * 100}%`}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeSpeed(0.75)}>75%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSpeed(1)}>100%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSpeed(1.25)}>125%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeSpeed(1.5)}>150%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='relative h-1 w-full overflow-hidden rounded-full bg-gray-200'>
          <div
            className='absolute left-0 top-0 h-full bg-blue-500'
            style={{ width: `${(currentTime / duration) * 100}%` }}></div>
          <input
            type='range'
            min='0'
            max={duration}
            value={currentTime}
            onChange={onProgressChange}
            className='absolute left-0 top-0 h-full w-full cursor-pointer opacity-0'
          />
        </div>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
