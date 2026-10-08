export type PlaceCategory =
  | 'academic'
  | 'administration'
  | 'food'
  | 'hostel'
  | 'facilities'
  | 'sports'
  | 'parking'
  | 'emergency'
  | 'library'
  | 'medical'
  | 'department';

export interface Coordinates {
  x: number; // Campus relative coordinate percentage (0-100)
  y: number; // Campus relative coordinate percentage (0-100)
  lat: number;
  lng: number;
}

export type LocationStatus =
  | 'open'
  | 'closed'
  | 'busy'
  | 'temporarily-closed'
  | 'maintenance';

export type CrowdLevel = 'low' | 'medium' | 'high';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  shortDescription: string;
  building: string;
  floor?: string;
  distanceMeters: number;
  walkTimeMinutes: number;
  coordinates: Coordinates;
  amenities: string[];
  contactPhone?: string;
  isEmergency?: boolean;
  popular?: boolean;
  status?: LocationStatus;
  crowdLevel?: CrowdLevel;
  openingTime?: string; // HH:mm format, e.g. "08:00"
  closingTime?: string; // HH:mm format, e.g. "17:00"
  temporaryNotice?: string;
  crowdRecommendation?: string;
  statusOverride?: 'auto' | LocationStatus;
  crowdOverride?: 'auto' | CrowdLevel;
  image?: string;
  navigationPriority?: number;
  updatedAt?: number;
}

export type GPSStatusType = 'available' | 'locating' | 'weak' | 'unavailable';

export interface NavigationInstruction {
  id: string;
  stepNumber: number;
  maneuver:
    | 'straight'
    | 'turn-left'
    | 'turn-right'
    | 'slight-left'
    | 'slight-right'
    | 'arrive';
  instruction: string;
  distanceMeters: number;
  landmark?: string;
  guideHint?: string;
}

export interface Route {
  id: string;
  destinationId: string;
  destinationName: string;
  totalDistanceMeters: number;
  totalWalkTimeMinutes: number;
  waypoints: { x: number; y: number }[];
  steps: NavigationInstruction[];
}

export type NavigationStatus = 'idle' | 'previewing' | 'navigating' | 'arrived';

export type CharacterState =
  | 'idle'
  | 'walking'
  | 'walk'
  | 'walk_forward'
  | 'walk_left'
  | 'walk_right'
  | 'running'
  | 'run'
  | 'turn_left'
  | 'turn_right'
  | 'point_left'
  | 'point_right'
  | 'point_forward'
  | 'look_around'
  | 'wave'
  | 'talk'
  | 'arrived'
  | 'celebrate'
  | 'turning'
  | 'pointing'
  // Uppercase aliases
  | 'IDLE'
  | 'WALK_FORWARD'
  | 'WALK_LEFT'
  | 'WALK_RIGHT'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'POINT_LEFT'
  | 'POINT_RIGHT'
  | 'POINT_FORWARD'
  | 'TALK'
  | 'LOOK_AROUND'
  | 'WAVE'
  | 'ARRIVED'
  | 'CELEBRATE';

export interface LiveLocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
}

export type TabType = 'home' | 'map' | 'places' | 'guide';

export interface MapViewProps {
  location?: Coordinates | null;
  destination?: Place | null;
  route?: Route | null;
  currentStepIndex?: number;
  zoomLevel?: number;
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: Place) => void;
  isNavigating?: boolean;
  accuracy?: number | null;
  heading?: number | null;
  isTracking?: boolean;
  places?: Place[];
  isAdminMode?: boolean;
  onAdminMapClick?: (coords: Coordinates) => void;
  onAdminSelectPlace?: (place: Place) => void;
  activeEvents?: CampusEvent[];
}

// Smart Campus Schedule Period
export interface SchedulePeriod {
  id: string;
  name: string;
  type: 'break' | 'lunch' | 'classes' | 'after_hours' | 'event';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  description?: string;
  highCrowdLocations: string[]; // place ids
  mediumCrowdLocations: string[];
}

// Campus Announcements
export interface CampusAnnouncement {
  id: string;
  title: string;
  message: string;
  locationId?: string;
  priority: 'normal' | 'urgent' | 'info';
  active: boolean;
  createdAt: number;
}

// Special Events
export interface CampusEvent {
  id: string;
  title: string;
  locationId: string;
  locationName: string;
  date: string;
  startTime: string;
  endTime: string;
  crowdLevel: CrowdLevel;
  active: boolean;
  description: string;
}

// Guide Settings
export interface GuideSettings {
  guideEnabled: boolean;
  voiceEnabled: boolean;
  voiceLanguage: string;
  instructionDistance: number;
  characterVisible: boolean;
  volume: number;
  characterStyle: 'student_ambassador' | 'tech_guide';
}

// Admin Authentication Session
export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  role: 'admin';
  token: string;
  expiresAt: number;
}
