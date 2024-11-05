import { useState, useEffect, useRef } from 'react'
import { PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/providers/language'
import { translations } from '@/constants/translations'
import LanguageDropdown from '@/components/LanguageDropdown'
const snippets = [
  {
    titleEn: 'Warning Against Amendment 4 in Florida',
    titleEs: 'Advertencia Contra la Enmienda 4 en Florida',
    tags: ['Abortion and Reproductive Rights']
  },
  {
    titleEn: 'Alleged Censorship on Social Media',
    titleEs: 'Supuesta Censura en Redes Sociales',
    tags: ['Media and Tech Manipulation']
  },
  {
    titleEn: 'Alleged Polling Bias Towards Democrats',
    titleEs: 'Supuesto Sesgo de Encuestas Hacia los Demócratas',
    tags: ['Election Integrity and Voting Processes']
  },
  {
    titleEn: 'Slow Job Growth Raises Concerns about Economic Policies',
    titleEs: 'El Lento Crecimiento del Empleo Genera Preocupaciones sobre Políticas Económicas',
    tags: ['Economic Policies and Inflation']
  },
  {
    titleEn: 'Disinformation Campaign Against Amendment 4',
    titleEs: 'Campaña de Desinformación Contra la Enmienda 4',
    tags: ['Political Figures and Movements']
  },
  {
    titleEn: 'Concerns about Child Sexual Abuse in the Public School System',
    titleEs: 'Preocupaciones sobre Abuso Sexual Infantil en el Sistema de Escuelas Públicas',
    tags: ['Education and Academic Freedom']
  },
  {
    titleEn: 'Moral Decay and Missing Immigrants: A Claim of Sex Trafficking',
    titleEs: 'Decadencia Moral e Inmigrantes Desaparecidos: Una Afirmación de Tráfico Sexual',
    tags: ['Immigration Policies', 'Public Safety and Law Enforcement']
  }
]

export default function LandingPageCarousel() {
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
        // Update every 40ms for 25% faster scrolling
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
              {snippet.tags.map((tag, tagIndex) => (
                <Badge key={tagIndex} variant='secondary' className='bg-white/20 text-xs text-white'>
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
