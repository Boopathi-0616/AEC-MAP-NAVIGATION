import React, { useState, useEffect } from 'react';
import { Place, SchedulePeriod, CampusAnnouncement, CampusEvent, GuideSettings, Coordinates } from '../types';
import { campusDataService } from '../services/campusDataService';
import { adminAuthService } from '../services/adminAuthService';
import { MapView } from '../components/map/MapView';
import { LocationEditorModal } from '../components/admin/LocationEditorModal';
import {
  LayoutDashboard,
  Map as MapIcon,
  Building2,
  Clock,
  Megaphone,
  Settings,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  Search,
  Check,
} from 'lucide-react';

interface AdminPageProps {
  onReturnToPublic: () => void;
}

type AdminTab = 'dashboard' | 'map-editor' | 'locations' | 'schedule' | 'announcements' | 'guide-settings';

export const AdminPage: React.FC<AdminPageProps> = ({ onReturnToPublic }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [places, setPlaces] = useState<Place[]>(campusDataService.getPlaces());
  const [schedules, setSchedules] = useState<SchedulePeriod[]>(campusDataService.getSchedules());
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(campusDataService.getAnnouncements(false));
  const [events, setEvents] = useState<CampusEvent[]>(campusDataService.getEvents(false));
  const [guideSettings, setGuideSettings] = useState<GuideSettings>(campusDataService.getGuideSettings());

  // Editor Modal States
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<Coordinates | null>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isPinDropMode, setIsPinDropMode] = useState(false);

  // New announcement form state
  const [showNewAnnForm, setShowNewAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annLocationId, setAnnLocationId] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent' | 'info'>('normal');

  // New event form state
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocationId, setEventLocationId] = useState('');
  const [eventDate, setEventDate] = useState('Tomorrow');
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('16:00');
  const [eventCrowd, setEventCrowd] = useState<'low' | 'medium' | 'high'>('high');
  const [eventDescription, setEventDescription] = useState('');

  // Location filter
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Flash save notification
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = campusDataService.subscribe(() => {
      setPlaces(campusDataService.getPlaces());
      setSchedules(campusDataService.getSchedules());
      setAnnouncements(campusDataService.getAnnouncements(false));
      setEvents(campusDataService.getEvents(false));
      setGuideSettings(campusDataService.getGuideSettings());
    });
    return unsub;
  }, []);

  const handleLogout = () => {
    adminAuthService.logout();
    onReturnToPublic();
  };

  // Metrics
  const totalPlaces = places.length;
  const openCount = places.filter((p) => p.status !== 'closed').length;
  const closedCount = places.filter((p) => p.status === 'closed').length;
  const highCrowdCount = places.filter((p) => p.crowdLevel === 'high').length;
  const activeSchedule = campusDataService.getCurrentActiveSchedule();

  // Quick Action: Trigger Lunch Break Simulation
  const handleTriggerLunchMode = () => {
    campusDataService.updatePlace('canteen', { crowdOverride: 'high', temporaryNotice: 'Peak lunch service queue' });
    campusDataService.updatePlace('student-store', { crowdOverride: 'medium' });
    campusDataService.updatePlace('boys-hostel', { crowdOverride: 'high' });
    showToast('Lunch Rush crowd mode applied to campus facilities.');
  };

  // Quick Action: Reset Overrides to Auto
  const handleResetToAuto = () => {
    places.forEach((p) => {
      campusDataService.updatePlace(p.id, { crowdOverride: 'auto', statusOverride: 'auto' });
    });
    showToast('All facility status & crowd overrides reset to automatic schedule.');
  };

  // Admin Map Pin Placed
  const handleAdminMapClick = (coords: Coordinates) => {
    setNewPinCoords(coords);
    setEditingPlace(null);
    setIsPinDropMode(false);
    setIsEditorModalOpen(true);
  };

  // Create Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    campusDataService.addAnnouncement({
      title: annTitle,
      message: annMessage,
      locationId: annLocationId || undefined,
      priority: annPriority,
      active: true,
    });
    setAnnTitle('');
    setAnnMessage('');
    setShowNewAnnForm(false);
    showToast('Live campus announcement published to user navigation.');
  };

  // Create Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    const targetPlace = places.find((p) => p.id === eventLocationId);
    campusDataService.addEvent({
      title: eventTitle,
      locationId: eventLocationId || 'auditorium',
      locationName: targetPlace?.name || 'Auditorium',
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      crowdLevel: eventCrowd,
      active: true,
      description: eventDescription,
    });
    setEventTitle('');
    setShowNewEventForm(false);
    showToast('Special event created with active map marker.');
  };

  // Filtered places for table
  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      !searchFilter.trim() ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.building.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#241B1E] flex flex-col font-sans select-none antialiased box-border">
      {/* 1. ADMIN HEADER */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-xl border-b border-[#E8DFD3] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs box-border">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#651C32] to-[#461323] border border-[#C9A45C]/40 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A45C]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-sm font-extrabold text-[#241B1E] uppercase tracking-tight truncate">
                ARUNAI ENGINEERING COLLEGE
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#651C32] text-white tracking-widest uppercase">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-[#75666A] font-medium truncate">
              Smart Campus Navigation & Telemetry Control Portal
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onReturnToPublic}
            className="min-h-[32px] sm:min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E8DFD3] bg-white hover:bg-[#F7F1E5] text-xs font-bold text-[#651C32] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Switch to student/public navigation view"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span className="hidden sm:inline">Preview Public Map</span>
            <span className="sm:hidden">Public</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[32px] sm:min-h-[36px] px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-[#75666A] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out of admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {statusNotification && (
        <div className="bg-[#651C32] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-[#C9A45C]" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* 2. ADMIN NAVIGATION TABS */}
      <nav className="bg-[#FFFDF8] border-b border-[#E8DFD3] px-3 sm:px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max py-1.5">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'map-editor', label: 'Campus Map Editor', icon: MapIcon },
            { id: 'locations', label: 'Location Directory', icon: Building2 },
            { id: 'schedule', label: 'Break & Class Hours', icon: Clock },
            { id: 'announcements', label: 'Announcements & Events', icon: Megaphone },
            { id: 'guide-settings', label: '3D Guide & Voice', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`min-h-[36px] px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#651C32] text-white shadow-xs border border-[#C9A45C]/40'
                    : 'text-[#75666A] hover:text-[#241B1E] hover:bg-[#F7F1E5]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A45C]' : 'text-[#75666A]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. TAB CONTENT VIEWS */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto box-border">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-5">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-[#E8DFD3]">
                <span className="text-[10px] font-bold text-[#75666A] uppercase tracking-wider block">
                  Total Locations
                </span>
                <span className="text-2xl font-black text-[#651C32] tabular-nums mt-1 block">
                  {totalPlaces}
                </span>
                <span className="text-[10px] text-[#75666A] mt-0.5 block">Managed on Campus</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Open Facilities
                </span>
                <span className="text-2xl font-black text-emerald-700 tabular-nums mt-1 block">
                  {openCount}
                </span>
                <span className="text-[10px] text-emerald-700 mt-0.5 block">Active Operating</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-[#75666A] uppercase tracking-wider block">
                  Closed / Maint.
                </span>
                <span className="text-2xl font-black text-stone-700 tabular-nums mt-1 block">
                  {closedCount}
                </span>
                <span className="text-[10px] text-stone-600 mt-0.5 block">Temporarily Off-hours</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-rose-200 bg-rose-50/40">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  High Crowd Zones
                </span>
                <span className="text-2xl font-black text-[#651C32] tabular-nums mt-1 block">
                  {highCrowdCount}
                </span>
                <span className="text-[10px] text-rose-800 mt-0.5 block">Rush Telemetry Alert</span>
              </div>
            </div>

            {/* Live Campus Schedule Status Banner */}
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[#C9A45C]/35 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] block">
                  AUTOMATED CAMPUS TIMETABLE ENGINE
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#651C32] uppercase">
                  Current Schedule: {activeSchedule ? activeSchedule.name : 'Standard Operating Hours'}
                </h3>
                <p className="text-xs text-[#75666A] mt-0.5">
                  {activeSchedule
                    ? `${activeSchedule.startTime} - ${activeSchedule.endTime} · High crowd auto-linked to: ${activeSchedule.highCrowdLocations.join(', ')}`
                    : 'Campus is operating on standard facility hours without global rush.'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleTriggerLunchMode}
                  className="px-3 py-2 bg-[#651C32] hover:bg-[#461323] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Simulate Lunch Rush</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="px-3 py-2 bg-white border border-[#E8DFD3] text-[#75666A] hover:text-[#241B1E] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Auto</span>
                </button>
              </div>
            </div>

            {/* Quick Location Status Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#651C32] uppercase tracking-wider">
                  Quick Facility Status Toggles (Instant User-Facing Sync)
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('locations')}
                  className="text-xs font-bold text-[#651C32] hover:underline"
                >
                  Manage All Locations →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {places.slice(0, 6).map((place) => {
                  const isOpen = place.status !== 'closed';
                  return (
                    <div
                      key={place.id}
                      className="glass-panel p-3.5 rounded-2xl border border-[#E8DFD3] flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[#C9A45C] font-bold uppercase block">
                          {place.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#241B1E] truncate">
                          {place.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#75666A] mt-1 font-medium">
                          <span>{place.openingTime} - {place.closingTime}</span>
                          <span>·</span>
                          <span className="uppercase font-bold text-[#651C32]">{place.crowdLevel} crowd</span>
                        </div>
                      </div>

                      {/* Quick Toggle Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            campusDataService.updatePlace(place.id, {
                              statusOverride: isOpen ? 'closed' : 'open',
                            });
                            showToast(`Status for ${place.name} changed to ${isOpen ? 'CLOSED' : 'OPEN'}`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                            isOpen
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                        >
                          {isOpen ? 'OPEN' : 'CLOSED'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextCrowd =
                              place.crowdLevel === 'low'
                                ? 'medium'
                                : place.crowdLevel === 'medium'
                                ? 'high'
                                : 'low';
                            campusDataService.updatePlace(place.id, {
                              crowdOverride: nextCrowd,
                            });
                            showToast(`${place.name} crowd updated to ${nextCrowd.toUpperCase()}`);
                          }}
                          className="px-2 py-0.5 rounded-lg text-[9px] font-semibold text-[#75666A] bg-white border border-[#E8DFD3] hover:bg-[#F7F1E5] cursor-pointer"
                        >
                          Toggle Crowd
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPUS MAP EDITOR */}
        {activeTab === 'map-editor' && (
          <div className="max-w-6xl mx-auto space-y-3">
            {/* Toolbar */}
            <div className="glass-panel p-3 rounded-2xl border border-[#E8DFD3] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#651C32] uppercase">
                  Interactive Map Editor:
                </span>
                <span className="text-xs text-[#75666A]">
                  Click any building to edit status & coordinates, or use Pin mode to add a new location.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinDropMode(!isPinDropMode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    isPinDropMode
                      ? 'bg-[#C9A45C] text-[#461323] ring-2 ring-[#651C32]'
                      : 'bg-[#651C32] text-white hover:bg-[#461323]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isPinDropMode ? 'Click Map to Drop Pin' : '+ Add Location Pin'}</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-[68vh] rounded-3xl border border-[#E8DFD3] overflow-hidden shadow-lg relative bg-[#FAF6EE]">
              <MapView
                places={places}
                isAdminMode={true}
                onAdminSelectPlace={(place) => {
                  setEditingPlace(place);
                  setNewPinCoords(null);
                  setIsEditorModalOpen(true);
                }}
                onAdminMapClick={handleAdminMapClick}
                activeEvents={events}
              />
            </div>
          </div>
        )}

        {/* TAB 3: LOCATION DIRECTORY */}
        {activeTab === 'locations' && (
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#75666A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search building name or block..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlace(null);
                    setNewPinCoords({ x: 50, y: 50, lat: 12.2281, lng: 79.0745 });
                    setIsEditorModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#651C32] hover:bg-[#461323] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C9A45C]" />
                  <span>Add Location</span>
                </button>
              </div>
            </div>

            {/* Locations Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPlaces.map((place) => {
                const isOpen = place.status !== 'closed';
                return (
                  <div
                    key={place.id}
                    className="glass-panel p-4 rounded-2xl border border-[#E8DFD3] flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#C9A45C] uppercase">
                          {place.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                          <span
                            className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              place.crowdLevel === 'high'
                                ? 'bg-rose-100 text-rose-800'
                                : place.crowdLevel === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {place.crowdLevel?.toUpperCase()} CROWD
                          </span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#241B1E] truncate">{place.name}</h4>
                      <p className="text-xs text-[#75666A] mt-0.5 truncate">{place.building}</p>
                      <p className="text-[11px] text-[#75666A] mt-1 line-clamp-2">
                        {place.shortDescription}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#75666A]">
                        {place.openingTime} - {place.closingTime}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlace(place);
                            setNewPinCoords(null);
                            setIsEditorModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#F7F1E5] hover:bg-[#E8DFD3] text-[#651C32] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BREAK & CLASS HOURS */}
        {activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[#E8DFD3]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] block">
                CAMPUS SCHEDULE & BREAK-HOUR ENGINE
              </span>
              <h3 className="text-base font-extrabold text-[#651C32] uppercase">
                Configure Automated Crowd Density Timings
              </h3>
              <p className="text-xs text-[#75666A] mt-1 leading-relaxed">
                When the real-time clock enters these windows, associated facilities automatically elevate to High or Medium crowd zones on the public student navigation map without requiring manual status flips.
              </p>
            </div>

            <div className="space-y-3">
              {schedules.map((period, idx) => (
                <div
                  key={period.id}
                  className="bg-white p-4 rounded-2xl border border-[#E8DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#241B1E]">{period.name}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F7F1E5] text-[#651C32] uppercase">
                        {period.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#651C32]">
                      <Clock className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>{period.startTime} - {period.endTime}</span>
                    </div>
                    <p className="text-xs text-[#75666A] mt-1">
                      High Crowd Locations: <strong>{period.highCrowdLocations.join(', ')}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const newHigh = prompt(
                          `Update high crowd location IDs for ${period.name} (comma-separated):`,
                          period.highCrowdLocations.join(', ')
                        );
                        if (newHigh !== null) {
                          const updatedSchedules = [...schedules];
                          updatedSchedules[idx].highCrowdLocations = newHigh
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          campusDataService.updateSchedule(updatedSchedules);
                          showToast(`Updated schedule for ${period.name}`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#F7F1E5] hover:bg-[#E8DFD3] text-[#651C32] text-xs font-bold uppercase cursor-pointer"
                    >
                      Edit Locations
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS & EVENTS */}
        {activeTab === 'announcements' && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Announcements Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#651C32] uppercase tracking-wider">
                    Live Campus Navigation Announcements
                  </h3>
                  <p className="text-xs text-[#75666A]">
                    Notices appear as glossy, non-intrusive alert banners on top of the student map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAnnForm(!showNewAnnForm)}
                  className="px-3.5 py-1.5 bg-[#651C32] hover:bg-[#461323] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Publish Notice</span>
                </button>
              </div>

              {/* New Announcement Form */}
              {showNewAnnForm && (
                <form
                  onSubmit={handleCreateAnnouncement}
                  className="bg-white p-4 rounded-2xl border border-[#C9A45C]/40 space-y-3 shadow-md animate-in slide-in-from-top-2"
                >
                  <h4 className="text-xs font-bold text-[#651C32] uppercase">New Live Notice</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Title: e.g. Main Block Entrance Maintenance"
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    />
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="urgent">Urgent Alert</option>
                      <option value="info">General Info</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    placeholder="Details: Please use East Wing archway for administrative queries today."
                    className="w-full px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewAnnForm(false)}
                      className="px-3 py-1.5 text-xs text-[#75666A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#651C32] text-white text-xs font-bold rounded-xl"
                    >
                      Publish to Live Map
                    </button>
                  </div>
                </form>
              )}

              {/* Announcements List */}
              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white p-3.5 rounded-2xl border border-[#E8DFD3] flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-[#241B1E]">{ann.title}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                            ann.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {ann.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-[#75666A]">{ann.message}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          campusDataService.updateAnnouncement(ann.id, { active: !ann.active });
                          showToast(`Notice ${ann.active ? 'deactivated' : 'activated'}`);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F7F1E5] text-[#651C32] cursor-pointer"
                      >
                        {ann.active ? 'Mute' : 'Broadcast'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          campusDataService.deleteAnnouncement(ann.id);
                          showToast('Notice deleted.');
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Events Section */}
            <div className="space-y-3 pt-4 border-t border-[#E8DFD3]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#651C32] uppercase tracking-wider">
                    Special Campus Events
                  </h3>
                  <p className="text-xs text-[#75666A]">
                    Events display special golden flags and crowd surge alerts over target buildings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewEventForm(!showNewEventForm)}
                  className="px-3.5 py-1.5 bg-[#C9A45C] hover:bg-[#DFBF7B] text-[#461323] text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Event</span>
                </button>
              </div>

              {/* New Event Form */}
              {showNewEventForm && (
                <form
                  onSubmit={handleCreateEvent}
                  className="bg-white p-4 rounded-2xl border border-[#C9A45C]/40 space-y-3 shadow-md animate-in slide-in-from-top-2"
                >
                  <h4 className="text-xs font-bold text-[#651C32] uppercase">Create Special Event</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Event: e.g. National Technical Symposium 2026"
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    />
                    <select
                      value={eventLocationId}
                      onChange={(e) => setEventLocationId(e.target.value)}
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    >
                      {places.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="Date: Today / 16 Oct"
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    />
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    />
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="px-3 py-2 text-xs border border-[#E8DFD3] rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewEventForm(false)}
                      className="px-3 py-1.5 text-xs text-[#75666A]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#651C32] text-white text-xs font-bold rounded-xl"
                    >
                      Save Event
                    </button>
                  </div>
                </form>
              )}

              {/* Events List */}
              <div className="space-y-2">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white p-3.5 rounded-2xl border border-[#E8DFD3] flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-[#241B1E]">{evt.title}</span>
                        <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-[#C9A45C] text-[#461323]">
                          {evt.crowdLevel.toUpperCase()} CROWD
                        </span>
                      </div>
                      <p className="text-xs text-[#75666A]">
                        At {evt.locationName} · {evt.date} ({evt.startTime} - {evt.endTime})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          campusDataService.deleteEvent(evt.id);
                          showToast('Event removed.');
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: 3D GUIDE & VOICE SETTINGS */}
        {activeTab === 'guide-settings' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[#E8DFD3]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] block">
                SMART CAMPUS ASSISTANT
              </span>
              <h3 className="text-base font-extrabold text-[#651C32] uppercase">
                3D Guide Character & Voice Navigation Controls
              </h3>
              <p className="text-xs text-[#75666A] mt-1 leading-relaxed">
                Configure default voice speech rates, maneuver warning distances, and 3D student ambassador appearance.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E8DFD3] space-y-4 shadow-xs">
              {/* Voice Guidance Default */}
              <div className="flex items-center justify-between py-2 border-b border-[#E8DFD3]">
                <div>
                  <span className="text-xs font-bold text-[#241B1E] block">Voice Guidance by Default</span>
                  <span className="text-[11px] text-[#75666A]">
                    Enable spoken turn-by-turn guidance for new campus visitors
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={guideSettings.voiceEnabled}
                  onChange={(e) => {
                    campusDataService.updateGuideSettings({ voiceEnabled: e.target.checked });
                    showToast(`Voice guidance set to ${e.target.checked ? 'ENABLED' : 'MUTED'}`);
                  }}
                  className="w-4 h-4 accent-[#651C32]"
                />
              </div>

              {/* 3D Guide Visibility */}
              <div className="flex items-center justify-between py-2 border-b border-[#E8DFD3]">
                <div>
                  <span className="text-xs font-bold text-[#241B1E] block">3D Guide Character on Map</span>
                  <span className="text-[11px] text-[#75666A]">
                    Show animated 3D student ambassador avatar during wayfinding
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={guideSettings.guideEnabled}
                  onChange={(e) => {
                    campusDataService.updateGuideSettings({ guideEnabled: e.target.checked });
                    showToast(`3D Guide set to ${e.target.checked ? 'ACTIVE' : 'OFF'}`);
                  }}
                  className="w-4 h-4 accent-[#651C32]"
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="text-xs font-bold text-[#651C32] uppercase block mb-1">
                  Speech Synthesizer Language
                </label>
                <select
                  value={guideSettings.voiceLanguage}
                  onChange={(e) => {
                    campusDataService.updateGuideSettings({ voiceLanguage: e.target.value });
                    showToast(`Speech language set to ${e.target.value}`);
                  }}
                  className="w-full px-3 py-2 bg-[#FAF6EE] border border-[#E8DFD3] rounded-xl text-xs font-medium focus:outline-none"
                >
                  <option value="en-IN">English (Indian English en-IN)</option>
                  <option value="en-GB">English (British en-GB)</option>
                  <option value="en-US">English (United States en-US)</option>
                </select>
              </div>

              {/* Instruction Distance */}
              <div>
                <label className="text-xs font-bold text-[#651C32] uppercase block mb-1">
                  Maneuver Warning Proximity Distance: {guideSettings.instructionDistance} metres
                </label>
                <input
                  type="range"
                  min={25}
                  max={100}
                  step={5}
                  value={guideSettings.instructionDistance}
                  onChange={(e) => {
                    campusDataService.updateGuideSettings({ instructionDistance: Number(e.target.value) });
                  }}
                  className="w-full accent-[#651C32]"
                />
                <div className="flex justify-between text-[10px] text-[#75666A] font-semibold mt-1">
                  <span>25m (Immediate)</span>
                  <span>50m (Recommended)</span>
                  <span>100m (Early)</span>
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between">
                <span className="text-xs text-[#75666A]">Reset all demo data & settings:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to restore default campus data?')) {
                      campusDataService.resetToDefaults();
                      showToast('Default campus seed restored successfully.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                >
                  Restore Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. LOCATION EDITOR MODAL */}
      <LocationEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setEditingPlace(null);
          setNewPinCoords(null);
        }}
        placeToEdit={editingPlace}
        newPinCoordinates={newPinCoords}
        onSaved={(saved) => {
          showToast(`Location '${saved.name}' saved and synced.`);
        }}
        onDeleted={(delId) => {
          showToast(`Location removed from campus system.`);
        }}
      />
    </div>
  );
};
