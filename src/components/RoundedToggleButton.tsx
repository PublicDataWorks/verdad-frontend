import type React from 'react'
import { Button } from './ui/button'

interface RoundedToggleButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  icon?: React.ReactNode
}

const RoundedToggleButton: React.FC<RoundedToggleButtonProps> = ({ label, isActive, onClick, icon }) => (
  <Button
    variant={isActive ? 'default' : 'outline'}
    size='sm'
    className={`rounded-full px-3 text-xs font-normal ${isActive ? 'border border-solid border-text-primary bg-background-gray-darkest text-background-gray-lightest' : ''} ${icon ? 'flex items-center' : ''}`}
    onClick={onClick}
  >
    {icon ?? <span>{icon}</span>}
    {label}
  </Button>
)

export default RoundedToggleButton
