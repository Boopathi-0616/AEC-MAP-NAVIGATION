import React from 'react';
import { Place } from '../../types';
import { Navigation, Footprints, Clock, X, Info, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface DestinationCardProps {
  place: Place | null;
  onStartNavigation: () => void;
  onViewDetails: (place: Place) => void;
  onClose: () => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  place,
  onStartNavigation,
  onViewDetails,
  onClose,
}) => {
  if (!place) return null;

  const isOpen = place.status !== 'closed';
  const isMaintenance = place.status === 'maintenance';
  const isBusy = place.status === 'busy' || place.status === 'temporarily-closed';

  return (
    <div
      role="region"
      aria-label={`Selected destination card for ${place.name}`}
      className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-3 duration-250 select-none min-w-0 box-border"
    >
      <div className="glass-panel rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-[#C9A45C]/35 relative w-full max-w-full min-w-0 box-border overflow-hidden">
        {/* Subtle Gold Accent Bar */}
        <div className="w-10 h-1 bg-[#C9A45C] rounded-full mx-auto mb-2.5 opacity-80" />

        <div className="flex items-start justify-between gap-2.5 mb-2.5 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#C9A45C] block">
                DESTINATION SELECTED
              </span>

              {/* Status Badge */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase ${
                  isOpen
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : isMaintenance
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-200 text-stone-800 border border-stone-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOpen ? 'bg-[#2FA66A]' : isMaintenance ? 'bg-amber-500' : 'bg-stone-500'
                  }`}
                />
                <span>{place.status?.replace('-', ' ') || 'OPEN'}</span>
              </span>

              {/* Crowd Density Badge */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase ${
                  place.crowdLevel === 'high'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : place.crowdLevel === 'medium'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    place.crowdLevel === 'high'
                      ? 'bg-[#651C32] animate-ping'
                      : place.crowdLevel === 'medium'
                      ? 'bg-[#C9A45C]'
                      : 'bg-[#2FA66A]'
                  }`}
                />
                <span>{place.crowdLevel?.toUpperCase() || 'LOW'} CROWD</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-[#651C32] leading-tight truncate font-sans">
              {place.name.toUpperCase()}
            </h3>
            <p className="text-xs text-[#75666A] font-medium truncate mt-0.5">
              {place.building} {place.floor ? `· ${place.floor}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F7F1E5] hover:bg-[#651C32]/10 text-[#75666A] hover:text-[#241B1E] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss destination"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Temporary Notice from Admin if active */}
        {place.temporaryNotice && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-900">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="text-[11px] font-medium truncate">{place.temporaryNotice}</span>
          </div>
        )}

        {/* Crowd Recommendation Tip */}
        {place.crowdRecommendation && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-[#F7F1E5] border border-[#E8DFD3] flex items-center gap-2 text-xs text-[#651C32]">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
            <span className="text-[11px] font-medium truncate">
              {place.crowdRecommendation}
            </span>
          </div>
        )}

        {/* Distance, Walking Time & Hours Metadata */}
        <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-2xl bg-[#F7F1E5]/70 border border-[#E8DFD3] mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#651C32]/10 flex items-center justify-center shrink-0">
              <Footprints className="w-3.5 h-3.5 text-[#651C32]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-semibold text-[#75666A] block">Distance</span>
              <span className="text-xs font-bold text-[#241B1E] tabular-nums truncate block">
                {place.distanceMeters} m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#C9A45C]/20 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#651C32]" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-semibold text-[#75666A] block">Walk</span>
              <span className="text-xs font-bold text-[#241B1E] tabular-nums truncate block">
                {place.walkTimeMinutes} min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-semibold text-[#75666A] block">Hours</span>
              <span className="text-[11px] font-bold text-[#241B1E] tabular-nums truncate block">
                {place.openingTime || '08:00'} - {place.closingTime || '17:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Start Navigation Button in Deep Maroon with Gold Icon */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartNavigation}
            className="flex-1 min-h-[44px] bg-gradient-to-r from-[#651C32] to-[#461323] hover:from-[#461323] hover:to-[#651C32] text-white font-bold text-xs tracking-wider uppercase rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg border border-[#C9A45C]/40 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#C9A45C] fill-[#C9A45C] shrink-0" />
            <span className="truncate">START NAVIGATION</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetails(place)}
            className="min-h-[44px] px-3.5 rounded-2xl bg-[#F7F1E5] hover:bg-[#E8DFD3] text-[#651C32] text-xs font-semibold flex items-center justify-center border border-[#E8DFD3] transition-colors cursor-pointer"
            title="View Place Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
