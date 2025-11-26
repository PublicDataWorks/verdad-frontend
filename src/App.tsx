import type { ReactElement } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import LoginPage from './components/LoginPage'
import SearchInterface from './components/SearchInterface'
import SnippetDetail from './components/SnippetDetail'
import OnboardingPage from './components/OnboardingPage'
import ForgetPassword from './components/ForgetPassword'
import SignupPage from './components/SignupPage'
import { AuthProvider } from './providers/auth'

import {
  FORGET_PASSWORD_PATH,
  ONBOARDING_PATH,
  LOGIN_PATH,
  RESET_PASSWORD_PATH,
  PUBLIC_SNIPPET_PATH,
  SEARCH_PATH,
  SNIPPET_DETAIL_PATH,
  SIGNUP_PATH,
  RECORDINGS_PATH,
  RECORDING_DETAIL_PATH
} from './constants/routes'
import { RecordingBrowser, RecordingDetail } from './components/recordings'
import { ResetPassword } from './components/ResetPassword'
import { SidebarProvider } from './providers/sidebar'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'
import PublicSnippet from './components/PublicSnippet'
import { LanguageProvider } from './providers/language'
import LandingPage from './pages/Landing'
import { AudioProvider } from './providers/audio'
import { ThemeProvider } from './providers/theme'
import { TooltipProvider } from './components/ui/tooltip'

// Create a new QueryClient with increased timeout settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      networkMode: 'always'
    },
    mutations: {
      retry: 2,
      retryDelay: 3000
    }
  }
})

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={100}>
          <AuthProvider>
            <AudioProvider>
              <SidebarProvider>
                <LanguageProvider>
                  <Router>
                    <Routes>
                      <Route path={ONBOARDING_PATH} element={<OnboardingPage />} />
                      <Route path={LOGIN_PATH} element={<LoginPage />} />
                      <Route path={SIGNUP_PATH} element={<SignupPage />} />
                      <Route path={FORGET_PASSWORD_PATH} element={<ForgetPassword />} />
                      <Route path={RESET_PASSWORD_PATH} element={<ResetPassword />} />
                      <Route path={PUBLIC_SNIPPET_PATH} element={<PublicSnippet />} />
                      {/* Recording Browser routes - no auth required */}
                      <Route path={RECORDINGS_PATH} element={<RecordingBrowser />} />
                      <Route path={RECORDING_DETAIL_PATH} element={<RecordingDetail />} />
                      <Route element={<AuthenticatedLayout />}>
                        <Route path={SEARCH_PATH} element={<SearchInterface />} />
                        <Route path={SNIPPET_DETAIL_PATH} element={<SnippetDetail />} />
                      </Route>
                      <Route path='*' element={<LandingPage />} />
                    </Routes>
                  </Router>
                </LanguageProvider>
              </SidebarProvider>
            </AudioProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
