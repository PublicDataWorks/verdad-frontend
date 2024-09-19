import type { FC, ReactNode} from 'react';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToken } from '../providers/auth'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const { token } = useToken()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token === null) {
      navigate('/login')
    } else if (token !== undefined) {
      setIsLoading(false)
    }
  }, [token, navigate])

  if (isLoading) {
    return <div>Loading...</div>
  }
  return <>{children}</>
}

export default PrivateRoute
