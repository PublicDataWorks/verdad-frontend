import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'

import LandingPageCarousel from '@/components/LandingPageCarousel'
import { Button } from '@/components/ui/button'
import { translations } from '@/constants/translations'
import { useLandingPageContentQuery } from '@/hooks/useLandingPageContent'
import { useLanguage } from '@/providers/language'
import { LOGIN_PATH, SEARCH_PATH, SIGNUP_PATH } from '@/constants/routes'
import { useAuth } from '@/providers/auth'

import './Landing.scss'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = translations[language]
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/knight') {
      localStorage.setItem('signup', '/knight')
    }
  }, [location.pathname])

  useEffect(() => {
    if (user) {
      navigate(SEARCH_PATH)
    }
  }, [user])

  const landingPageContentQuery = useLandingPageContentQuery(language)
  if (landingPageContentQuery.isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
        <div className='px-1'>
          <div className='text-xl font-bold text-[#2563EB]'>VERDAD</div>
        </div>
      </div>
    )
  }

  return (
    <div id='landing-page' className='flex min-h-screen flex-col bg-[#2563EB]'>
      <header className='border-b border-gray-200 bg-white'>
        <div className='container mx-auto flex h-14 items-center justify-between px-8'>
          <Link to='/' className='text-xl font-bold text-[#2563EB]'>
            VERDAD
          </Link>
        </div>
      </header>
      <main className='container mx-auto flex flex-1 flex-col items-start gap-16 px-8 py-8 lg:flex-row lg:py-16'>
        <div className='order-2 max-w-2xl space-y-8 lg:order-none'>
          <h1 className='text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl markdown'>
            <Markdown>{landingPageContentQuery.data?.hero_title}</Markdown>
          </h1>
          <p className='text-lg leading-relaxed text-white/90 sm:text-xl markdown'>
            <Markdown>{landingPageContentQuery.data?.hero_description}</Markdown>
          </p>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <Button asChild className='bg-white text-[#2563EB] hover:bg-white/90' size='lg'>
              <Link to={SIGNUP_PATH}>{t.createAccount}</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-white bg-white/10 text-white hover:bg-white/20'
            >
              <Link to={LOGIN_PATH}>{t.logIn}</Link>
            </Button>
          </div>
        </div>
        <div className='order-1 w-full min-w-[min(100%,_420px)] lg:order-none'>
          <LandingPageCarousel snippets={landingPageContentQuery.data?.snippets ?? []} />
        </div>
      </main>
      <footer className='container mx-auto p-8'>
        <p className='max-w-3xl text-sm text-white/70 markdown'>
          <Markdown>{landingPageContentQuery.data?.footer_text}</Markdown>
        </p>
      </footer>
    </div>
  )
}
