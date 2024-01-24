import axios from 'lib/axios'
import type { AxiosResponse } from 'axios'
import { BROADCAST_DASHBOARD_PATH } from '../constants/routes'

interface BroadcastDashboard {
  upcoming: UpcomingBroadcast
  past: {
    id: string
    runAt: number
    totalSent: number
    succesfullyDelivered: number
    failedDelivered: number
  }[]
}

interface UpcomingBroadcast {
  id: string
  firstMessage: string
  secondMessage: string
  runAt: number
  delay: string
}

interface UpdateBroadcaster {
  id: number
  firstMessage: string
  secondMessage: string
  delay: string
}

const getBroadcastDashboard = async (): Promise<AxiosResponse<BroadcastDashboard>> =>
  axios.get(BROADCAST_DASHBOARD_PATH)

// TODO: use later
// const updateBroadcaster = async ({
//   id,
//   firstMessage,
//   secondMessage
// }: UpdateBroadcaster): Promise<AxiosResponse<Broadcast>> =>
//   axios.post(`${BROADCASTER_PATH}/${id}`, {
//     firstMessage,
//     secondMessage,
//     delay
//   })

export { getBroadcastDashboard }
export type { UpdateBroadcaster, UpcomingBroadcast }
