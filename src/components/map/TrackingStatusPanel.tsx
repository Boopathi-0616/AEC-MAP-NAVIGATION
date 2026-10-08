import React from 'react';
import { Radio, Navigation, ShieldCheck } from 'lucide-react';

interface TrackingStatusPanelProps {
  isTracking: boolean;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
}

export const TrackingStatusPanel: React.FC<TrackingStatusPanelProps> = ({
  isTracking,
  accuracy,
  speed,
  heading,
}) => {
  if (!isTracking) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-panel rounded-2xl px-3.5 py-2.5 shadow-lg border border-[#C9A45C]/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 select-none"
    >
      {/* Pulsing Green Live Tracking Icon */}
      <div className="relative flex items-center justify-center w-3 h-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FA66A] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2FA66A]" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#651C32]">
            LIVE LOCATION
          </span>
          <span className="text-[10px] text-[#C9A45C]">·</span>
          <span className="text-[10px] font-semibold text-[#2FA66A]">
            Active
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#75666A] font-medium mt-0.5">
          <span>Accuracy: ±{accuracy || 10} m</span>
          {speed !== null && speed > 0 && (
            <>
              <span>·</span>
              <span>Speed: {speed} km/h</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
