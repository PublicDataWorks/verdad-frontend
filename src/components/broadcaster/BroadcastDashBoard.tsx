import { useState } from 'react'
import { useBroadcastDashboardQuery } from '../../hooks/broadcaster'
import BroadcastForm from './BroadcastForm'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import DateUtils from 'utils/date'

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
  const past = data.data.past.slice(1)
  const upcoming = data.data.upcoming

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
      <label htmlFor='firstMessage' className='mt-2 block text-lg font-bold'>
        Conversation starter
      </label>
      <p id='firstMessage' className='mt-2 bg-gray-900 italic'>
        {upcoming.firstMessage}
      </p>
      <button
        type='button'
        onClick={() => onEditClicked(true)}
        className='mt-px w-full rounded-md bg-gray-900 text-blue-400'>
        Edit
      </button>
      <label htmlFor='secondMessage' className='mt-2 block text-lg font-bold'>
        Second message <span className='font-normal italic'>{`(sent ${upcoming.delay} later if no reply)`}</span>
      </label>
      <p id='secondMessage' className='mt-2 bg-gray-900 italic'>
        {upcoming.secondMessage}
      </p>
      <button
        type='button'
        onClick={() => onEditClicked(false)}
        className='mt-px w-full rounded-md bg-gray-900 text-blue-400'>
        Edit
      </button>
      <hr className='mt-2	border border-white' />

      <div className='dropdown'>
        <div className='font-bold'>Past batches</div>
        {past.map(item => (
          <div className='flex rounded-md border px-2'>
            <FaCaretDown size={30} />
            <div key={item.id} className='flex items-center'>
              {DateUtils.format(item.runAt)}
            </div>
          </div>
        ))}
      </div>
      <BroadcastForm
        broadcast={upcoming}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        isFirstMessage={isFirstMessage!}
      />
    </div>
  )
}

export default BroadcastDashboard
