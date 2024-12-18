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
  SIGNUP_PATH
} from './constants/routes'
import { ResetPassword } from './components/ResetPassword'
import { SidebarProvider } from './providers/sidebar'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'
import PublicSnippet from './components/PublicSnippet'
import { LanguageProvider } from './providers/language'
import LandingPage from './pages/Landing'
import { AudioProvider } from './providers/audio'
import { ThemeProvider } from './providers/theme'
import { TooltipProvider } from './components/ui/tooltip'
const queryClient = new QueryClient()

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
