import { useEffect } from 'react'
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

  useEffect(() => {
    if (!token) {
      navigate(LOGIN_PATH)
    }
  }, [token])

  return token ? children : null
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default PrivateRoute
