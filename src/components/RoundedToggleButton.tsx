import type React from 'react';
import { Button } from "components/ui/button";

interface RoundedToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const RoundedToggleButton: React.FC<RoundedToggleButtonProps> = ({
  label,
  isActive,
  onClick,
  icon
}) => (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={`font-normal rounded-full px-3 text-xs ${isActive ? 'bg-primary text-primary-foreground' : ''} ${icon ? 'flex items-center' : ''}`}
      onClick={onClick}
    >
      {icon ?? <span>{icon}</span>}
      {label}
    </Button>
  );

export default RoundedToggleButton;
