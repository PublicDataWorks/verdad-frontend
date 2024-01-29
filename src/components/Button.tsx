import type { FC } from 'react'

interface ButtonProps {
  children?: React.ReactNode
  text: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

const Button: FC<ButtonProps> = ({ children, text, onClick, disabled, className }) => (
  <button
    type='button'
    onClick={onClick}
    className={`${className} w-full rounded-md py-3 text-missive-blue-color disabled:cursor-not-allowed disabled:opacity-50`}
    disabled={disabled}
  >
    {children}
    {text}
  </button>
)
Button.defaultProps = {
  children: null,
  className: '',
  disabled: false
}
export default Button
