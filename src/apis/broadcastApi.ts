import axios from 'lib/axios'
import type { AxiosResponse } from 'axios'
import { BROADCAST_PATH } from '../constants/routes'

interface BroadcastDashboard {
  upcoming: UpcomingBroadcast
  past: PastBroadcast[]
  currentCursor: number
}

interface UpcomingBroadcast {
  id: number
  firstMessage: string
  secondMessage: string
  runAt: number
  delay: string
}

interface PastBroadcast {
  id: string
  runAt: number
  totalSent: number
  succesfullyDelivered: number
  failedDelivered: number
}

interface UpdateBroadcast {
  id: number
  firstMessage?: string
  secondMessage?: string
}

interface Params {
  pageParam?: number
}
const ITEMS_PER_PAGE = 5

const getPastBroadcasts = async ({ pageParam }: Params): Promise<AxiosResponse<BroadcastDashboard>> => {
  const cursor = pageParam ? `&cursor=${pageParam}` : ''
  return axios.get(`${BROADCAST_PATH}?limit=${ITEMS_PER_PAGE}${cursor}`)
}

const getBroadcastDashboard = async (): Promise<AxiosResponse<BroadcastDashboard>> =>
  axios.get(`${BROADCAST_PATH}`)

const updateBroadcast = async ({
  id,
  firstMessage,
  secondMessage
}: UpdateBroadcast): Promise<AxiosResponse<Broadcast>> =>
  axios.patch(`${BROADCAST_PATH}/${id}`, {
    firstMessage,
    secondMessage
  })

export { getBroadcastDashboard, updateBroadcast, getPastBroadcasts, ITEMS_PER_PAGE }
export type { UpdateBroadcast, UpcomingBroadcast, PastBroadcast }
