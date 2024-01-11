import React from 'react'
import { useForm } from 'react-hook-form'
import { useUpdateBroadcaster } from '../../hooks/broadcaster'
import {
  Broadcaster,
  UpdateBroadcaster
} from '../../apis/broadcaster'
import './BroadcasterComponent.scss'
import { ErrorMessage } from '@hookform/error-message'
import { useQueryClient } from '@tanstack/react-query'


const BroadcasterComponent = (broadcaster: Broadcaster) => {
  const queryClient = useQueryClient()
  const { mutate, isSuccess,  } = useUpdateBroadcaster(queryClient)
  const onSubmit = (data) => {
    const delay = `${data.hours}:${data.minutes}:${data.seconds}`
    mutate({ ...data, id: broadcaster.id, delay })
  }
  const parseTime = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(':')
    return { hours, minutes, seconds }
  }
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstMessage: broadcaster.firstMessage,
      secondMessage: broadcaster.secondMessage,
      ...parseTime(broadcaster.delay)
    }
  })
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <label>First message</label>
      <input {...register('firstMessage', {
        required: 'This field is required'
      })}
             defaultValue={broadcaster.firstMessage} />
      <ErrorMessage errors={errors} name="firstMessage" as="p" />

      <label>Second message</label>
      <input
        {...register('secondMessage', { required: 'This field is required' })}
        defaultValue={broadcaster.secondMessage} />
      <ErrorMessage errors={errors} name="secondMessage" as="p" />

      <label>Delay</label>
      <select {...register('hours', { required: 'This field is required' })}>
        {Array.from({ length: 24 }, (_, i) => i).map((val) =>
          <option key={val}
                  value={val < 10 ? `0${val}` : val}>{val < 10 ? `0${val}` : val}</option>
        )}
      </select>
      <select {...register('minutes', { required: 'This field is required' })}>
        {Array.from({ length: 60 }, (_, i) => i).map((val) =>
          <option key={val}
                  value={val < 10 ? `0${val}` : val}>{val < 10 ? `0${val}` : val}</option>
        )}
      </select>
      <select {...register('seconds', { required: 'This field is required' })}>
        {Array.from({ length: 60 }, (_, i) => i).map((val) =>
          <option key={val}
                  value={val < 10 ? `0${val}` : val}>{val < 10 ? `0${val}` : val}</option>
        )}
      </select>
      <ErrorMessage errors={errors} name="delay" as="p" />

      {isSuccess ? <div>Update successful!</div> : null}
      <input type="submit" />
    </form>
  )
}

export default BroadcasterComponent
