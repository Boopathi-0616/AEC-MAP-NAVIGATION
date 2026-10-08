import React from 'react';
import { Plus, Minus, Compass, Crosshair, Volume2, VolumeX } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocateUser: () => void;
  compassRotation?: number;
  zoomLevel?: number;
  isVoiceGuidanceEnabled?: boolean;
  onToggleVoiceGuidance?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocateUser,
  compassRotation = 0,
  zoomLevel = 1,
  isVoiceGuidanceEnabled = false,
  onToggleVoiceGuidance,
}) => {
  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <div
      role="toolbar"
      aria-label="Map navigation and accessibility controls"
      className="flex flex-col gap-2 pointer-events-auto select-none"
    >
      {/* Voice Guidance / Audio Spoken Directions Accessibility Toggle */}
      {onToggleVoiceGuidance && (
        <button
          type="button"
          onClick={onToggleVoiceGuidance}
          className={`w-10 h-10 rounded-full border shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
            isVoiceGuidanceEnabled
              ? 'bg-[#651C32] border-[#C9A45C] text-[#C9A45C]'
              : 'glass-panel border-[#E8DFD3] text-[#75666A] hover:text-[#651C32]'
          }`}
          title={isVoiceGuidanceEnabled ? 'Mute spoken guidance' : 'Enable spoken guidance'}
          aria-label={
            isVoiceGuidanceEnabled
              ? 'Mute spoken guidance for turns'
              : 'Enable spoken audio guidance for turns'
          }
          aria-pressed={isVoiceGuidanceEnabled}
        >
          {isVoiceGuidanceEnabled ? (
            <Volume2 className="w-4 h-4 text-[#C9A45C]" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Compass Button */}
      <button
        type="button"
        onClick={onRecenter}
        className="glass-panel w-10 h-10 rounded-full border border-[#E8DFD3] text-[#651C32] shadow-md flex items-center justify-center hover:border-[#651C32]/40 active:scale-95 transition-all cursor-pointer"
        title="Reset North Orientation"
        aria-label={`Reset map orientation to North. Currently rotated ${Math.round(compassRotation)} degrees.`}
      >
        <Compass
          className="w-5 h-5 text-[#651C32] transition-transform duration-300"
          style={{ transform: `rotate(${-compassRotation}deg)` }}
        />
      </button>

      {/* Recenter & User Location */}
      <button
        type="button"
        onClick={onLocateUser}
        className="glass-panel w-10 h-10 rounded-full border border-[#E8DFD3] text-[#651C32] shadow-md flex items-center justify-center hover:border-[#651C32]/40 active:scale-95 transition-all cursor-pointer"
        title="Recenter Map View"
        aria-label="Center map view on entrance or user position"
      >
        <Crosshair className="w-5 h-5 text-[#651C32]" />
      </button>

      {/* Zoom Group */}
      <div
        role="group"
        aria-label="Map Zoom Controls"
        className="glass-panel flex flex-col rounded-full border border-[#E8DFD3] shadow-md overflow-hidden"
      >
        <button
          type="button"
          onClick={onZoomIn}
          className="w-10 h-10 flex items-center justify-center text-[#241B1E] hover:text-[#651C32] hover:bg-[#F7F1E5] active:bg-[#E8DFD3] transition-colors border-b border-[#E8DFD3] cursor-pointer"
          title="Zoom In"
          aria-label={`Zoom in map. Current zoom: ${zoomPercentage}%`}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="w-10 h-10 flex items-center justify-center text-[#241B1E] hover:text-[#651C32] hover:bg-[#F7F1E5] active:bg-[#E8DFD3] transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label={`Zoom out map. Current zoom: ${zoomPercentage}%`}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
