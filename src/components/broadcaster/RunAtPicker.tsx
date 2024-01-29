import AppDialog from 'components/AppDialog'
import { type FC, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import DateUtils from 'utils/date'
import 'react-day-picker/dist/style.css'
import Button from 'components/Button'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateBroadcast } from 'hooks/broadcast'
import Spinner from 'components/Spinner'

interface RunAtPickerProps {
  isOpen: boolean
  runAt: number
  broadcastId: number
  onClose: () => void
}

const RunAtPicker: FC<RunAtPickerProps> = ({ isOpen, onClose, runAt, broadcastId }) => {
  const originalRunAt = new Date(runAt * 1000)
  // Keep date part, remove time part, so only date can change.
  const originalRunAtDate = new Date(originalRunAt.toDateString())
  const [selectedDate, setSelectedDate] = useState(originalRunAtDate)
  const queryClient = useQueryClient()
  const { mutate, isPending } = useUpdateBroadcast(queryClient)
  const onCloseWrapper = () => !isPending && onClose()
  const onPause = () => {
    const timeUnix = originalRunAt.getHours() * 60 * 60 + originalRunAt.getMinutes() * 60 + originalRunAt.getSeconds()
    mutate(
      {
        id: broadcastId,
        runAt: Math.floor((selectedDate.getTime() + timeUnix * 1000) / 1000)
      },
      { onSuccess: onClose }
    )
  }
  const footer = (
    <>
      <style>{`.rdp { margin-bottom: 0}`}</style>
      <p className='pt-2'>Next batch will send on</p>
      <p>{DateUtils.formatDate(selectedDate)}</p>
      <hr className='mx-[-1rem]	mt-2 border border-gray-500' />
      <Button
        text='Pause batch schedule'
        className='bg-missive-conversation-list-background-color disabled:cursor-not-allowed disabled:opacity-50'
        onClick={onPause}
        disabled={isPending || selectedDate.getTime() === originalRunAtDate.getTime()}
      >
        {isPending ? <Spinner /> : null}
      </Button>
    </>
  )
  const today = new Date()
  const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return (
    <AppDialog isOpen={isOpen} onClose={onCloseWrapper} className='w-fit p-0'>
      <DayPicker
        mode='single'
        fromDate={new Date()}
        toDate={oneWeekLater}
        selected={selectedDate}
        onSelect={newDate => newDate && setSelectedDate(newDate)}
        footer={footer}
      />
    </AppDialog>
  )
}

export default RunAtPicker
