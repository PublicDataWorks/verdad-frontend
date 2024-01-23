import { useRef, useState } from 'react'
import { useBroadcastDashboardQuery } from '../../hooks/broadcaster'
import BroadcastForm from './BroadcastForm'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import DateUtils from 'utils/date'

const BroadcastDashboard = () => {
  const { data, isPending } = useBroadcastDashboardQuery()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  if (isPending || !data) {
    return <span>Loading...</span>
  }

  return (
    <div className='container mx-auto w-[26rem]'>
      <div className='rounded-lg'>
        <div className='pb-4 text-lg font-bold'>Most recent batch sent on {DateUtils.format(data.data.past[0]?.runAt)}</div>
        <div>Total sent: {data.data.past[0].totalSent}</div>
        <div>Delivered successfully: {data.data.past[0].succesfullyDelivered}</div>
        <div>Failed to deliver: {data.data.past[0].failedDelivered}</div>
      </div>
      <hr className='border	border-white mt-2' />
      <BroadcastForm key={`broadcast-form-${1}`} broadcast={data.data.upcoming} />
      <hr className='border	border-white' />
      <div className='dropdown' ref={dropdownRef}>
        <div className='flex'>
          {isOpen ? <FaCaretDown size={30} /> : <FaCaretUp size={30} />}
          <button className='h-8 font-bold' onClick={() => setIsOpen(!isOpen)}>
            Past batches
          </button>
        </div>
        {isOpen && (
          <div>
            {data.data.past.map(item => (
              <div key={item.id} className='px-6'>{DateUtils.format(item.runAt)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BroadcastDashboard
