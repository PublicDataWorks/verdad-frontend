import type { UpcomingBroadcast } from 'apis/broadcaster'
import type { FC } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import DateUtils from 'utils/date'

interface BroadcastFormProps {
  broadcast: UpcomingBroadcast
}

interface IFormInput {
  firstMessage: string
  secondMessage: string
}

const BroadcastForm: FC<BroadcastFormProps> = ({ broadcast }) => {
  const { register, handleSubmit } = useForm<IFormInput>({
    defaultValues: {
      firstMessage: broadcast.firstMessage,
      secondMessage: broadcast.secondMessage
    }
  })
  const onSubmit: SubmitHandler<IFormInput> = _data => {}

  return (
    <>
      <div className='mt-4 font-bold'>Next batch scheduled to send on {DateUtils.format(broadcast.runAt)}</div>
      <form className='rounded-lg pt-4' onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor='firstMessage' className='mt-2 block text-lg font-bold'>
          Conversation starter
        </label>
        <div className='mt-2 border border-white p-2'>
          <TextareaAutosize
            id='firstMessage'
            className='w-full resize-none overflow-hidden italic'
            {...register('firstMessage', { required: true })}
          />
        </div>
        <label htmlFor='secondMessage' className='mt-6 block text-lg'>
          <span className='font-bold'>Second message</span> {`(sent ${broadcast.delay} later if no reply)`}
        </label>
        <div className='mt-2 border border-white p-2'>
          <TextareaAutosize
            id='secondMessage'
            className='w-full resize-none overflow-hidden italic'
            {...register('secondMessage', { required: true })}
          />
        </div>
        <div className='flex justify-end py-2'>
          <button type='button' >Save</button>
        </div>
      </form>
    </>
  )
}

export default BroadcastForm
