import React, { useState, useMemo, useEffect } from 'react';
import { Place, CampusAnnouncement } from '../types';
import { campusDataService } from '../services/campusDataService';
import { Search, X, Clock, ArrowRight, ShieldAlert, Compass, Megaphone, Sparkles } from 'lucide-react';
import { QuickDestinations } from '../components/navigation/QuickDestinations';

interface HomePageProps {
  onSelectDestination: (place: Place) => void;
  onOpenMap: () => void;
  onOpenPlaces: () => void;
  onOpenEmergency: () => void;
  places?: Place[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectDestination,
  onOpenMap,
  onOpenPlaces,
  onOpenEmergency,
  places = campusDataService.getPlaces(),
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Central Library',
    'AI & Data Science Department',
    'College Canteen',
  ]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(
    campusDataService.getAnnouncements(true)
  );

  useEffect(() => {
    const unsub = campusDataService.subscribe(() => {
      setAnnouncements(campusDataService.getAnnouncements(true));
    });
    return unsub;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.building.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
    );
  }, [searchQuery, places]);

  const handleSearchResultClick = (place: Place) => {
    if (!recentSearches.includes(place.name)) {
      setRecentSearches((prev) => [place.name, ...prev.slice(0, 3)]);
    }
    onSelectDestination(place);
  };

  const activeNotice = announcements[0];

  return (
    <div className="w-full max-w-full sm:max-w-lg mx-auto min-w-0 pb-28 px-3 sm:px-4 pt-3 sm:pt-4 select-none box-border overflow-x-hidden">
      {/* Live Campus Announcement Banner if present */}
      {activeNotice && (
        <div className="glass-panel w-full rounded-2xl px-3.5 py-2 mb-3.5 shadow-xs border border-[#C9A45C]/40 flex items-center justify-between gap-2.5 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 min-w-0">
            <Megaphone className="w-4 h-4 text-[#C9A45C] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#651C32] uppercase truncate block">
                {activeNotice.title}
              </span>
              <span className="text-[10px] text-[#75666A] truncate block font-medium">
                {activeNotice.message}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3 & 4. RESPONSIVE HERO SECTION */}
      <div className="mb-4 sm:mb-5 text-left w-full max-w-full min-w-0 box-border">
        <span className="text-[9px] sm:text-[10px] font-bold tracking-wide uppercase text-[#C9A45C] block mb-1 break-words">
          ARUNAI ENGINEERING COLLEGE · CAMPUS NAVIGATION
        </span>
        <h2
          className="font-extrabold tracking-tight text-[#651C32] uppercase font-sans leading-tight max-w-full break-words"
          style={{ fontSize: 'clamp(24px, 7vw, 36px)', wordWrap: 'break-word' }}
        >
          WHERE DO YOU<br className="sm:hidden" /> WANT TO GO?
        </h2>
        <p className="text-xs sm:text-sm text-[#75666A] mt-1 font-medium leading-relaxed max-w-full break-words">
          Explore the campus, find facilities and navigate effortlessly with live crowd & status telemetry.
        </p>
      </div>

      {/* 5. RESPONSIVE SEARCH BAR */}
      <div className="relative mb-4 sm:mb-5 w-full max-w-full min-w-0 box-border">
        <div className="glass-panel rounded-2xl flex items-center px-3 sm:px-3.5 py-1.5 shadow-md border border-[#E8DFD3] w-full max-w-full min-w-0 box-border">
          <Search className="w-4 h-4 text-[#75666A] mr-2 sm:mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus locations..."
            className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-[#241B1E] placeholder:text-[#75666A] py-1.5 focus:outline-none font-medium truncate"
            aria-label="Search campus locations"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 flex items-center justify-center text-[#75666A] hover:text-[#241B1E] shrink-0 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl border border-[#E8DFD3] shadow-2xl overflow-hidden z-30 max-h-72 overflow-y-auto divide-y divide-[#E8DFD3]/60 w-full min-w-0 box-border">
            {searchResults.length > 0 ? (
              searchResults.map((place) => {
                const isOpen = place.status !== 'closed';
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSearchResultClick(place)}
                    className="w-full text-left p-3 hover:bg-[#651C32]/5 flex items-center justify-between gap-2.5 transition-colors cursor-pointer min-w-0 box-border"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs sm:text-sm font-bold text-[#241B1E] truncate">
                          {place.name}
                        </p>
                        <span
                          className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                            isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
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
                      <div className="flex items-center gap-1.5 text-[11px] text-[#75666A] font-medium mt-0.5 truncate">
                        <span className="capitalize">{place.category}</span>
                        <span className="text-[#C9A45C]">·</span>
                        <span className="tabular-nums">{place.distanceMeters} m</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#75666A] shrink-0" />
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#75666A]">
                No campus locations found matching "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. ISOLATED HORIZONTAL SCROLL QUICK DESTINATIONS */}
      <div className="mb-4 sm:mb-5 w-full max-w-full min-w-0 overflow-hidden box-border">
        <h3 className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider mb-2">
          Frequent Destinations
        </h3>
        <QuickDestinations onSelectPlace={onSelectDestination} />
      </div>

      {/* 7. RESPONSIVE MAP CARD (NO HORIZONTAL OVERFLOW) */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#C9A45C]/35 shadow-md mb-4 sm:mb-5 relative w-full max-w-full min-w-0 box-border overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full min-w-0 box-border">
          <div className="min-w-0 flex-1 w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] block mb-0.5">
              LIVE INTERACTIVE VIEW
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#651C32] uppercase font-sans truncate">
              Campus Vector Map & GPS
            </h3>
            <p className="text-[11px] sm:text-xs text-[#75666A] mt-0.5 leading-snug">
              View building footprints, crowd zones, and turn-by-turn guidance.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenMap}
            className="w-full sm:w-auto min-h-[42px] px-4 py-2.5 bg-gradient-to-r from-[#651C32] to-[#461323] hover:from-[#461323] hover:to-[#651C32] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm border border-[#C9A45C]/40 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Compass className="w-4 h-4 text-[#C9A45C] shrink-0" />
            <span className="truncate">Launch Campus Map</span>
          </button>
        </div>
      </div>

      {/* 8. RESPONSIVE RECENT SEARCHES */}
      {recentSearches.length > 0 && !searchQuery && (
        <div className="mb-4 sm:mb-5 w-full max-w-full min-w-0 box-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider">
              Recent Searches
            </h3>
            <button
              type="button"
              onClick={() => setRecentSearches([])}
              className="text-xs text-[#75666A] hover:text-[#241B1E] p-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1.5 w-full max-w-full min-w-0 box-border">
            {recentSearches.map((term, index) => {
              const matchedPlace = places.find((p) => p.name === term);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (matchedPlace) onSelectDestination(matchedPlace);
                  }}
                  className="w-full max-w-full text-left px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white border border-[#E8DFD3] hover:border-[#651C32]/40 flex items-center justify-between text-xs text-[#241B1E] font-medium transition-colors cursor-pointer shadow-2xs min-w-0 box-border"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <Clock className="w-3.5 h-3.5 text-[#75666A] shrink-0" />
                    <span className="truncate block">{term}</span>
                    {matchedPlace && matchedPlace.crowdLevel === 'high' && (
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase bg-rose-100 text-rose-800 shrink-0">
                        HIGH
                      </span>
                    )}
                  </div>
                  {matchedPlace && (
                    <span className="text-[#75666A] tabular-nums shrink-0 text-[11px] ml-auto">
                      {matchedPlace.distanceMeters} m
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency Assistance Quick Bar */}
      <div className="bg-[#FAF6EE] border border-[#E8DFD3] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 shadow-xs w-full max-w-full min-w-0 box-border">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <ShieldAlert className="w-5 h-5 text-[#651C32] shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-[#651C32] block truncate uppercase">
              Emergency & Health Centre
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#75666A] block truncate font-medium">
              Medical Clinic & Main Security Gate 1
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEmergency}
          className="min-h-[32px] px-3 py-1 bg-[#651C32] hover:bg-[#461323] text-white rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
        >
          View
        </button>
      </div>
    </div>
  );
};
