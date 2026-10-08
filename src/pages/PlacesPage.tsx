import React, { useState, useMemo } from 'react';
import { Place, PlaceCategory } from '../types';
import { campusDataService } from '../services/campusDataService';
import { PlaceCard } from '../components/places/PlaceCard';
import { Search, X, ShieldCheck } from 'lucide-react';

interface PlacesPageProps {
  onSelectPlace: (place: Place) => void;
  places?: Place[];
  onOpenAdmin?: () => void;
}

const CATEGORIES: { id: PlaceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Places' },
  { id: 'academic', label: 'Academic' },
  { id: 'department', label: 'Departments' },
  { id: 'library', label: 'Library' },
  { id: 'food', label: 'Food & Canteen' },
  { id: 'hostel', label: 'Hostels' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'sports', label: 'Sports' },
  { id: 'parking', label: 'Parking' },
  { id: 'emergency', label: 'Emergency' },
];

export const PlacesPage: React.FC<PlacesPageProps> = ({
  onSelectPlace,
  places = campusDataService.getPlaces(),
  onOpenAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesCategory =
        selectedCategory === 'all' || place.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [places, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-full sm:max-w-lg mx-auto min-w-0 pb-28 px-3 sm:px-4 pt-3 sm:pt-4 box-border overflow-x-hidden select-none">
      {/* Title */}
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] block">
          CAMPUS DIRECTORY
        </span>
        <h2 className="text-xl font-bold tracking-tight text-[#241B1E] uppercase font-sans">
          Departments & Facilities
        </h2>
        <p className="text-xs text-[#75666A] mt-0.5">
          Live operating status, crowd indicators, and navigation across Arunai Engineering College.
        </p>
      </div>

      {/* Filter Search */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-[#75666A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter places by name or building..."
          className="w-full min-h-[44px] pl-10 pr-9 py-2.5 bg-white border border-[#E8DFD3] rounded-2xl text-xs text-[#241B1E] placeholder:text-[#75666A] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C9A45C]/30 focus:border-[#C9A45C] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75666A] hover:text-[#241B1E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Interactive Category Segmented Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 no-scrollbar select-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#651C32] text-white shadow-xs border border-[#C9A45C]/40'
                  : 'bg-white text-[#75666A] hover:text-[#241B1E] hover:bg-[#F7F1E5] border border-[#E8DFD3]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Places List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#75666A] px-1 font-medium">
          <span>{filteredPlaces.length} locations available</span>
          <span>Live telemetry synced</span>
        </div>

        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onClick={() => onSelectPlace(place)}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E8DFD3] my-4 shadow-xs">
            <p className="text-sm font-bold text-[#241B1E]">No locations found</p>
            <p className="text-xs text-[#75666A] mt-1">
              Try selecting another category or clear your search filter.
            </p>
          </div>
        )}
      </div>

      {/* Discreet Staff / Admin Entry Link */}
      {onOpenAdmin && (
        <div className="mt-8 pt-4 border-t border-[#E8DFD3]/80 text-center">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#75666A] hover:text-[#651C32] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>AEC Staff & Administration Portal</span>
          </button>
        </div>
      )}
    </div>
  );
};
