import React from 'react';
import { Place } from '../../types';
import {
  Navigation,
  Clock,
  Footprints,
  Building,
  Phone,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface PlaceDetailsProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (place: Place) => void;
}

export const PlaceDetails: React.FC<PlaceDetailsProps> = ({
  place,
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen || !place) return null;

  const isLocationOpen = place.status !== 'closed';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-t-3xl sm:rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 box-border">
        {/* Grab indicator on mobile */}
        <div className="w-10 h-1.5 bg-[#D8CEBD] rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 pt-3 sm:pt-5 pb-3 border-b border-[#E8DFD3] flex items-start justify-between gap-3 bg-[#F7F1E5]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold text-[#C9A45C] uppercase tracking-wider block">
                {place.category}
              </span>

              {/* Status pill */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isLocationOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {isLocationOpen ? 'OPEN' : 'CLOSED'}
              </span>

              {/* Crowd pill */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  place.crowdLevel === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : place.crowdLevel === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {place.crowdLevel?.toUpperCase() || 'LOW'} CROWD
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-[#651C32] leading-snug uppercase font-sans truncate">
              {place.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8DFD3] text-[#75666A] hover:text-[#241B1E] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close place details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Temporary Notice from Admin */}
          {place.temporaryNotice && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Campus Notice:</span>
                <span className="leading-relaxed">{place.temporaryNotice}</span>
              </div>
            </div>
          )}

          {/* Crowd Recommendation */}
          {place.crowdRecommendation && (
            <div className="p-3 rounded-2xl bg-[#F7F1E5] border border-[#E8DFD3] flex items-start gap-2.5 text-xs text-[#651C32]">
              <Sparkles className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Crowd Advisory:</span>
                <span className="leading-relaxed">{place.crowdRecommendation}</span>
              </div>
            </div>
          )}

          {/* Distance, Walk Time & Operating Hours */}
          <div className="grid grid-cols-3 gap-2.5 bg-[#FAF6EE] rounded-2xl p-3 border border-[#E8DFD3]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[#651C32]/10 text-[#651C32] flex items-center justify-center shrink-0">
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-[#75666A] font-semibold block uppercase">
                  Distance
                </span>
                <span className="text-xs font-bold text-[#241B1E] tabular-nums truncate block">
                  {place.distanceMeters} m
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[#C9A45C]/20 text-[#651C32] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-[#75666A] font-semibold block uppercase">
                  Walking Time
                </span>
                <span className="text-xs font-bold text-[#241B1E] tabular-nums truncate block">
                  {place.walkTimeMinutes} min
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-[#75666A] font-semibold block uppercase">
                  Hours
                </span>
                <span className="text-[11px] font-bold text-[#241B1E] tabular-nums truncate block">
                  {place.openingTime || '08:00'} - {place.closingTime || '17:00'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#651C32] uppercase tracking-wider mb-1">
              About Location
            </h3>
            <p className="text-xs sm:text-sm text-[#241B1E] leading-relaxed">
              {place.shortDescription}
            </p>
          </div>

          {/* Building & Floor details */}
          <div className="flex items-start gap-2.5 text-xs text-[#241B1E] bg-[#FAF6EE] rounded-xl p-3 border border-[#E8DFD3]">
            <Building className="w-4 h-4 text-[#651C32] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block">{place.building}</span>
              <span className="text-[#75666A]">{place.floor || 'Ground Level'}</span>
            </div>
          </div>

          {/* Amenities Checklist */}
          {place.amenities && place.amenities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#651C32] uppercase tracking-wider mb-2">
                Facility Amenities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {place.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-[#241B1E] bg-white rounded-lg p-2 border border-[#E8DFD3]"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#2FA66A] shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact phone if available */}
          {place.contactPhone && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E8DFD3]">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-[#651C32]" />
                <span className="text-[#75666A]">Campus Desk:</span>
                <span className="font-bold">{place.contactPhone}</span>
              </div>
              <a
                href={`tel:${place.contactPhone.replace(/\s+/g, '')}`}
                className="text-xs font-bold text-[#651C32] hover:underline"
              >
                Call
              </a>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-[#E8DFD3] bg-[#FAF6EE]">
          <button
            type="button"
            onClick={() => onNavigate(place)}
            className="w-full min-h-[46px] bg-[#651C32] hover:bg-[#461323] text-white font-bold text-xs uppercase tracking-wider rounded-2xl px-5 py-3 flex items-center justify-center gap-2 shadow-md border border-[#C9A45C]/40 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#C9A45C]" />
            <span>Navigate to this Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
