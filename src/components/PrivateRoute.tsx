import type { FC, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToken } from '../providers/auth'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const { token } = useToken()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token === null) {
      navigate('/login', { state: { from: location.pathname + location.search } })
    } else if (token !== undefined) {
      setIsLoading(false)
    }
  }, [token, navigate, location])

  if (isLoading) {
    return <div>Loading...</div>
  }
  return <>{children}</>
}

export default PrivateRoute
