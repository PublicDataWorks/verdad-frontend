import { useState } from 'react'
import { useBroadcastDashboardQuery } from '../../hooks/broadcaster'
import BroadcastForm from './BroadcastForm'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import DateUtils from 'utils/date'

const BroadcastDashboard = () => {
  const { data, isPending } = useBroadcastDashboardQuery()
  const [isOpen, setIsOpen] = useState(false)

  if (isPending || !data?.data) {
    return <span>Loading...</span>
  }
  const onPastBatchesClick = () => setIsOpen(!isOpen)
  const [latestBatch] = data.data.past
  const past = data.data.past.slice(1)

  return (
    <div className='container mx-auto w-[26rem]'>
      <div className='rounded-lg'>
        <div className='pb-4 text-lg font-bold'>Most recent batch sent on {DateUtils.format(latestBatch.runAt)}</div>
        <div>Total sent: {latestBatch.totalSent}</div>
        <div>Delivered successfully: {latestBatch.succesfullyDelivered}</div>
        <div>Failed to deliver: {latestBatch.failedDelivered}</div>
      </div>
      <hr className='mt-2	border border-white' />
      <BroadcastForm key={`broadcast-form-${data.data.upcoming.id}`} broadcast={data.data.upcoming} />
      <hr className='border	border-white' />
      <div className='dropdown'>
        <div className='flex'>
          {isOpen ? <FaCaretDown size={30} /> : <FaCaretUp size={30} />}
          <button type='button' className='h-8 font-bold' onClick={onPastBatchesClick}>
            Past batches
          </button>
        </div>
        {!!isOpen && (
          <div>
            {past.map(item => (
              <div key={item.id} className='px-6'>
                {DateUtils.format(item.runAt)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BroadcastDashboard
