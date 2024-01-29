import { useQueryClient } from '@tanstack/react-query'
import Button from 'components/Button'
import { usePastBroadcastsQuery } from 'hooks/broadcast'
import { Fragment, useEffect, useRef, useState } from 'react'
import { LiaCaretDownSolid, LiaCaretUpSolid } from 'react-icons/lia'
import DateUtils from 'utils/date'

const PastBroadcasts = () => {
  const [selected, setSelected] = useState<number | undefined>()
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const queryClient = useQueryClient()
  const initialData = {
    pages: [queryClient.getQueryData(['broadcastDashboard'])],
    pageParams: [0]
  }
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePastBroadcastsQuery(initialData)
  let btnText = 'Collapse'
  if (isFetchingNextPage) {
    btnText = 'Loading more...'
  } else if (hasNextPage || currentPage < totalPages) {
    btnText = 'Show more'
  }
  useEffect(() => {
    // Run only once when hasNextPage go from true to false
    if (data?.pages.length) {
      setTotalPages(data.pages.length)
      setCurrentPage(data.pages.length)
    }
  }, [data])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data, currentPage])

  const onLoadMore = () => {
    if (hasNextPage) {
      void fetchNextPage()
    } else if (currentPage === totalPages) {
      setCurrentPage(1)
      setSelected(undefined)
    } else {
      setCurrentPage(currentPage + 1)
    }
  }
  const onSelect = (id: number) => (id === selected ? setSelected(undefined) : setSelected(id))

  return (
    <>
      <h2 className='mb-6 mt-5 font-bold'>Past batches</h2>
      <div className='dropdown'>
        {data?.pages.slice(0, hasNextPage ? data.pages.length : currentPage).map(group =>
          group.data.past.map(broadcast => (
            <Fragment key={broadcast.id}>
              <button
                key={broadcast.id}
                type='button'
                className='flex w-full rounded-md border bg-missive-light-border-color py-2'
                onClick={() => onSelect(broadcast.id)}
              >
                {selected === broadcast.id ? (
                  <LiaCaretUpSolid size={20} className='mx-2' />
                ) : (
                  <LiaCaretDownSolid size={19} className='mx-2' />
                )}
                <div className='flex items-center'>{DateUtils.format(broadcast.runAt)}</div>
              </button>
              {selected === broadcast.id && (
                <div className='mx-3 my-5 text-sm'>
                  <p className='font-bold'>
                    Total recipients: <span className='font-normal'>{broadcast.totalSent}</span>
                  </p>
                  <p className='mt-2 font-bold'>
                    Second messages sent: <span className='font-normal'>{broadcast.totalSent}</span>
                  </p>
                  <h3 className='mt-2 font-bold'>Conversation starter</h3>
                  <p id='firstMessage' className='bg-missive-background-color px-3 py-4 italic'>
                    {broadcast.firstMessage}
                  </p>
                  <h3 className='mt-2 font-bold'>Second message</h3>
                  <p id='secondMessage' className='bg-missive-background-color px-3 py-4 italic'>
                    {broadcast.secondMessage}
                  </p>
                </div>
              )}
            </Fragment>
          ))
        )}
        <Button
          text={btnText}
          onClick={onLoadMore}
          className='bg-missive-background-color py-3 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={isFetchingNextPage}
        />
      </div>
      <div ref={bottomRef} />
    </>
  )
}

export default PastBroadcasts
