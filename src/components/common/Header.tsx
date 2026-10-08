import React from 'react';
import { ShieldAlert, Compass } from 'lucide-react';
import { GPSStatusType } from '../../types';
import { GPSStatusBadge } from './GPSStatusBadge';

interface HeaderProps {
  gpsStatus: GPSStatusType;
  onEmergencyClick: () => void;
  onGPSClick: () => void;
  compact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gpsStatus,
  onEmergencyClick,
  onGPSClick,
  compact = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Brand title & institutional mark */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs">
            AEC
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 truncate leading-tight">
              Arunai Engineering College
            </h1>
            {!compact && (
              <span className="text-[11px] font-medium text-slate-500 leading-tight">
                Campus Navigation
              </span>
            )}
          </div>
        </div>

        {/* Zone 2 & 3: GPS Status & Emergency Action */}
        <div className="flex items-center gap-2 shrink-0">
          <GPSStatusBadge status={gpsStatus} onClick={onGPSClick} compact={compact} />

          <button
            type="button"
            onClick={onEmergencyClick}
            className="min-h-[38px] px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-lg flex items-center gap-1.5 transition-colors active:scale-95"
            aria-label="Emergency locations and assistance"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Emergency</span>
          </button>
        </div>
      </div>
    </header>
  );
};
