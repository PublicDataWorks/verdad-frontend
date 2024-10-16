import type React from 'react'
import { useNavigate } from 'react-router-dom'

interface SnippetBlockProps {
  id: string
  preview: string
  dateTime: string
  radioStation: string
  labels: { name: string; upvotes: number }[]
  commentCount: number
  onClick: () => void
}

const SnippetBlock: React.FC<SnippetBlockProps> = ({
  id,
  preview,
  dateTime,
  radioStation,
  labels,
  commentCount,
  onClick
}) => {
  const navigate = useNavigate()

  const handleSnippetClick = (event: React.MouseEvent) => {
    event.preventDefault()
    onClick()
    navigate(`/snippet/${id}`)
  }

  return (
    <div className='mb-4 cursor-pointer rounded-lg border p-4' onClick={handleSnippetClick}>
      <div className='mb-2 flex justify-between'>
        <span className='text-sm text-gray-500'>Snippet ID {id}</span>
      </div>
      <div className='flex'>
        <div className='flex-grow'>
          <h3 className='mb-2 text-lg font-semibold'>Preview</h3>
          <p className='mb-2 text-sm text-gray-600'>{preview}</p>
          <p className='text-xs text-gray-500'>
            {dateTime}, {radioStation}
          </p>
        </div>
        <div className='ml-4'>
          {labels.slice(0, 2).map(label => (
            <div key={label.name} className='mb-1 text-sm'>
              #{label.name}, {label.upvotes} upvotes
            </div>
          ))}
          <div className='mt-2 text-sm'>Comments: {commentCount}</div>
        </div>
      </div>
    </div>
  )
}

export default SnippetBlock
