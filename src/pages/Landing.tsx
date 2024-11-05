import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

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

export default function Component() {
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
    <div className='min-h-screen bg-[#2563EB]'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='container mx-auto flex h-14 items-center justify-between px-8'>
          <Link to='/' className='text-xl font-bold text-[#2563EB]'>
            VERDAD
          </Link>
        </div>
      </header>
      <main className='container mx-auto flex flex-col items-start gap-16 px-8 py-16 lg:flex-row'>
        <div className='max-w-2xl space-y-8'>
          <h1 className='text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl'>
            VERDAD detects and tracks coordinated mis/disinformation on the radio
          </h1>
          <p className='text-lg leading-relaxed text-white/90 sm:text-xl'>
            VERDAD gives journalists powerful tools to investigate content targeting immigrant and minority communities
            through their trusted media sources. By recording radio broadcasts, then transcribing, translating, and
            analyzing them in real-time, we help journalists to investigate campaigns designed to spread false
            information.
          </p>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <Button asChild className='bg-white text-[#2563EB] hover:bg-white/90' size='lg'>
              <Link to='/signup'>Create Account</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-white bg-white/10 text-white hover:bg-white/20'
            >
              <Link to='/login'>Log In</Link>
            </Button>
          </div>
        </div>
        <div className='w-full max-w-md'>
          <Card
            className='h-[400px] overflow-hidden border-white/20 bg-white/10 p-4 backdrop-blur-sm'
            ref={containerRef}
          >
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
                  <div className='mb-3 h-8 w-full rounded bg-white/10' aria-hidden='true'></div>
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
        </div>
      </main>
      <footer className='container mx-auto mt-16 px-8 py-8'>
        <p className='max-w-3xl text-sm text-white/70'>
          Created by journalist Martina Guzmán, designed and built by Public Data Works. Supported by the Reynolds
          Journalism Institute, the Damon J. Keith Center for Civil Rights, and the MacArthur Foundation.
        </p>
      </footer>
    </div>
  )
}
