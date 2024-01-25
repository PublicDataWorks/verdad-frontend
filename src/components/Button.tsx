import { FC } from 'react'

interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean,
  className?: string
}

const Button: FC<ButtonProps> = ({ text, onClick, disabled = false, className = '' }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full rounded-md bg-gray-900 py-3 font-semibold text-blue-600 ${className}`}
      disabled={disabled}>
      {text}
    </button>
  )
}

export default Button
