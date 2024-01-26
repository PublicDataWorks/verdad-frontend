import type { FC } from 'react'

interface ButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean,
  className?: string
}

const Button: FC<ButtonProps> = ({ text, onClick, disabled, className }) => (
    <button
      type="button"
      onClick={onClick}
      className={`${className} disabled:opacity-50 w-full rounded-md py-2 text-missive-blue-color disabled:cursor-not-allowed`}
      disabled={disabled}>
      {text}
    </button>
  )
Button.defaultProps = {
  className: '',
  disabled: false
}
export default Button
