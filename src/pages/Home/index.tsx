import { useToken } from '../../providers/auth'
import { GOOGLE_OAUTH } from '../../constants/misc'
import { useNavigate } from 'react-router-dom'
import { LOGOUT_PATH } from '../../constants/routes'
import BroadcasterList from '../../components/broadcaster/BroadcasterList'

function Home() {
  const { token } = useToken()
  const navigate = useNavigate()
  if (token) {
    return (
      <>
        <button
          type='button'
          onClick={() => {
            navigate(LOGOUT_PATH, { replace: true })
          }}
          aria-label={GOOGLE_OAUTH}
        >
          Logout
        </button>
        <br />
        <BroadcasterList />
      </>
    )
  }
  return <b>Hi</b>
}

export default Home
