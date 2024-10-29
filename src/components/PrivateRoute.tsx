import type { FC } from 'react'
import { useContext, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { AuthContext } from '../providers/auth'

interface PrivateRouteProps {}

const PrivateRoute: FC<PrivateRouteProps> = () => {
  const { user, isLoading } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Only run once on mount
  useEffect(() => {
    if (!isLoading && user === null) {
      navigate('/login', {
        state: { from: location.pathname + location.search },
        replace: true
      })
    }
  }, []) // Empty dependency array - only runs once on mount

  // Handle subsequent auth changes in a separate effect if needed
  useEffect(() => {
    if (!isLoading && user === null) {
      navigate('/login', { replace: true })
    }
  }, [user]) // Only depend on user changes

  if (isLoading) {
    return <div>Loading...</div>
  }

  return user ? <Outlet /> : null
}

export default PrivateRoute
