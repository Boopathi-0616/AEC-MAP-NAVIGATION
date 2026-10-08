import React from 'react';
import { Place } from '../../types';
import { CAMPUS_PLACES } from '../../data/campusPlaces';
import { BookOpen, Cpu, Utensils, Theater, Building, Home, Car } from 'lucide-react';

interface QuickDestinationsProps {
  onSelectPlace: (place: Place) => void;
  selectedPlaceId?: string | null;
}

const QUICK_ITEMS = [
  { id: 'central-library', label: 'LIBRARY', icon: BookOpen },
  { id: 'ai-ds-dept', label: 'AI & DATA SCIENCE', icon: Cpu },
  { id: 'canteen', label: 'CANTEEN', icon: Utensils },
  { id: 'auditorium', label: 'AUDITORIUM', icon: Theater },
  { id: 'main-admin-block', label: 'MAIN BLOCK', icon: Building },
  { id: 'boys-hostel', label: 'HOSTEL', icon: Home },
  { id: 'parking-north', label: 'PARKING', icon: Car },
];

export const QuickDestinations: React.FC<QuickDestinationsProps> = ({
  onSelectPlace,
  selectedPlaceId,
}) => {
  const handleClick = (id: string) => {
    const place = CAMPUS_PLACES.find((p) => p.id === id);
    if (place) {
      onSelectPlace(place);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden box-border">
      <div
        role="region"
        aria-label="Quick Campus Destinations"
        className="flex items-center gap-2 overflow-x-auto w-full max-w-full min-w-0 py-1 px-0.5 whitespace-nowrap no-scrollbar box-border"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {QUICK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedPlaceId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className={`shrink-0 min-h-[32px] sm:min-h-[34px] px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95 shadow-xs cursor-pointer ${
                isSelected
                  ? 'bg-[#651C32] text-white border border-[#C9A45C]'
                  : 'glass-pill text-[#241B1E] hover:text-[#651C32] hover:border-[#651C32]/30 border border-[#E8DFD3]'
              }`}
            >
              <Icon className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#C9A45C]' : 'text-[#651C32]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
