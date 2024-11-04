import type { ReactElement } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import SearchInterface from './components/SearchInterface'
import SnippetDetail from './components/SnippetDetail'
import PrivateRoute from './components/PrivateRoute'
import OnboardingPage from './components/OnboardingPage'
import ForgetPassword from './components/ForgetPassword'
import { AuthProvider } from './providers/auth'

import {
  FORGET_PASSWORD_PATH,
  ONBOARDING_PATH,
  LOGIN_PATH,
  RESET_PASSWORD_PATH,
  PUBLIC_SNIPPET_PATH,
  SEARCH_PATH,
  SNIPPET_DETAIL_PATH
} from './constants/routes'
import { ResetPassword } from './components/ResetPassword'
import { FilterProvider } from './providers/filter'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'
import PublicSnippet from './components/PublicSnippet'
import { LanguageProvider } from './providers/language'

const queryClient = new QueryClient()

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FilterProvider>
          <LanguageProvider>
            <Router>
              <Routes>
                <Route path={ROOT_PATH} element={<LandingPage /> as ReactElement} />
                <Route path={ONBOARDING_PATH} element={<OnboardingPage />} />
                <Route path={LOGIN_PATH} element={<LoginPage />} />
                <Route path={FORGET_PASSWORD_PATH} element={<ForgetPassword />} />
                <Route path={RESET_PASSWORD_PATH} element={<ResetPassword />} />
                <Route path={PUBLIC_SNIPPET_PATH} element={<PublicSnippet />} />
                <Route element={<AuthenticatedLayout />}>
                  <Route path={SEARCH_PATH} element={<SearchInterface />} />
                  <Route path={SNIPPET_DETAIL_PATH} element={<SnippetDetail />} />
                </Route>
              </Routes>
            </Router>
          </LanguageProvider>
        </FilterProvider>
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
