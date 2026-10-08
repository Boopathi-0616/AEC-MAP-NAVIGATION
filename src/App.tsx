import React, { useState, useEffect, useCallback } from 'react';
import { TabType, Place, Route, Coordinates, GPSStatusType } from './types';
import { campusDataService } from './services/campusDataService';
import { adminAuthService } from './services/adminAuthService';
import { INITIAL_USER_LOCATION, generateCampusRoute } from './data/campusRoutes';
import { useLiveLocation } from './hooks/useLiveLocation';
import { speechService } from './services/speechService';

// Common Components
import { CampusHeader } from './components/common/CampusHeader';
import { SplashScreen } from './components/common/SplashScreen';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { LocationPermissionModal } from './components/common/LocationPermissionModal';
import { LiveAnnouncer } from './components/common/LiveAnnouncer';

// Modals & Sheets
import { PlaceDetails } from './components/places/PlaceDetails';
import { EmergencyModal } from './components/places/EmergencyModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

// Pages
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { PlacesPage } from './pages/PlacesPage';
import { GuidePage } from './pages/GuidePage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Real-time Campus Places from CampusDataService
  const [places, setPlaces] = useState<Place[]>(campusDataService.getPlaces());

  // Admin Portal State
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    adminAuthService.isAuthenticated()
  );

  // Subscribe to real-time places and auth changes
  useEffect(() => {
    const unsubData = campusDataService.subscribe(() => {
      setPlaces(campusDataService.getPlaces());
    });

    const unsubAuth = adminAuthService.subscribe((session) => {
      setIsAdminAuthenticated(Boolean(session?.isAuthenticated));
    });

    return () => {
      unsubData();
      unsubAuth();
    };
  }, []);

  // Check URL hash for direct #admin route
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        if (adminAuthService.isAuthenticated()) {
          setIsAdminView(true);
        } else {
          setShowAdminLogin(true);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Real browser-based live location tracking
  const {
    location: liveLocation,
    accuracy,
    heading,
    speed,
    isTracking,
    startTracking,
    error: gpsError,
    permissionStatus,
  } = useLiveLocation();

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Navigation State
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Accessibility & Live Speech Guidance State
  const [isVoiceGuidanceEnabled, setIsVoiceGuidanceEnabled] = useState(
    speechService.getIsEnabled()
  );
  const [assertiveMessage, setAssertiveMessage] = useState<string>('');
  const [politeMessage, setPoliteMessage] = useState<string>('');

  // Modals
  const [detailsPlace, setDetailsPlace] = useState<Place | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Current active location (falls back to entrance if not yet tracked)
  const effectiveLocation = liveLocation || INITIAL_USER_LOCATION;

  const gpsStatus: GPSStatusType = isTracking
    ? 'available'
    : permissionStatus === 'denied' || permissionStatus === 'unavailable'
    ? 'unavailable'
    : 'available';

  // Toggle Voice Guidance
  const handleToggleVoiceGuidance = useCallback(() => {
    const nextState = !isVoiceGuidanceEnabled;
    setIsVoiceGuidanceEnabled(nextState);
    speechService.setEnabled(nextState);
    const feedback = nextState
      ? 'Voice navigation guidance enabled. Spoken instructions will play during turns.'
      : 'Voice navigation guidance muted.';
    setPoliteMessage(feedback);
  }, [isVoiceGuidanceEnabled]);

  // Destination selection handler
  const handleSelectDestination = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      const route = generateCampusRoute(effectiveLocation, place);
      setActiveRoute(route);
      setActiveTab('map');

      const message = `Selected destination: ${place.name}, located in ${place.building}. Status: ${place.status || 'open'}. Distance: ${place.distanceMeters} metres.`;
      setPoliteMessage(message);
    },
    [effectiveLocation]
  );

  // Start active navigation
  const handleStartNavigation = useCallback(() => {
    if (!selectedPlace) return;
    const route = activeRoute || generateCampusRoute(effectiveLocation, selectedPlace);
    if (!activeRoute) {
      setActiveRoute(route);
    }
    setIsNavigating(true);
    setCurrentStepIndex(0);

    const firstStep = route.steps[0];
    const instructionMessage = `Starting navigation to ${selectedPlace.name}. Step 1 of ${route.steps.length}: In ${firstStep.distanceMeters} metres, ${firstStep.instruction}.`;
    setAssertiveMessage(instructionMessage);
  }, [selectedPlace, activeRoute, effectiveLocation]);

  // Step progression during navigation
  const handleNextStep = useCallback(() => {
    if (!activeRoute) return;
    if (currentStepIndex < activeRoute.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = activeRoute.steps[nextIndex];

      const stepMessage = `Step ${nextIndex + 1} of ${activeRoute.steps.length}: In ${
        nextStep.distanceMeters
      } metres, ${nextStep.instruction}. ${
        nextStep.landmark ? `Landmark: ${nextStep.landmark}.` : ''
      }`;
      setAssertiveMessage(stepMessage);
    } else {
      // Arrived at destination
      setIsNavigating(false);
      setCurrentStepIndex(0);
      const arrivalMsg = `You have arrived at your destination: ${activeRoute.destinationName}.`;
      setAssertiveMessage(arrivalMsg);
    }
  }, [activeRoute, currentStepIndex]);

  // End navigation
  const handleEndNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setActiveRoute(null);
    setSelectedPlace(null);
    speechService.stop();
    setPoliteMessage('Navigation ended.');
  }, []);

  // Request location permission & Start Tracking
  const handleLocateMeTrigger = useCallback(async (): Promise<boolean> => {
    if (permissionStatus === 'prompt') {
      setShowPermissionModal(true);
      return false;
    }
    const success = await startTracking();
    if (success) {
      const msg = 'Live GPS tracking active. Location updated.';
      setPoliteMessage(msg);
    }
    return success;
  }, [permissionStatus, startTracking]);

  const handleAllowLocation = async () => {
    setShowPermissionModal(false);
    const success = await startTracking();
    if (success) {
      setPoliteMessage('Location access granted. Live campus tracking active.');
    }
  };

  const handleDenyLocation = () => {
    setShowPermissionModal(false);
    setPoliteMessage('Location permissions dismissed. Showing campus entrance anchor.');
  };

  const handleLocateUser = () => {
    startTracking();
    setPoliteMessage('Map centered on your current position.');
  };

  const handleOpenAdminPortal = () => {
    if (adminAuthService.isAuthenticated()) {
      setIsAdminView(true);
      window.location.hash = 'admin';
    } else {
      setShowAdminLogin(true);
    }
  };

  // If in Admin Campus Editor Mode, render Admin Page
  if (isAdminView) {
    return (
      <AdminPage
        onReturnToPublic={() => {
          setIsAdminView(false);
          window.location.hash = '';
        }}
      />
    );
  }

  // PUBLIC CAMPUS NAVIGATION EXPERIENCE
  return (
    <div className="app w-full max-w-[100vw] min-h-screen bg-[#FAF6EE] text-[#241B1E] flex flex-col font-sans select-none antialiased overflow-x-hidden box-border">
      {/* Accessibility Live Region for Screen Readers */}
      <LiveAnnouncer
        assertiveMessage={assertiveMessage}
        politeMessage={politeMessage}
      />

      {/* 1. Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          onOpenGuide={() => {
            setActiveTab('guide');
            setShowSplash(false);
          }}
        />
      )}

      {/* 2. Corporate Navigation Header */}
      <CampusHeader
        gpsStatus={gpsStatus}
        isTracking={isTracking}
        onEmergencyClick={() => setShowEmergencyModal(true)}
        onGPSClick={() => setShowPermissionModal(true)}
        onAdminClick={handleOpenAdminPortal}
        isAdmin={isAdminAuthenticated}
        compact={activeTab === 'map'}
      />

      {/* 3. Main Screen Router */}
      <main className="flex-1 w-full max-w-full flex flex-col min-h-0 relative overflow-x-hidden box-border">
        {activeTab === 'map' && (
          <MapPage
            currentLocation={effectiveLocation}
            selectedPlace={selectedPlace}
            activeRoute={activeRoute}
            isNavigating={isNavigating}
            currentStepIndex={currentStepIndex}
            gpsStatus={gpsStatus}
            isTracking={isTracking}
            accuracy={accuracy}
            heading={heading}
            speed={speed}
            isVoiceGuidanceEnabled={isVoiceGuidanceEnabled}
            onToggleVoiceGuidance={handleToggleVoiceGuidance}
            onSelectPlace={(place) => {
              setSelectedPlace(place);
              setActiveRoute(generateCampusRoute(effectiveLocation, place));
              const selMsg = `Selected ${place.name}, ${place.distanceMeters} metres away.`;
              setPoliteMessage(selMsg);
            }}
            onStartNavigation={handleStartNavigation}
            onEndNavigation={handleEndNavigation}
            onNextStep={handleNextStep}
            onViewPlaceDetails={(place) => setDetailsPlace(place)}
            onDismissDestination={() => {
              setSelectedPlace(null);
              setActiveRoute(null);
              setPoliteMessage('Destination dismissed.');
            }}
            onLocateUser={handleLocateUser}
            onStartTracking={handleLocateMeTrigger}
            places={places}
          />
        )}

        {activeTab === 'home' && (
          <HomePage
            onSelectDestination={handleSelectDestination}
            onOpenMap={() => setActiveTab('map')}
            onOpenPlaces={() => setActiveTab('places')}
            onOpenEmergency={() => setShowEmergencyModal(true)}
            places={places}
          />
        )}

        {activeTab === 'places' && (
          <PlacesPage
            onSelectPlace={(place) => setDetailsPlace(place)}
            places={places}
            onOpenAdmin={handleOpenAdminPortal}
          />
        )}

        {activeTab === 'guide' && (
          <GuidePage
            onNavigateToPlace={handleSelectDestination}
          />
        )}
      </main>

      {/* 4. Bottom Tab Navigation (Fixed to bottom, iOS safe-area compliant) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPoliteMessage(`Switched to ${tab} tab.`);
        }}
      />

      {/* 5. Place Details Modal */}
      <PlaceDetails
        place={detailsPlace}
        isOpen={Boolean(detailsPlace)}
        onClose={() => setDetailsPlace(null)}
        onNavigate={(place) => {
          setDetailsPlace(null);
          handleSelectDestination(place);
        }}
      />

      {/* 6. Emergency Locations & Support Modal with Call Confirmation */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        onSelectEmergencyPlace={(place) => {
          handleSelectDestination(place);
        }}
      />

      {/* 7. Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showPermissionModal}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
      />

      {/* 8. Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => {
          setIsAdminView(true);
          window.location.hash = 'admin';
        }}
      />
    </div>
  );
}
