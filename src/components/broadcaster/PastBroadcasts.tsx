import { useQueryClient } from '@tanstack/react-query'
import Button from 'components/Button'
import { usePastBroadcastsQuery } from 'hooks/broadcast'
import { Fragment, useEffect, useRef, useState } from 'react'
import { LiaCaretDownSolid } from 'react-icons/lia'
import DateUtils from 'utils/date'

const PastBroadcasts = () => {
  const queryClient = useQueryClient()
  const initialData = {
    pages: [queryClient.getQueryData(['broadcastDashboard'])],
    pageParams: [0]
  }
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = usePastBroadcastsQuery(initialData)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPages] = useState(0)

  useEffect(() => {
    console.log('asdadasdasd', data?.pages.length)
    // Run only once when hasNextPage go from true to false
    if (data?.pages.length) {
      setTotalPages(data.pages.length)
      setCurrentPages(data.pages.length)
    }
  }, [hasNextPage])

  const onButtonClick = () => {
    if (hasNextPage) {
      fetchNextPage()
      window.scrollTo(0, document.body.scrollHeight)
    } else {
      if (currentPage == totalPages) setCurrentPages(1)
      else {
        setCurrentPages(currentPage + 1)
        window.scrollTo(0, document.body.scrollHeight)
      }
    }
  }
  return (
    <>
      <h2 className='mb-6 mt-4 text-xl font-bold'>Past batches</h2>
      <div className='dropdown'>
        {data?.pages.slice(0, hasNextPage ? data?.pages.length : currentPage).map((group, i) => (
          <Fragment key={i}>
            {group.data.past.map(broadcast => (
              <div key={broadcast.id} className='bg-past-background flex rounded-md border py-4'>
                <LiaCaretDownSolid size={28} className='mx-2' />
                <div className='flex items-center text-lg'>{DateUtils.format(broadcast.runAt)}</div>
              </div>
            ))}
          </Fragment>
        ))}
        <Button
          text={
            isFetchingNextPage ? 'Loading more...' : hasNextPage || currentPage < totalPages ? 'Show more' : 'Collapse'
          }
          onClick={onButtonClick}
          disabled={isFetching}
        />
      </div>
    </>
  )
}

export default PastBroadcasts
