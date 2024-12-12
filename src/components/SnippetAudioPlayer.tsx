import { useState, useEffect, useRef, useContext, FC } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { AudioContext } from '@/providers/audio'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export const SnippetAudioPlayer: FC<{ path: string; initialStartTime: string }> = ({ path, initialStartTime }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { currentAudio, setCurrentAudio } = useContext(AudioContext)

  const id = path

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      if (initialStartTime) {
        const [hours, minutes, seconds] = initialStartTime.split(':').map(Number)
        const startSeconds = hours * 3600 + minutes * 60 + seconds
        audio.currentTime = startSeconds
        setCurrentTime(startSeconds)
      }
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (currentAudio.id === id) {
        setCurrentAudio({ id: null, pause: null })
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setCurrentAudio({ id, pause: () => audio.pause() })
    }

    const handlePause = () => {
      setIsPlaying(false)
      if (currentAudio.id === id) {
        setCurrentAudio({ id: null, pause: null })
      }
    }

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [initialStartTime, id, currentAudio.id, setCurrentAudio])

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        if (currentAudio.id && currentAudio.id !== id && currentAudio.pause) {
          currentAudio.pause()
        }
        audio.play()
      }
    }
  }

  const onProgressChange = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      const time = value[0]
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div onClick={handleClick} className='my-4'>
      <audio ref={audioRef} src={`${import.meta.env.VITE_AUDIO_BASE_URL}/${path}`} />
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={togglePlayPause}>
              {isPlaying ? (
                <PauseIcon className='h-4 w-4 fill-current' />
              ) : (
                <PlayIcon className='h-4 w-4 fill-current' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
        </Tooltip>
        <div className='flex-1'>
          <Slider value={[currentTime]} max={duration} step={1} onValueChange={onProgressChange} />
        </div>
        <span className='text-sm text-muted-foreground'>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
