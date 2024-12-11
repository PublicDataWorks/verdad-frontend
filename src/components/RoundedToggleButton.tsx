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
    className={`rounded-full px-3 text-xs font-normal ${isActive ? 'text-text-primary bg-background-gray-lightest !border-border-gray-dark' : ''} ${icon ? 'flex items-center' : ''}`}
    onClick={onClick}>
    {icon ?? <span>{icon}</span>}
    {label}
  </Button>
)

export default RoundedToggleButton
