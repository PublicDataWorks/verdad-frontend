import React from 'react';
import { Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeaderBar: React.FC = () => {
  return (
    <header className="bg-[#E8F1FF] flex items-center justify-between px-8 py-2 border-b border-[#005EF4]">
      <div
        className="font-inter text-[23.33px] font-bold leading-[28px] tracking-[0.05em] text-transparent bg-clip-text py-2"
        style={{
          backgroundImage: 'linear-gradient(93.84deg, #337EF4 5.92%, #005EF4 73.07%)',
        }}
      >
        VERDAD
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
          <Moon className="h-6 w-6 text-[#005EF4]" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
          <User className="h-6 w-6 text-[#005EF4]" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
          <div className="h-6 w-6 bg-[#005EF4] rounded-full flex items-center justify-center text-white text-xs">
            AV
          </div>
        </Button>
      </div>
    </header>
  );
};

export default HeaderBar;