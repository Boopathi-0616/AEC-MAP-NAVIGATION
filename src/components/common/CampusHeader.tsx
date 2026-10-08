import React from 'react';
import { ShieldAlert, Settings2 } from 'lucide-react';
import { GPSStatusType } from '../../types';

interface CampusHeaderProps {
  gpsStatus: GPSStatusType;
  isTracking: boolean;
  onEmergencyClick: () => void;
  onGPSClick: () => void;
  onAdminClick?: () => void;
  isAdmin?: boolean;
  compact?: boolean;
}

export const CampusHeader: React.FC<CampusHeaderProps> = ({
  gpsStatus,
  isTracking,
  onEmergencyClick,
  onGPSClick,
  onAdminClick,
  isAdmin = false,
}) => {
  const isGpsActive = gpsStatus === 'available' || isTracking;

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#FFFDF8]/95 backdrop-blur-xl border-b border-[#E8DFD3]/90 px-3 sm:px-4 py-2 sm:py-2.5 transition-all shadow-xs overflow-hidden box-border">
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 min-w-0 box-border">
        {/* Left Side / Mobile Top: Logo + Two-line College Name */}
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 w-full sm:w-auto">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Custom AEC Map/Wayfinding Geometric Logo */}
            <div
              onClick={onAdminClick}
              role="button"
              tabIndex={0}
              title={isAdmin ? 'Switch to Campus Editor' : 'Arunai Engineering College'}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#651C32] to-[#461323] border border-[#C9A45C]/40 flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <svg
                viewBox="0 0 32 32"
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A45C]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M 16 3 L 28 10 L 28 22 L 16 29 L 4 22 L 4 10 Z"
                  stroke="#C9A45C"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.6"
                />
                <path d="M 16 7 L 16 25" stroke="#FFFDF8" strokeWidth="2" />
                <path d="M 10 13 L 16 7 L 22 13" stroke="#C9A45C" strokeWidth="2" />
                <circle cx="16" cy="16" r="2.5" fill="#C9A45C" stroke="#FFFDF8" strokeWidth="1" />
              </svg>
              <div className="absolute -bottom-1 -right-1 px-1 bg-[#C9A45C] text-[#461323] text-[7px] sm:text-[8px] font-extrabold rounded-xs leading-none py-0.5 tracking-tighter">
                AEC
              </div>
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-[#241B1E] truncate leading-tight uppercase font-sans">
                ARUNAI ENGINEERING
                <span className="hidden sm:inline"> COLLEGE</span>
              </h1>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#651C32] truncate leading-tight">
                <span>Campus Navigation</span>
                <span className="text-[#C9A45C] hidden sm:inline">·</span>
                <span className="text-[#75666A] font-normal hidden sm:inline">Tiruvannamalai</span>
              </div>
            </div>
          </div>

          {/* Admin badge if active */}
          {isAdmin && (
            <button
              type="button"
              onClick={onAdminClick}
              className="px-2 py-0.5 rounded-lg bg-[#651C32] text-[#C9A45C] text-[9px] font-extrabold uppercase border border-[#C9A45C]/50 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Settings2 className="w-3 h-3" />
              <span>Editor</span>
            </button>
          )}
        </div>

        {/* Right Side / Mobile Subrow: [● Location Active] & [Emergency] buttons */}
        <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
          {/* Glossy Location Status Pill */}
          <button
            type="button"
            onClick={onGPSClick}
            className={`glass-pill px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 shrink-0 cursor-pointer ${
              isGpsActive
                ? 'border-emerald-300 text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100'
                : 'border-amber-300 text-amber-900 bg-amber-50/80 hover:bg-amber-100'
            }`}
            title="GPS Tracking Telemetry"
            aria-label={`GPS Status: ${isGpsActive ? 'Location Active' : 'Location Off'}`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                isGpsActive
                  ? 'bg-[#2FA66A] shadow-[0_0_6px_#2FA66A]'
                  : 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
              } ${isTracking ? 'animate-pulse' : ''}`}
            />
            <span className="tracking-tight whitespace-nowrap">
              {isGpsActive ? 'Location Active' : 'Location Off'}
            </span>
          </button>

          {/* Emergency Button */}
          <button
            type="button"
            onClick={onEmergencyClick}
            className="min-h-[28px] sm:min-h-[32px] px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white bg-[#651C32] hover:bg-[#461323] border border-[#C9A45C]/50 rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
            aria-label="Open emergency assistance"
          >
            <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C9A45C] shrink-0" />
            <span className="font-medium tracking-wide whitespace-nowrap">
              Emergency
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
