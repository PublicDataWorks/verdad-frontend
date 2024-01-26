import { useState } from 'react'
import BroadcastForm from './BroadcastForm'
import DateUtils from 'utils/date'
import Button from 'components/Button'
import { useBroadcastDashboardQuery } from 'hooks/broadcast'
import PastBroadcasts from './PastBroadcasts'
import RunAtPicker from './RunAtPicker'

const BroadcastDashboard = () => {
  const { data, isPending } = useBroadcastDashboardQuery()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isRunAtPickerOpen, setIsRunAtPickerOpen] = useState(false)
  const [isFirstMessage, setIsFirstMessage] = useState<boolean>(true)

  const onEditClick = (isFirst: boolean) => {
    setIsPopupOpen(true)
    setIsFirstMessage(isFirst)
  }

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }

  const [latestBatch] = data.data.past
  const { upcoming } = data.data

  return (
    <div className='container w-[30rem] mt-16 mx-auto'>
      <div className='rounded-md'>
        <h2 className='font-bold'>Most recent batch sent on {DateUtils.format(latestBatch.runAt)}</h2>
        <ul className='pt-5'>
          <li>Total conversation starters sent: {latestBatch.totalSent}</li>
          <li>Second messages sent: {latestBatch.totalSent}</li>
          <li>Delivered successfully: {latestBatch.succesfullyDelivered}</li>
          <li>Failed to deliver: {latestBatch.failedDelivered}</li>
        </ul>
      </div>

      <hr className='border-gray-500 mt-2 border' />

      <h2 className='mt-3 font-bold'>
        Next batch scheduled to send on <span className='font-normal italic'>{DateUtils.format(upcoming.runAt)}</span>
      </h2>
      <button type='button' className='button bg-button-color mt-3' onClick={() => setIsRunAtPickerOpen(true)}>
        Pause batch schedule
      </button>
      <h3 className='mt-5 font-bold'>Conversation starter</h3>
      <p className='bg-missive-background-color mt-3 px-3 py-4 italic'>{upcoming.firstMessage}</p>
      <Button text='edit' className='bg-missive-background-color mt-px' onClick={() => onEditClick(true)} />

      <h3 className='mt-5 font-bold'>
        Second message <span className='font-normal italic'>{`(sent ${upcoming.delay} later if no reply)`}</span>
      </h3>
      <p className='bg-missive-background-color mt-3 px-3 py-4 italic'>{upcoming.secondMessage}</p>
      <Button text='edit' className='bg-missive-background-color mb-6 mt-px' onClick={() => onEditClick(false)} />

      <RunAtPicker
        isOpen={isRunAtPickerOpen}
        runAt={upcoming.runAt}
        broadcastId={upcoming.id}
        onClose={() => setIsRunAtPickerOpen(false)}
      />
      <BroadcastForm
        broadcast={upcoming}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        isFirstMessage={isFirstMessage}
      />
      <hr className='border border-gray-500' />

      <PastBroadcasts />
    </div>
  )
}

export default BroadcastDashboard
