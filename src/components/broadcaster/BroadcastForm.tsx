import { useQueryClient } from '@tanstack/react-query'
import type { Broadcast } from 'apis/broadcastApi'
import AppDialog from 'components/AppDialog'
import Spinner from 'components/Spinner'
import { useUpdateBroadcast } from 'hooks/broadcast'
import type { FC } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import DateUtils from 'utils/date'

interface BroadcastFormProps {
  broadcast: Broadcast
  isOpen: boolean
  onClose: () => void
  isFirstMessage: boolean
}

interface IFormInput {
  firstMessage: string
  secondMessage: string
}

const BroadcastForm: FC<BroadcastFormProps> = ({ broadcast, isOpen, onClose, isFirstMessage }) => {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useUpdateBroadcast(queryClient)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm<IFormInput>({
    defaultValues: {
      firstMessage: broadcast.firstMessage,
      secondMessage: broadcast.secondMessage
    },
    mode: 'onChange'
  })
  const onSubmit: SubmitHandler<IFormInput> = data => {
    const updated = isFirstMessage ? { firstMessage: data.firstMessage } : { secondMessage: data.secondMessage }
    mutate(
      {
        id: broadcast.id,
        ...updated
      },
      { onSuccess: onClose }
    )
  }
  const onCloseWrapper = () => !isPending && onClose()

  let warning = ''
  let note = ''
  let saveBtnText = 'Save changes'
  if (DateUtils.diffInMinutes(broadcast.runAt) < 90) {
    saveBtnText = 'Save changes and delay the next batch'
    warning = `The next batch is scheduled to send less than 90 minutes from now.
    Making these message updates will delay today's batch by 2-3 hours, sending at approximately ${DateUtils.advance(90)}
    instead of ${DateUtils.format(broadcast.runAt)}. These changes will also apply to all future batches.`
    if (!isFirstMessage) {
      note = `Note: second messages are sent 10 minutes after the conversation starter,
      only if the recipient does not reply to the starter message.`
    }
  } else {
    note = isFirstMessage
      ? 'Note: these updates will apply to all future batches.'
      : `Note: these updates will apply to all future batches. Second messages are sent 10 minutes
      after the conversation starter, only if the recipient does not reply to the starter message.`
  }
  const title = isFirstMessage ? 'Edit conversation starter' : 'Edit second message'

  return (
    <AppDialog isOpen={isOpen} onClose={onCloseWrapper} title={title} className='w-full'>
      <>
        <div className='px-4 text-center'>
          <p>{warning}</p>
          <p>{note}</p>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form className='mx-8 mb-4 rounded-md pt-4' onSubmit={handleSubmit(onSubmit)}>
          {/* eslint-disable react/jsx-props-no-spreading */}
          <TextareaAutosize
            className='w-full resize-none overflow-hidden bg-missive-background-color p-2 italic'
            {...register(isFirstMessage ? 'firstMessage' : 'secondMessage', { required: true })}
          />
          {errors.firstMessage ?? errors.secondMessage ? <span>This field is required</span> : null}
          <div className='mt-4 flex justify-end gap-x-4'>
            <button
              type='button'
              className='select-none rounded-[6px] border bg-black bg-missive-background-color px-10 py-2 font-medium'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!isDirty || !isValid || isPending}
              className='button w-40 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isPending ? <Spinner /> : null}
              {saveBtnText}
            </button>
          </div>
        </form>
      </>
    </AppDialog>
  )
}

export default BroadcastForm
