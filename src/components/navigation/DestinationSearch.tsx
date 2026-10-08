import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Place } from '../../types';
import { campusDataService } from '../../services/campusDataService';
import { Search, X, Building, BookOpen, Utensils, Home, Trophy, Car, ShieldAlert, ArrowRight } from 'lucide-react';

interface DestinationSearchProps {
  onSelectPlace: (place: Place) => void;
  selectedPlaceId?: string | null;
  places?: Place[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'academic':
    case 'department':
      return <BookOpen className="w-3.5 h-3.5 text-[#651C32]" />;
    case 'library':
      return <BookOpen className="w-3.5 h-3.5 text-[#C9A45C]" />;
    case 'food':
      return <Utensils className="w-3.5 h-3.5 text-amber-700" />;
    case 'hostel':
      return <Home className="w-3.5 h-3.5 text-emerald-800" />;
    case 'sports':
      return <Trophy className="w-3.5 h-3.5 text-orange-700" />;
    case 'parking':
      return <Car className="w-3.5 h-3.5 text-slate-600" />;
    case 'emergency':
    case 'medical':
      return <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />;
    default:
      return <Building className="w-3.5 h-3.5 text-[#651C32]" />;
  }
};

export const DestinationSearch: React.FC<DestinationSearchProps> = ({
  onSelectPlace,
  places,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availablePlaces = places || campusDataService.getPlaces();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return availablePlaces.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.building.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.amenities?.some((a) => a.toLowerCase().includes(q))
    );
  }, [query, availablePlaces]);

  // Click outside to close results dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-full sm:max-w-md mx-auto z-30 min-w-0 box-border">
      <div className="glass-panel rounded-2xl flex items-center px-3 sm:px-3.5 py-1.5 shadow-md border border-[#E8DFD3]/90 transition-all focus-within:border-[#C9A45C] focus-within:ring-2 focus-within:ring-[#C9A45C]/20 w-full min-w-0 box-border">
        <Search className="w-4 h-4 text-[#75666A] shrink-0 mr-2 sm:mr-2.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search campus locations..."
          className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-[#241B1E] placeholder:text-[#75666A] py-1.5 focus:outline-none font-medium truncate"
          aria-label="Search campus locations"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#75666A] hover:text-[#241B1E] hover:bg-black/5 shrink-0 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Glass Dropdown Results with Status & Crowd Indicators */}
      {isFocused && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl shadow-2xl border border-[#E8DFD3] max-h-72 overflow-y-auto z-40 divide-y divide-[#E8DFD3]/50 animate-in fade-in slide-in-from-top-1 box-border">
          {results.length > 0 ? (
            results.map((place) => {
              const isOpen = place.status !== 'closed';
              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    onSelectPlace(place);
                    setIsFocused(false);
                    setQuery('');
                  }}
                  className="w-full p-2.5 sm:p-3 text-left hover:bg-[#651C32]/5 flex items-center justify-between gap-2.5 transition-colors group cursor-pointer box-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-[#F7F1E5] flex items-center justify-center shrink-0 border border-[#E8DFD3]">
                      {getCategoryIcon(place.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs sm:text-sm font-bold text-[#241B1E] truncate group-hover:text-[#651C32] transition-colors">
                          {place.name}
                        </p>
                        <span
                          className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            isOpen
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                        {place.crowdLevel === 'high' && (
                          <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase bg-rose-100 text-rose-800">
                            HIGH CROWD
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#75666A] truncate">
                        {place.building} · {place.distanceMeters} m
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#75666A] group-hover:text-[#651C32] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-[#75666A]">
              No locations found matching "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
