import type { FC, ReactNode } from 'react'
import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../providers/auth'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useContext(AuthContext)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user === null) {
      navigate('/login', { state: { from: location.pathname + location.search } })
    }
  }, [user, navigate, location])

  return <>{children}</>
}

export default PrivateRoute
