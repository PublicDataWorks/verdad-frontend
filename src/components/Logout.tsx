import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTokenChanged } from '../providers/auth'
import { ROOT_PATH } from '../constants/routes'

const Logout = () => {
  const navigate = useNavigate()
  const { onTokenChanged } = useTokenChanged()

  useEffect(() => {
    onTokenChanged('')
    navigate(ROOT_PATH, { replace: true })
  }, [])

  return null
}

export default Logout
