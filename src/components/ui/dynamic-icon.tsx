// components/ui/dynamic-icon.tsx
import * as LucideIcons from 'lucide-react'

interface DynamicIconProps {
  name: string
  className?: string
}

const kebabToPascalCase = (str: string): string => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

export function DynamicIcon({ name, className = '' }: DynamicIconProps) {
  const pascalCaseName = kebabToPascalCase(name) as keyof typeof LucideIcons
  const Icon = LucideIcons[pascalCaseName] as React.ComponentType<{ className?: string }>
  return Icon ? <Icon className={className} /> : null
}
