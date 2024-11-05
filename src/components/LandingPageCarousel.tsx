import { useState, useEffect, useRef } from 'react'
import { PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type LandingPageCarouselProps = {
  snippets: {
    titleEn: string
    titleEs: string
    labels: string[]
  }[]
}

export default function LandingPageCarousel({ snippets }: LandingPageCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationFrameId: number
    let lastTimestamp: number

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp

      if (elapsed > 40) {
        setScrollPosition(prevPosition => {
          const newPosition = prevPosition + 1
          if (scrollRef.current && containerRef.current) {
            const maxScroll = scrollRef.current.scrollHeight - containerRef.current.clientHeight
            return newPosition % maxScroll
          }
          return newPosition
        })
        lastTimestamp = timestamp
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.style.transform = `translateY(-${scrollPosition}px)`
    }
  }, [scrollPosition])

  return (
    <Card className='h-[400px] overflow-hidden border-white/20 bg-white/10 p-4 backdrop-blur-sm' ref={containerRef}>
      <div ref={scrollRef} className='transition-transform duration-1000 ease-linear'>
        {[...snippets, ...snippets].map((snippet, idx) => (
          <Card key={`${snippet.titleEn}-${idx}`} className='mb-4 border-white/10 bg-white/5 p-4'>
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex-1 pr-4'>
                <h3 className='text-sm font-medium text-white/90'>{snippet.titleEn}</h3>
                <p className='mt-1 text-xs text-white/70'>{snippet.titleEs}</p>
              </div>
              <Button variant='ghost' size='icon' className='pointer-events-none text-white/80'>
                <PlayCircle className='h-8 w-8' />
                <span className='sr-only'>Play audio</span>
              </Button>
            </div>
            <div className='mb-3 h-8 w-full rounded bg-white/10' aria-hidden='true' />
            <div className='flex flex-wrap gap-2'>
              {snippet.labels.map((tag, tagIndex) => (
                <Badge key={tagIndex} variant='secondary' className='cursor-default bg-white/20 text-xs text-white'>
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
