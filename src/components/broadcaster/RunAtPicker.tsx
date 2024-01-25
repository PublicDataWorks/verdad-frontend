import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import DateUtils from 'utils/date'

const RunAtPicker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const onPickADate = (newDate?: Date) => newDate && setSelectedDate(newDate)
  return (
    <DayPicker
      mode='single'
      selected={selectedDate}
      onSelect={onPickADate}
      footer={`Next batch will send on ${DateUtils.formatDate(selectedDate)}`}
    />
  )
}

export default RunAtPicker;
