import { Dialog, Transition } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import type { UpcomingBroadcast } from 'apis/broadcastApi'
import Spinner from 'components/Spinner'
import { useUpdateBroadcast } from 'hooks/broadcaster'
import { Fragment, type FC } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import DateUtils from 'utils/date'

interface BroadcastFormProps {
  broadcast: UpcomingBroadcast
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
      {
        onSuccess: () => {
          onClose()
        }
      }
    )
  }

  let warning = ''
  let note = ''
  if (DateUtils.diffInMinutes(broadcast.runAt) < 90) {
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
          <div className='fixed inset-0 bg-black/25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto text-white'>
          <div className='mt-36 flex items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'>
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-md bg-indigo-950 p-6 text-left align-middle shadow-xl transition-all'>
                <Dialog.Title as='h3' className='text-center text-lg font-medium leading-6'>
                  {isFirstMessage ? 'Edit conversation starter' : 'Edit second message'}
                </Dialog.Title>
                <div className='mt-2 text-sm'>
                  <p>{warning}</p>
                  <p>{note}</p>
                </div>
                <form className='rounded-md pt-4' onSubmit={handleSubmit(onSubmit)}>
                  <TextareaAutosize
                    className='w-full resize-none overflow-hidden bg-gray-900 italic'
                    {...register(isFirstMessage ? 'firstMessage' : 'secondMessage', { required: true })}
                  />
                  {(errors.firstMessage || errors.secondMessage) && <span>This field is required</span>}
                  <div className='mt-4 flex justify-end gap-x-4'>
                    <button
                      type='button'
                      className='w-44 min-h-10 rounded-md border border-white text-sm font-medium text-white hover:bg-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                      onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      type='submit'
                      disabled={!isDirty || !isValid || isPending}
                      className='w-44 min-h-10 rounded-md border border-white bg-sky-600 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 enabled:hover:bg-sky-900 disabled:cursor-none'>
                      {isPending && <Spinner />}
                      {isFirstMessage ? 'Save changes and delay the next batch' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default BroadcastForm
