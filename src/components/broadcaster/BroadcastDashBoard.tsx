import { useState } from 'react'
import BroadcastForm from './BroadcastForm'
import DateUtils from 'utils/date'
import Button from 'components/Button'
import { useBroadcastDashboardQuery } from 'hooks/broadcast'
import PastBroadcasts from './PastBroadcasts'

const BroadcastDashboard = () => {
  const { data, isPending } = useBroadcastDashboardQuery()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  // Which message is being edited?
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>()

  const onEditClicked = (isFirstMessage: boolean) => {
    setIsPopupOpen(true)
    setIsFirstMessage(isFirstMessage)
  }

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }

  const [latestBatch] = data.data.past
  const { upcoming } = data.data

  return (
    <div className='container mx-auto w-[30rem]'>
      <div className='rounded-md'>
        <div className='pb-4 text-lg font-bold'>Most recent batch sent on {DateUtils.format(latestBatch.runAt)}</div>
        <ul>
          <li>Total sent: {latestBatch.totalSent}</li>
          <li>Delivered successfully: {latestBatch.succesfullyDelivered}</li>
          <li>Failed to deliver: {latestBatch.failedDelivered}</li>
        </ul>
      </div>

      <hr className='mt-2	border border-white' />

      <div className='mt-4 font-bold'>Next batch scheduled to send on {DateUtils.format(upcoming.runAt)}</div>
      <label htmlFor='firstMessage' className='my-4 block text-lg font-bold'>
        Conversation starter
      </label>
      <p id='firstMessage' className='bg-upcoming-background px-3 py-4 italic'>
        Morning! Im Kate at Outlier Media, a local news nonprofit in Detroit that can help you get resources or
        information about things happening in the city. Need help or just curious? Try typing a keyword like “housing”
        or “food” and well share some info.
      </p>
      <Button text='edit' className='bg-upcoming-background mt-px' onClick={() => onEditClicked(true)} />

      <label htmlFor='secondMessage' className='my-4 block text-lg font-bold'>
        Second message <span className='font-normal italic'>{`(sent ${upcoming.delay} later if no reply)`}</span>
      </label>
      <p id='secondMessage' className='bg-upcoming-background px-3 py-4 italic'>
        Morning! Im Kate at Outlier Media, a local news nonprofit in Detroit that can help you get resources or
        information about things happening in the city. Need help or just curious? Try typing a keyword like “housing”
        or “food” and well share some info.
      </p>
      <Button text='edit' className='bg-upcoming-background mt-px' onClick={() => onEditClicked(false)} />
      
      <BroadcastForm
        key={upcoming.id}
        broadcast={upcoming}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        isFirstMessage={isFirstMessage!}
      />
      <hr className='mt-2	border border-gray-500' />

      <PastBroadcasts />
    </div>
  )
}

export default BroadcastDashboard
