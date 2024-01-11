import axios from 'lib/axios'
import type { AxiosResponse } from 'axios'
import { BROADCASTER_PATH, BROADCASTERS_PATH } from '../constants/routes'

interface Broadcaster {
  id: number
  firstMessage: string
  secondMessage: string
  runAt: Date
  delay: string
  allowEdit: boolean
  noUsers: number
}

interface UpdateBroadcaster {
  id: number
  firstMessage: string
  secondMessage: string,
  delay: string
}

const getBroadcasters = async (): Promise<AxiosResponse<Broadcaster[]>> => axios.get(BROADCASTERS_PATH)

const updateBroadcaster = async ({
  id,
  firstMessage,
  secondMessage,
  delay
}: UpdateBroadcaster): Promise<AxiosResponse<Broadcaster>> => axios.post(`${BROADCASTER_PATH}/${id}`, {
    firstMessage,
    secondMessage,
    delay
  })

export { getBroadcasters, updateBroadcaster }
export type { Broadcaster, UpdateBroadcaster }
