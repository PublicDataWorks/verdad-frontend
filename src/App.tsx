import type { ReactElement } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import LoginPage from './components/LoginPage'
import SearchInterface from './components/SearchInterface'
import SnippetDetail from './components/SnippetDetail'
import PrivateRoute from './components/PrivateRoute'
import OnboardingPage from './components/OnboardingPage'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'
import ForgetPassword from './components/ForgetPassword'
import { AuthProvider } from './providers/auth'

import { FORGET_PASSWORD_PATH, ONBOARDING_PATH, LOGIN_PATH, RESET_PASSWORD_PATH } from './constants/routes'
import { ResetPassword } from './components/ResetPassword'
import { FilterProvider } from './providers/filter'

const queryClient = new QueryClient()

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FilterProvider>
          <Router>
            <Routes>
              <Route path={ONBOARDING_PATH} element={<OnboardingPage />} />
              <Route path={ONBOARDING_PATH} element={<OnboardingPage />} />
              <Route path={LOGIN_PATH} element={<LoginPage />} />
              <Route path={FORGET_PASSWORD_PATH} element={<ForgetPassword />} />
              <Route path={RESET_PASSWORD_PATH} element={<ResetPassword />} />
              <Route element={<AuthenticatedLayout />}>
                <Route path='/search' element={<SearchInterface />} />
                <Route
                  path='/snippet/:snippetId'
                  element={
                    <PrivateRoute>
                      <SnippetDetail />
                    </PrivateRoute>
                  }
                />
              </Route>
              <Route path='*' element={<LoginPage />} />
            </Routes>
          </Router>
        </FilterProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
