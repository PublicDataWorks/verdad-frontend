import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Route, HashRouter as Router, Routes } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { AuthProvider } from './providers/auth'
import LoginPage from './components/LoginPage'
import SearchInterface from './components/SearchInterface'
import PrivateRoute from './components/PrivateRoute'
import { LOGOUT_PATH } from './constants/routes'
import Logout from './components/Logout'

const queryClient = new QueryClient()
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)

export default function App(): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider supabaseClient={supabase}>
        <Router>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path={LOGOUT_PATH} element={<Logout />} />
            <Route
              path='/search'
              element={
                <PrivateRoute>
                  <SearchInterface />
                </PrivateRoute>
              }
            />
            <Route path='*' element={<LoginPage />} />
          </Routes>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
