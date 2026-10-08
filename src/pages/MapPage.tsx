import React, { useState, useMemo, useEffect } from 'react';
import { Place, Route, Coordinates, GPSStatusType, CharacterState, CampusAnnouncement, CampusEvent } from '../types';
import { MapView } from '../components/map/MapView';
import { MapControls } from '../components/map/MapControls';
import { DestinationSearch } from '../components/navigation/DestinationSearch';
import { QuickDestinations } from '../components/navigation/QuickDestinations';
import { DestinationCard } from '../components/navigation/DestinationCard';
import { NavigationPanel } from '../components/navigation/NavigationPanel';
import { LocateMeButton } from '../components/map/LocateMeButton';
import { TrackingStatusPanel } from '../components/map/TrackingStatusPanel';
import { CampusGuide } from '../components/character/CampusGuide';
import { GuideInspectorModal } from '../components/character/GuideInspectorModal';
import { useVoiceGuide } from '../hooks/useVoiceGuide';
import { campusDataService } from '../services/campusDataService';
import {
  Compass,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Megaphone,
  X,
  Volume2,
  VolumeX,
  Navigation as NavIcon,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

interface MapPageProps {
  currentLocation: Coordinates | null;
  selectedPlace: Place | null;
  activeRoute: Route | null;
  isNavigating: boolean;
  currentStepIndex: number;
  gpsStatus: GPSStatusType;
  isTracking: boolean;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  isVoiceGuidanceEnabled: boolean;
  onToggleVoiceGuidance: () => void;
  onSelectPlace: (place: Place) => void;
  onStartNavigation: () => void;
  onEndNavigation: () => void;
  onNextStep: () => void;
  onViewPlaceDetails: (place: Place) => void;
  onDismissDestination: () => void;
  onLocateUser: () => void;
  onStartTracking: () => Promise<boolean>;
  places?: Place[];
}

export const MapPage: React.FC<MapPageProps> = ({
  currentLocation,
  selectedPlace,
  activeRoute,
  isNavigating,
  currentStepIndex,
  gpsStatus,
  isTracking,
  accuracy,
  heading,
  speed,
  isVoiceGuidanceEnabled,
  onToggleVoiceGuidance,
  onSelectPlace,
  onStartNavigation,
  onEndNavigation,
  onNextStep,
  onViewPlaceDetails,
  onDismissDestination,
  onLocateUser,
  onStartTracking,
  places = campusDataService.getPlaces(),
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [compassRotation, setCompassRotation] = useState<number>(0);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
  const [showGuideInspector, setShowGuideInspector] = useState<boolean>(false);

  // Real-time Announcements & Events
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(
    campusDataService.getAnnouncements(true)
  );
  const [events, setEvents] = useState<CampusEvent[]>(
    campusDataService.getEvents(true)
  );

  useEffect(() => {
    const unsub = campusDataService.subscribe(() => {
      setAnnouncements(campusDataService.getAnnouncements(true));
      setEvents(campusDataService.getEvents(true));
    });
    return unsub;
  }, []);

  // Connect Smart Voice Guide & Action Controller
  const voiceGuide = useVoiceGuide({
    route: activeRoute,
    currentStepIndex,
    isNavigating,
    currentLocation,
    destinationName: selectedPlace?.name,
  });

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    setCompassRotation(0);
    onLocateUser();
  };

  const handleLocateMeClick = async () => {
    setIsLocating(true);
    await onStartTracking();
    setIsLocating(false);
    setZoomLevel(1.25);
  };

  // Calculate Target Bearing to next route waypoint for dynamic 3D body rotation
  const targetBearing = useMemo(() => {
    if (!activeRoute || !activeRoute.waypoints || activeRoute.waypoints.length === 0) {
      return heading || 0;
    }
    const nextPt = activeRoute.waypoints[Math.min(currentStepIndex + 1, activeRoute.waypoints.length - 1)];
    const currentPt = activeRoute.waypoints[currentStepIndex] || currentLocation;
    if (!nextPt || !currentPt) return heading || 0;
    const dx = nextPt.x - currentPt.x;
    const dy = nextPt.y - currentPt.y;
    // Bearing angle in degrees
    return Math.atan2(dx, -dy) * (180 / Math.PI);
  }, [activeRoute, currentStepIndex, currentLocation, heading]);

  const currentStep = useMemo(() => {
    if (!activeRoute) return null;
    return activeRoute.steps[currentStepIndex];
  }, [activeRoute, currentStepIndex]);

  // Turn Direction for character pointing
  const turnDirection = useMemo(() => {
    if (!isNavigating || !currentStep) return null;
    if (currentStep.maneuver.includes('left')) return 'left' as const;
    if (currentStep.maneuver.includes('right')) return 'right' as const;
    return 'straight' as const;
  }, [isNavigating, currentStep]);

  // Determine 3D Character state based on navigation lifecycle & voice speech
  const characterState: CharacterState = useMemo(() => {
    if (voiceGuide.isSpeaking) return 'talk';

    if (!isNavigating || !activeRoute) {
      return 'idle';
    }

    if (!currentStep) return 'walking';

    if (currentStepIndex === activeRoute.steps.length - 1 || currentStep.maneuver === 'arrive') {
      return 'arrived';
    }

    if (currentStep.maneuver.includes('left')) {
      return 'turn_left';
    }

    if (currentStep.maneuver.includes('right')) {
      return 'turn_right';
    }

    if (currentStep.maneuver === 'straight') {
      return 'point_forward';
    }

    return 'walking';
  }, [isNavigating, activeRoute, currentStep, currentStepIndex, voiceGuide.isSpeaking]);

  // Maneuver Heading & Labels
  const maneuverTitle = useMemo(() => {
    if (!isNavigating || !currentStep) return 'CAMPUS GUIDE';
    if (currentStepIndex === (activeRoute?.steps.length ?? 0) - 1 || currentStep.maneuver === 'arrive') {
      return 'DESTINATION REACHED';
    }
    if (currentStep.maneuver.includes('left')) return 'TURN LEFT';
    if (currentStep.maneuver.includes('right')) return 'TURN RIGHT';
    if (currentStep.maneuver === 'straight') return 'CONTINUE STRAIGHT';
    return 'FOLLOW ROUTE';
  }, [isNavigating, currentStep, currentStepIndex, activeRoute]);

  // Active notice to display
  const activeNotice = announcements.find((a) => !dismissedAnnouncements.has(a.id));

  return (
    <div className="relative w-full max-w-full flex-1 min-h-[calc(100dvh-130px)] overflow-hidden bg-[#FAF6EE] flex flex-col box-border">
      {/* 1. HERO MAP INSTANCE */}
      <div className="absolute inset-0 w-full h-full">
        <MapView
          location={currentLocation}
          destination={selectedPlace}
          route={activeRoute}
          currentStepIndex={currentStepIndex}
          zoomLevel={zoomLevel}
          selectedPlaceId={selectedPlace?.id}
          onSelectPlace={onSelectPlace}
          isNavigating={isNavigating}
          accuracy={accuracy}
          heading={heading}
          isTracking={isTracking}
          places={places}
          activeEvents={events}
        />
      </div>

      {/* 2. TOP FLOATING LAYER: Live Announcement Banner + Collapsible Search */}
      <div className="relative z-20 w-full px-3 pt-2.5 flex flex-col items-center gap-2 pointer-events-none box-border">
        {/* Live Campus Announcement Pill Banner */}
        {activeNotice && !isNavigating && (
          <div className="glass-panel w-full max-w-md rounded-2xl px-3.5 py-2 shadow-md border border-[#C9A45C]/40 flex items-center justify-between gap-2.5 pointer-events-auto animate-in slide-in-from-top-2">
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
            <button
              type="button"
              onClick={() =>
                setDismissedAnnouncements((prev) => new Set([...prev, activeNotice.id]))
              }
              className="p-1 text-[#75666A] hover:text-[#241B1E] shrink-0 cursor-pointer"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapsible Destination & Search Panel */}
        {!isNavigating && (
          <>
            {!isSearchCollapsed ? (
              <div className="glass-panel w-full max-w-md rounded-3xl p-3 sm:p-3.5 shadow-md border border-[#E8DFD3]/90 pointer-events-auto transition-all animate-in fade-in space-y-2 box-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-[#C9A45C] block">
                      ARUNAI ENGINEERING COLLEGE · CAMPUS NAVIGATION
                    </span>
                    <h2 className="text-xs sm:text-sm font-extrabold text-[#651C32] uppercase tracking-tight font-sans truncate">
                      Where do you want to go?
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSearchCollapsed(true)}
                    className="w-6 h-6 rounded-md hover:bg-black/5 text-[#75666A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Collapse to maximize map view"
                    aria-label="Collapse search bar"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination Search Bar */}
                <DestinationSearch
                  onSelectPlace={onSelectPlace}
                  selectedPlaceId={selectedPlace?.id}
                  places={places}
                />

                {/* Quick Destination Pills */}
                <QuickDestinations
                  onSelectPlace={onSelectPlace}
                  selectedPlaceId={selectedPlace?.id}
                />
              </div>
            ) : (
              /* Compact Collapsed Search Pill */
              <div className="pointer-events-auto w-full max-w-md animate-in slide-in-from-top-1">
                <button
                  type="button"
                  onClick={() => setIsSearchCollapsed(false)}
                  className="glass-panel w-full rounded-2xl px-4 py-2.5 shadow-md border border-[#C9A45C]/40 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#651C32]" />
                    <span className="text-xs font-bold text-[#651C32] uppercase tracking-tight">
                      Where do you want to go?
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#75666A] font-semibold">
                    <span>Search</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#C9A45C]" />
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. ACTIVE NAVIGATION TOP PANEL */}
      {isNavigating && activeRoute && (
        <div className="relative z-30 w-full px-3 pt-2.5 pointer-events-none">
          <div className="pointer-events-auto">
            <NavigationPanel
              route={activeRoute}
              currentStepIndex={currentStepIndex}
              onNextStep={onNextStep}
              onEndNavigation={onEndNavigation}
              isVoiceGuidanceEnabled={voiceGuide.isVoiceEnabled}
              onToggleVoiceGuidance={voiceGuide.toggleVoice}
              onRepeatInstruction={voiceGuide.repeatCurrentInstruction}
            />
          </div>
        </div>
      )}

      {/* 4. FLOATING CAMPUS GUIDE & MAP CONTROLS */}
      <div className="absolute right-3 top-20 sm:top-20 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Map Zoom & Compass Controls */}
        <div className="pointer-events-auto">
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRecenter={handleRecenter}
            onLocateUser={handleRecenter}
            compassRotation={compassRotation}
            zoomLevel={zoomLevel}
            isVoiceGuidanceEnabled={voiceGuide.isVoiceEnabled}
            onToggleVoiceGuidance={voiceGuide.toggleVoice}
          />
        </div>

        {/* 3D SMART CAMPUS GUIDE CARD (Sections 15 & 16: Mobile Glossy Panel with real gestures) */}
        {!isNavigating ? (
          /* Idle / Exploration Mode Guide Panel */
          <div
            onClick={() => setShowGuideInspector(true)}
            className="pointer-events-auto glass-panel rounded-2xl p-2 sm:p-2.5 shadow-xl border border-[#C9A45C]/40 bg-[#FFFDF8]/90 backdrop-blur-md cursor-pointer select-none transition-transform active:scale-95 flex flex-col items-center w-28 sm:w-32 group"
            title="AEC 3D Smart Campus Guide — Click to open 3D Interactive Viewer"
            role="button"
            tabIndex={0}
          >
            {/* 3D Character Viewport */}
            <div className="w-24 h-28 sm:w-28 sm:h-32 flex items-center justify-center relative overflow-hidden rounded-xl">
              <CampusGuide
                state={characterState}
                bearing={targetBearing}
                isNavigating={false}
                isSpeaking={voiceGuide.isSpeaking}
                size="md"
                showControls={false}
                className="bg-transparent shadow-none border-none p-0 w-full h-full"
              />

              {/* Expand badge */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/80 rounded-md shadow-2xs">
                <Maximize2 className="w-3 h-3 text-[#651C32]" />
              </div>
            </div>

            {/* Guide Card Labels */}
            <div className="w-full text-center mt-1">
              <span className="text-[10px] font-extrabold text-[#651C32] uppercase tracking-tight block">
                CAMPUS GUIDE
              </span>
              <span className="text-[9px] text-[#75666A] font-medium block">
                "Follow me"
              </span>

              {/* Voice Indicator with Waveform */}
              <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-semibold text-[#651C32] bg-[#FAF6EE] py-0.5 px-1.5 rounded-lg border border-[#E8DFD3]">
                {voiceGuide.isSpeaking ? (
                  <span className="flex items-center gap-0.5">
                    <span className="w-0.5 h-2 bg-[#C9A45C] animate-pulse rounded-full" />
                    <span className="w-0.5 h-3 bg-[#651C32] animate-pulse rounded-full" />
                    <span className="w-0.5 h-1.5 bg-[#C9A45C] animate-pulse rounded-full" />
                  </span>
                ) : (
                  <Volume2 className="w-2.5 h-2.5 text-[#C9A45C]" />
                )}
                <span className="truncate">
                  {voiceGuide.isSpeaking ? 'Speaking' : voiceGuide.isVoiceEnabled ? 'Voice ON' : 'Muted'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Active Navigation Dynamic Action Panel (Section 16: Live Turn, Distance & Speaking Waveform) */
          <div
            onClick={() => setShowGuideInspector(true)}
            className="pointer-events-auto glass-panel rounded-2xl p-2.5 shadow-2xl border-2 border-[#C9A45C] bg-[#FFFDF8]/95 backdrop-blur-md cursor-pointer select-none transition-all active:scale-95 flex flex-col items-center w-32 sm:w-36 animate-in slide-in-from-right-2"
            title="Active 3D Navigation Guide"
            role="region"
            aria-label={`Navigation Action: ${maneuverTitle}. Distance: ${currentStep?.distanceMeters} metres.`}
          >
            {/* 3D Character Performing Pointing & Turning In Real Time */}
            <div className="w-28 h-32 flex items-center justify-center relative overflow-hidden rounded-xl">
              <CampusGuide
                state={characterState}
                maneuver={currentStep?.maneuver}
                turnDirection={turnDirection}
                bearing={targetBearing}
                isNavigating={true}
                isSpeaking={voiceGuide.isSpeaking}
                size="md"
                showControls={false}
                className="bg-transparent shadow-none border-none p-0 w-full h-full"
              />
            </div>

            {/* Dynamic Action & Distance */}
            <div className="w-full text-center mt-1 border-t border-[#E8DFD3] pt-1">
              <div className="flex items-center justify-center gap-1">
                {currentStep?.maneuver.includes('left') && (
                  <CornerUpLeft className="w-3.5 h-3.5 text-[#C9A45C]" />
                )}
                {currentStep?.maneuver.includes('right') && (
                  <CornerUpRight className="w-3.5 h-3.5 text-[#C9A45C]" />
                )}
                {currentStep?.maneuver === 'straight' && (
                  <ArrowUp className="w-3.5 h-3.5 text-[#C9A45C]" />
                )}
                {currentStep?.maneuver === 'arrive' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="text-[11px] font-black text-[#651C32] uppercase tracking-tight">
                  {maneuverTitle}
                </span>
              </div>

              {currentStep && (
                <span className="text-sm font-black text-[#241B1E] tabular-nums block mt-0.5">
                  {currentStep.distanceMeters} m
                </span>
              )}

              {/* Speaking Indicator with Waveform */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  voiceGuide.repeatCurrentInstruction();
                }}
                className="mt-1 w-full flex items-center justify-center gap-1 text-[9px] font-bold text-[#651C32] bg-[#F7F1E5] hover:bg-[#EFE6D4] py-0.5 px-1.5 rounded-lg border border-[#C9A45C]/40 transition-colors cursor-pointer"
                title="Tap to repeat spoken navigation instruction"
                aria-label="Tap to repeat voice instruction"
              >
                {voiceGuide.isSpeaking ? (
                  <>
                    <span className="flex items-center gap-0.5">
                      <span className="w-1 h-2 bg-[#C9A45C] animate-pulse rounded-full" />
                      <span className="w-1 h-3.5 bg-[#651C32] animate-pulse rounded-full" />
                      <span className="w-1 h-2 bg-[#C9A45C] animate-pulse rounded-full" />
                    </span>
                    <span className="text-[#651C32]">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-2.5 h-2.5 text-[#C9A45C]" />
                    <span>Repeat Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM FLOATING CONTROLS: [ ◎ LOCATE ME ] + Live Status + Destination Card */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-none">
        {/* Selected Destination Card with Crowd Information & Status */}
        {!isNavigating && selectedPlace && (
          <div className="w-full pointer-events-auto">
            <DestinationCard
              place={selectedPlace}
              onStartNavigation={onStartNavigation}
              onViewDetails={onViewPlaceDetails}
              onClose={onDismissDestination}
            />
          </div>
        )}

        {/* Floating Bottom Bar: [ ◎ LOCATE ME ] & Live Tracking Status */}
        <div className="w-full max-w-md flex items-center justify-between gap-2 pointer-events-auto">
          {/* Tracking Status Badge */}
          <TrackingStatusPanel
            isTracking={isTracking}
            accuracy={accuracy}
            speed={speed}
            heading={heading}
          />

          {/* Highly Visible [ ◎ LOCATE ME ] Button */}
          <div className="ml-auto">
            <LocateMeButton
              onClick={handleLocateMeClick}
              isTracking={isTracking}
              isLoading={isLocating}
            />
          </div>
        </div>
      </div>

      {/* 6. INTERACTIVE 3D GUIDE INSPECTOR MODAL */}
      <GuideInspectorModal
        isOpen={showGuideInspector}
        onClose={() => setShowGuideInspector(false)}
      />
    </div>
  );
};
