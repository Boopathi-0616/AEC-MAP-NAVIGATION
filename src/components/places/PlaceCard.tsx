import React from 'react';
import { Place, PlaceCategory } from '../../types';
import {
  BookOpen,
  Building2,
  Utensils,
  Home,
  Layers,
  Trophy,
  Car,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
  onNavigateDirect?: () => void;
}

const getCategoryIcon = (category: PlaceCategory) => {
  switch (category) {
    case 'academic':
    case 'department':
      return <BookOpen className="w-4 h-4 text-[#651C32]" />;
    case 'library':
      return <BookOpen className="w-4 h-4 text-[#C9A45C]" />;
    case 'administration':
      return <Building2 className="w-4 h-4 text-[#461323]" />;
    case 'food':
      return <Utensils className="w-4 h-4 text-amber-800" />;
    case 'hostel':
      return <Home className="w-4 h-4 text-emerald-800" />;
    case 'facilities':
      return <Layers className="w-4 h-4 text-[#651C32]" />;
    case 'sports':
      return <Trophy className="w-4 h-4 text-amber-700" />;
    case 'parking':
      return <Car className="w-4 h-4 text-slate-600" />;
    case 'emergency':
    case 'medical':
      return <ShieldAlert className="w-4 h-4 text-rose-700" />;
  }
};

const getCategoryBg = (category: PlaceCategory) => {
  switch (category) {
    case 'academic':
    case 'department':
    case 'library':
    case 'administration':
    case 'facilities':
      return 'bg-[#F7F1E5] border border-[#E8DFD3]';
    case 'food':
    case 'sports':
      return 'bg-amber-50 border border-amber-200';
    case 'hostel':
      return 'bg-emerald-50 border border-emerald-200';
    case 'parking':
      return 'bg-slate-100 border border-slate-200';
    case 'emergency':
    case 'medical':
      return 'bg-rose-50 border border-rose-200';
  }
};

const formatCategory = (category: PlaceCategory) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onClick,
}) => {
  const isOpen = place.status !== 'closed';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${place.name}, ${place.building}. Status: ${place.status || 'open'}. Crowd: ${place.crowdLevel || 'low'}. Distance: ${place.distanceMeters} metres.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="w-full text-left bg-white rounded-2xl border border-[#E8DFD3] p-3 sm:p-3.5 hover:border-[#651C32]/50 hover:shadow-xs transition-all active:bg-[#F7F1E5] flex items-center justify-between gap-3 cursor-pointer select-none group min-h-[64px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#651C32] focus-visible:ring-offset-1 box-border"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {/* Category Icon Container */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${getCategoryBg(
            place.category
          )} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          {getCategoryIcon(place.category)}
        </div>

        {/* Place info with crowd and open/closed badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs sm:text-sm font-bold text-[#241B1E] truncate leading-snug group-hover:text-[#651C32] transition-colors">
              {place.name}
            </h4>
            {/* Status indicator */}
            <span
              className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {isOpen ? 'OPEN' : 'CLOSED'}
            </span>
            {/* Crowd indicator */}
            <span
              className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
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

          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#75666A] font-medium mt-0.5">
            <span>{place.building}</span>
            <span aria-hidden="true" className="text-[#C9A45C]">·</span>
            <span className="tabular-nums">{place.distanceMeters} m</span>
            <span aria-hidden="true" className="text-[#C9A45C]">·</span>
            <span className="tabular-nums">{place.walkTimeMinutes} min</span>
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-[#75666A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  );
};
