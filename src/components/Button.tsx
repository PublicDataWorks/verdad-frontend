import type { FC } from 'react'

interface ButtonProps {
  children?: React.ReactNode
  text: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

const Button: FC<ButtonProps> = ({ children, text, onClick, disabled, className, ...props }) => (
  <button
    type='button'
    onClick={onClick}
    className={`${className} text-missive-blue-color w-full rounded-md py-3 disabled:cursor-not-allowed disabled:opacity-50`}
    disabled={disabled}
    {...props}
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
