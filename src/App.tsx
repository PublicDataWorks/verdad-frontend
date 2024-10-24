import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { AuthProvider } from './providers/auth'
import LoginPage from './components/LoginPage'
import SearchInterface from './components/SearchInterface'
import SnippetDetail from './components/SnippetDetail'
import PrivateRoute from './components/PrivateRoute'
import { LOGOUT_PATH } from './constants/routes'
import Logout from './components/Logout'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'

const queryClient = new QueryClient()

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path={LOGOUT_PATH} element={<Logout />} />
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
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
