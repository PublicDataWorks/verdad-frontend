import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToken } from '../providers/auth'
import { LOGIN_PATH } from '../constants/routes'
import PropTypes from 'prop-types'

interface PrivateRouteProperties {
  children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProperties> = ({ children }) => {
  const { token } = useToken()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token !== undefined) {
      // Finish loading from Missive
      if (!token) {
        navigate(LOGIN_PATH)
      } else {
        setIsLoading(false)
      }
    }
  }, [token])

  if (isLoading) {
    return <b>Loading...</b>
  }
  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default PrivateRoute
