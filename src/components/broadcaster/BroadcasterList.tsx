import { useEffect, useState } from 'react'
import { useBroadcastersQuery } from '../../hooks/broadcaster'
import type { Broadcaster } from '../../apis/broadcaster'
import BroadcasterComponent from './BroadcasterComponent'

const BroadcasterList = () => {
  const { data } = useBroadcastersQuery()
  const [selected, setSelected] = useState<Broadcaster>()

  useEffect(() => {
    if (!selected && data?.data.length) {
      setSelected(data.data[0])
    }
  }, [data])

  const onClick = (broadcaster: Broadcaster) => {
    setSelected(broadcaster)
  }

  return (
    <div className='tabs-container'>
      <div className='columns-middle'>
        <div className='tabs light-box columns'>
          {data?.data.map(broadcaster => (
            <div
              key={broadcaster.id}
              onClick={() => onClick(broadcaster)}
              className={`tab ${broadcaster.id === selected?.id ? 'tab--selected' : ''}`}>
              <span>{broadcaster.firstMessage}</span>
            </div>
          ))}
        </div>
      </div>

      {selected ? <BroadcasterComponent key={String(selected.id)} {...selected} /> : null}
    </div>
  )
}

export default BroadcasterList
