import React from 'react';
import { Crosshair, Radio, RefreshCw } from 'lucide-react';

interface LocateMeButtonProps {
  onClick: () => void;
  isTracking: boolean;
  isLoading?: boolean;
}

export const LocateMeButton: React.FC<LocateMeButtonProps> = ({
  onClick,
  isTracking,
  isLoading = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`glass-panel min-h-[46px] px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg border transition-all active:scale-95 group ${
        isTracking
          ? 'border-[#C9A45C] text-[#651C32] bg-[#FFFDF8]/95'
          : 'border-[#E8DFD3] text-[#241B1E] hover:border-[#651C32]/40 bg-[#FFFDF8]/90'
      }`}
      title="Locate my position and start live GPS tracking"
      aria-label="Locate Me: Find current position on campus and begin live tracking"
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
          isTracking
            ? 'bg-[#651C32] text-white shadow-xs'
            : 'bg-[#F7F1E5] text-[#651C32] group-hover:bg-[#651C32] group-hover:text-white'
        }`}
      >
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : isTracking ? (
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#C9A45C]" />
        ) : (
          <Crosshair className="w-4 h-4" />
        )}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-bold tracking-wider uppercase text-[#651C32]">
          LOCATE ME
        </span>
        <span className="text-[10px] text-[#75666A] font-medium leading-none">
          {isTracking ? 'Live GPS Active' : 'Find My Position'}
        </span>
      </div>
    </button>
  );
};
