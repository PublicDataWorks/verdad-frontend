import axios from 'lib/axios'
import type { AxiosResponse } from 'axios'
import { BROADCAST_PATH } from '../constants/routes'

interface BroadcastDashboard {
  upcoming: Broadcast
  past: PastBroadcast[]
  currentCursor: number
}

interface Broadcast {
  id: number
  runAt: number
  firstMessage: string
  secondMessage: string
  delay: string
}

interface PastBroadcast {
  id: number
  runAt: number
  totalSent: number
  succesfullyDelivered: number
  failedDelivered: number
}

interface UpdateBroadcast {
  id: number
  firstMessage?: string
  secondMessage?: string
  runAt?: number
}

interface Params {
  pageParam?: number
}
const ITEMS_PER_PAGE = 4

const getPastBroadcasts = async ({ pageParam }: Params): Promise<AxiosResponse<BroadcastDashboard>> => {
  const cursor = pageParam ? `&cursor=${pageParam}` : ''
  return axios.get(`${BROADCAST_PATH}?limit=${ITEMS_PER_PAGE}${cursor}`)
}

const getBroadcastDashboard = async (): Promise<AxiosResponse<BroadcastDashboard>> => axios.get(`${BROADCAST_PATH}?limit=${ITEMS_PER_PAGE}`)

const updateBroadcast = async ({
  id,
  firstMessage,
  secondMessage,
  runAt
}: UpdateBroadcast): Promise<AxiosResponse<Broadcast>> =>
  axios.patch(`${BROADCAST_PATH}/${id}`, {
    firstMessage,
    secondMessage,
    runAt
  })

export { getBroadcastDashboard, updateBroadcast, getPastBroadcasts, ITEMS_PER_PAGE }
export type { UpdateBroadcast, Broadcast, PastBroadcast }
