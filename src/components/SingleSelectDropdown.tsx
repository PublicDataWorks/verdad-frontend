import type React from 'react';
import { useState } from 'react';

import PropTypes from 'prop-types';
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface SingleSelectDropdownProps {
  selectedItem?: string;
  items: string[];
  onItemSelect: (item: string) => void;
}

const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  selectedItem,
  items,
  onItemSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (item: string) => (event: Event) => {
    event.preventDefault();
    onItemSelect(item);
    setIsOpen(false); // Close the dropdown
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" aria-label={`Select item`}>
          <span className="text-dropdown-text font-normal"> {selectedItem} </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {items.map((item) => (
          <DropdownMenuItem
            key={item}
            onSelect={handleItemClick(item)}
            className={selectedItem === item ? "bg-accent" : ""}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

SingleSelectDropdown.propTypes = {
  selectedItem: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  onItemSelect: PropTypes.func.isRequired,
};

export default SingleSelectDropdown;
