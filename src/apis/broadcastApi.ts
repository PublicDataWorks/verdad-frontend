import axios from 'lib/axios'
import type { AxiosResponse } from 'axios'
import { BROADCAST_PATH } from '../constants/routes'

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
  id: number,
  firstMessage: string,
  secondMessage: string,
  runAt: number,
  delay: string,
}

interface UpdateBroadcast {
  id: number,
  firstMessage?: string,
  secondMessage?: string,
}

const getBroadcastDashboard = async (): Promise<AxiosResponse<BroadcastDashboard>> => axios.get(BROADCAST_PATH)

const updateBroadcast = async (
  { id, firstMessage, secondMessage }: UpdateBroadcast
): Promise<AxiosResponse<Broadcast>> =>
  axios.patch(`${BROADCAST_PATH}/${id}`, {
    firstMessage,
    secondMessage
  })

export { getBroadcastDashboard, updateBroadcast }
export type { UpdateBroadcast, UpcomingBroadcast }
