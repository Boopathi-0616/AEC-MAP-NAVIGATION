import React from 'react';
import { Place } from '../../types';
import { Navigation, Footprints, Clock, X, Info } from 'lucide-react';

interface NavigationSheetProps {
  place: Place | null;
  onStartNavigation: () => void;
  onViewDetails: (place: Place) => void;
  onClose: () => void;
}

export const NavigationSheet: React.FC<NavigationSheetProps> = ({
  place,
  onStartNavigation,
  onViewDetails,
  onClose,
}) => {
  if (!place) return null;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-30 p-3 pointer-events-none animate-in slide-in-from-bottom duration-250"
      role="region"
      aria-label={`Selected Destination Details for ${place.name}`}
    >
      <div
        className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-4 pointer-events-auto"
        role="dialog"
        aria-label={`Destination preview: ${place.name}`}
      >
        {/* Grab bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 leading-snug truncate">
              {place.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {place.building} {place.floor ? `· ${place.floor}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Dismiss destination and close preview"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Distance & Time unboxed metadata */}
        <div
          className="flex items-center gap-4 text-xs font-medium text-slate-700 bg-slate-50 rounded-xl px-3 py-2 mb-3.5 border border-slate-100"
          aria-label={`Distance is ${place.distanceMeters} metres, estimated walking time is ${place.walkTimeMinutes} minutes.`}
        >
          <div className="flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
            <span className="tabular-nums">{place.distanceMeters} m</span>
          </div>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
            <span className="tabular-nums">{place.walkTimeMinutes} min walk</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onStartNavigation}
            className="flex-1 min-h-[44px] bg-blue-900 hover:bg-blue-800 text-white font-medium text-sm rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1"
            aria-label={`Start turn-by-turn navigation to ${place.name}`}
          >
            <Navigation className="w-4 h-4 fill-white" aria-hidden="true" />
            <span>Start Navigation</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetails(place)}
            className="min-h-[44px] min-w-[44px] px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title="View Place Details"
            aria-label={`View full facilities and location details for ${place.name}`}
          >
            <Info className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
