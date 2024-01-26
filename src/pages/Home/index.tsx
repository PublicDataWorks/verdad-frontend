import { useToken } from '../../providers/auth'
import { GOOGLE_OAUTH } from '../../constants/misc'
import { useNavigate } from 'react-router-dom'
import { LOGOUT_PATH } from '../../constants/routes'
import BroadcastDashboard from 'components/broadcaster/BroadcastDashBoard'

function Home() {
  const navigate = useNavigate()
  const onClick = () => {
    navigate(LOGOUT_PATH, { replace: true })
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={GOOGLE_OAUTH}
      >
        Logout
      </button>
      <br />
      <BroadcastDashboard />
    </>
  )
}

export default Home
