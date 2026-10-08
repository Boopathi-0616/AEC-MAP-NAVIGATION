import {
  Place,
  LocationStatus,
  CrowdLevel,
  SchedulePeriod,
  CampusAnnouncement,
  CampusEvent,
  GuideSettings,
  Coordinates,
} from '../types';
import { CAMPUS_PLACES } from '../data/campusPlaces';

const STORAGE_KEYS = {
  PLACES: 'aec_campus_places_v2',
  SCHEDULE: 'aec_campus_schedule_v2',
  ANNOUNCEMENTS: 'aec_campus_announcements_v2',
  EVENTS: 'aec_campus_events_v2',
  GUIDE_SETTINGS: 'aec_guide_settings_v2',
};

// Initial default schedule configuration
const DEFAULT_SCHEDULES: SchedulePeriod[] = [
  {
    id: 'morning-break',
    name: 'Morning Tea Break',
    type: 'break',
    startTime: '10:30',
    endTime: '10:45',
    description: 'Quick student break between morning lecture sessions',
    highCrowdLocations: ['canteen', 'student-store'],
    mediumCrowdLocations: ['central-library', 'emergency-safe-quadrangle'],
  },
  {
    id: 'lunch-break',
    name: 'Campus Lunch Hour',
    type: 'lunch',
    startTime: '12:30',
    endTime: '13:30',
    description: 'Official lunch hour across departments and hostel messes',
    highCrowdLocations: ['canteen', 'student-store', 'boys-hostel'],
    mediumCrowdLocations: ['girls-hostel', 'emergency-safe-quadrangle'],
  },
  {
    id: 'class-hours',
    name: 'Regular Class & Lab Hours',
    type: 'classes',
    startTime: '08:45',
    endTime: '16:30',
    description: 'Active academic periods in blocks and computing labs',
    highCrowdLocations: ['ai-ds-dept', 'cse-dept', 'ece-dept'],
    mediumCrowdLocations: ['central-library', 'main-admin-block'],
  },
  {
    id: 'after-college',
    name: 'After-College & Sports Hours',
    type: 'after_hours',
    startTime: '16:30',
    endTime: '19:00',
    description: 'Extracurricular practices, indoor gym, and hostel returns',
    highCrowdLocations: ['sports-complex', 'cricket-ground'],
    mediumCrowdLocations: ['boys-hostel', 'canteen'],
  },
];

// Initial default announcements
const DEFAULT_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Canteen Peak Lunch Service',
    message: 'Cafeteria counter 2 is reserved for online UPI token pickups to reduce queuing.',
    locationId: 'canteen',
    priority: 'info',
    active: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'ann-2',
    title: 'Central Library Extended Hours',
    message: 'Quiet reading halls remain open until 7:00 PM for semester project preparation.',
    locationId: 'central-library',
    priority: 'normal',
    active: true,
    createdAt: Date.now() - 7200000,
  },
];

// Initial default special events
const DEFAULT_EVENTS: CampusEvent[] = [
  {
    id: 'evt-1',
    title: 'Annual Tech Symposium & Robotics Expo',
    locationId: 'auditorium',
    locationName: 'Thiruvalluvar Kalaiyarangam (Auditorium)',
    date: 'Today',
    startTime: '10:00',
    endTime: '16:30',
    crowdLevel: 'high',
    active: true,
    description: 'Inter-college technical demonstrations and AI hackathon finals.',
  },
];

// Initial default guide settings
const DEFAULT_GUIDE_SETTINGS: GuideSettings = {
  guideEnabled: true,
  voiceEnabled: true,
  voiceLanguage: 'en-IN',
  instructionDistance: 50,
  characterVisible: true,
  volume: 1.0,
  characterStyle: 'student_ambassador',
};

// Seed initial places with smart campus attributes
function seedInitialPlaces(): Place[] {
  return CAMPUS_PLACES.map((p) => {
    let openingTime = '08:00';
    let closingTime = '17:00';
    let defaultStatus: LocationStatus = 'open';
    let defaultCrowd: CrowdLevel = 'low';
    let recommendation: string | undefined = undefined;
    let notice: string | undefined = undefined;

    if (p.id === 'canteen') {
      openingTime = '07:30';
      closingTime = '18:30';
      defaultCrowd = 'high';
      recommendation = 'Try visiting after 1:45 PM for shorter queues';
      notice = 'Lunch rush hour currently active';
    } else if (p.id === 'central-library') {
      openingTime = '08:00';
      closingTime = '19:00';
      defaultCrowd = 'low';
      recommendation = 'Ideal quiet study period right now';
    } else if (p.id === 'auditorium') {
      openingTime = '09:00';
      closingTime = '17:00';
      defaultStatus = 'closed';
      notice = 'Closed for stage prep until tomorrow symposium';
    } else if (p.id === 'ai-ds-dept' || p.id === 'cse-dept') {
      openingTime = '08:45';
      closingTime = '16:45';
      defaultCrowd = 'medium';
    } else if (p.id === 'medical-centre' || p.id === 'security-gate-1') {
      openingTime = '00:00';
      closingTime = '23:59';
      defaultCrowd = 'low';
    } else if (p.id === 'parking-north') {
      openingTime = '06:00';
      closingTime = '21:00';
      defaultCrowd = 'high';
      recommendation = 'East quadrangle bays have more spaces available';
    } else if (p.id === 'sports-complex') {
      openingTime = '06:00';
      closingTime = '19:30';
      defaultCrowd = 'low';
    } else if (p.id === 'boys-hostel' || p.id === 'girls-hostel') {
      openingTime = '06:00';
      closingTime = '21:30';
      defaultCrowd = 'medium';
    }

    return {
      ...p,
      status: defaultStatus,
      crowdLevel: defaultCrowd,
      openingTime,
      closingTime,
      temporaryNotice: notice,
      crowdRecommendation: recommendation,
      statusOverride: 'auto',
      crowdOverride: 'auto',
      updatedAt: Date.now(),
    };
  });
}

class CampusDataService {
  private places: Place[] = [];
  private schedules: SchedulePeriod[] = [];
  private announcements: CampusAnnouncement[] = [];
  private events: CampusEvent[] = [];
  private guideSettings: GuideSettings = DEFAULT_GUIDE_SETTINGS;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      // Places
      const savedPlaces = localStorage.getItem(STORAGE_KEYS.PLACES);
      if (savedPlaces) {
        this.places = JSON.parse(savedPlaces);
      } else {
        this.places = seedInitialPlaces();
        this.savePlaces();
      }

      // Schedules
      const savedSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (savedSchedule) {
        this.schedules = JSON.parse(savedSchedule);
      } else {
        this.schedules = DEFAULT_SCHEDULES;
        this.saveSchedules();
      }

      // Announcements
      const savedAnn = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (savedAnn) {
        this.announcements = JSON.parse(savedAnn);
      } else {
        this.announcements = DEFAULT_ANNOUNCEMENTS;
        this.saveAnnouncements();
      }

      // Events
      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      } else {
        this.events = DEFAULT_EVENTS;
        this.saveEvents();
      }

      // Guide Settings
      const savedGuide = localStorage.getItem(STORAGE_KEYS.GUIDE_SETTINGS);
      if (savedGuide) {
        this.guideSettings = { ...DEFAULT_GUIDE_SETTINGS, ...JSON.parse(savedGuide) };
      }
    } catch (e) {
      console.warn('[CampusDataService] LocalStorage load failed, using defaults', e);
      this.places = seedInitialPlaces();
      this.schedules = DEFAULT_SCHEDULES;
      this.announcements = DEFAULT_ANNOUNCEMENTS;
      this.events = DEFAULT_EVENTS;
      this.guideSettings = DEFAULT_GUIDE_SETTINGS;
    }
  }

  private savePlaces() {
    try {
      localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(this.places));
    } catch (e) {
      console.warn('[CampusDataService] Error saving places', e);
    }
  }

  private saveSchedules() {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(this.schedules));
    } catch (e) {
      console.warn('[CampusDataService] Error saving schedules', e);
    }
  }

  private saveAnnouncements() {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(this.announcements));
    } catch (e) {
      console.warn('[CampusDataService] Error saving announcements', e);
    }
  }

  private saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    } catch (e) {
      console.warn('[CampusDataService] Error saving events', e);
    }
  }

  private saveGuideSettings() {
    try {
      localStorage.setItem(STORAGE_KEYS.GUIDE_SETTINGS, JSON.stringify(this.guideSettings));
    } catch (e) {
      console.warn('[CampusDataService] Error saving guide settings', e);
    }
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('[CampusDataService] Listener error', e);
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // ==========================================
  // Opening Hours & Time Engine
  // ==========================================
  public getCurrentTimeString(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  public isLocationOpenByHours(openingTime?: string, closingTime?: string): boolean {
    if (!openingTime || !closingTime) return true;
    if (openingTime === '00:00' && (closingTime === '23:59' || closingTime === '24:00')) {
      return true;
    }

    const current = this.getCurrentTimeString();
    return current >= openingTime && current <= closingTime;
  }

  // ==========================================
  // Break-Hour & Crowd Density Engine
  // ==========================================
  public getCurrentActiveSchedule(): SchedulePeriod | null {
    const current = this.getCurrentTimeString();
    for (const s of this.schedules) {
      if (current >= s.startTime && current <= s.endTime) {
        return s;
      }
    }
    return null;
  }

  public computeDynamicPlace(place: Place): Place {
    // 1. Resolve Status
    let computedStatus: LocationStatus = 'open';
    if (place.statusOverride && place.statusOverride !== 'auto') {
      computedStatus = place.statusOverride;
    } else {
      const isOpen = this.isLocationOpenByHours(place.openingTime, place.closingTime);
      computedStatus = isOpen ? (place.status || 'open') : 'closed';
    }

    // 2. Resolve Crowd Level
    let computedCrowd: CrowdLevel = place.crowdLevel || 'low';
    if (place.crowdOverride && place.crowdOverride !== 'auto') {
      computedCrowd = place.crowdOverride;
    } else {
      const activeSchedule = this.getCurrentActiveSchedule();
      if (activeSchedule) {
        if (activeSchedule.highCrowdLocations.includes(place.id)) {
          computedCrowd = 'high';
        } else if (activeSchedule.mediumCrowdLocations.includes(place.id)) {
          computedCrowd = 'medium';
        }
      }
    }

    return {
      ...place,
      status: computedStatus,
      crowdLevel: computedCrowd,
    };
  }

  // ==========================================
  // Read APIs
  // ==========================================
  public getPlaces(): Place[] {
    return this.places.map((p) => this.computeDynamicPlace(p));
  }

  public getPlaceById(id: string): Place | undefined {
    const raw = this.places.find((p) => p.id === id);
    if (!raw) return undefined;
    return this.computeDynamicPlace(raw);
  }

  public getSchedules(): SchedulePeriod[] {
    return [...this.schedules];
  }

  public getAnnouncements(onlyActive: boolean = true): CampusAnnouncement[] {
    if (onlyActive) {
      return this.announcements.filter((a) => a.active);
    }
    return [...this.announcements];
  }

  public getEvents(onlyActive: boolean = true): CampusEvent[] {
    if (onlyActive) {
      return this.events.filter((e) => e.active);
    }
    return [...this.events];
  }

  public getGuideSettings(): GuideSettings {
    return { ...this.guideSettings };
  }

  // ==========================================
  // Admin Write APIs
  // ==========================================
  public updatePlace(placeId: string, updates: Partial<Place>): Place | null {
    const idx = this.places.findIndex((p) => p.id === placeId);
    if (idx === -1) return null;

    this.places[idx] = {
      ...this.places[idx],
      ...updates,
      updatedAt: Date.now(),
    };
    this.savePlaces();
    this.notify();
    return this.computeDynamicPlace(this.places[idx]);
  }

  public addPlace(newPlaceData: Omit<Place, 'id' | 'distanceMeters' | 'walkTimeMinutes'>): Place {
    const id = `place-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newPlace: Place = {
      ...newPlaceData,
      id,
      distanceMeters: Math.round(
        Math.hypot(newPlaceData.coordinates.x - 18, newPlaceData.coordinates.y - 78) * 8
      ),
      walkTimeMinutes: Math.max(
        1,
        Math.round(
          (Math.hypot(newPlaceData.coordinates.x - 18, newPlaceData.coordinates.y - 78) * 8) / 75
        )
      ),
      status: newPlaceData.status || 'open',
      crowdLevel: newPlaceData.crowdLevel || 'low',
      openingTime: newPlaceData.openingTime || '08:00',
      closingTime: newPlaceData.closingTime || '17:00',
      statusOverride: newPlaceData.statusOverride || 'auto',
      crowdOverride: newPlaceData.crowdOverride || 'auto',
      amenities: newPlaceData.amenities || [],
      updatedAt: Date.now(),
    };

    this.places.push(newPlace);
    this.savePlaces();
    this.notify();
    return this.computeDynamicPlace(newPlace);
  }

  public deletePlace(placeId: string): boolean {
    const initialLen = this.places.length;
    this.places = this.places.filter((p) => p.id !== placeId);
    if (this.places.length !== initialLen) {
      this.savePlaces();
      this.notify();
      return true;
    }
    return false;
  }

  public updateSchedule(schedules: SchedulePeriod[]): void {
    this.schedules = schedules;
    this.saveSchedules();
    this.notify();
  }

  // Announcements
  public addAnnouncement(announcement: Omit<CampusAnnouncement, 'id' | 'createdAt'>): CampusAnnouncement {
    const newAnn: CampusAnnouncement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      createdAt: Date.now(),
    };
    this.announcements.unshift(newAnn);
    this.saveAnnouncements();
    this.notify();
    return newAnn;
  }

  public updateAnnouncement(id: string, updates: Partial<CampusAnnouncement>): boolean {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.announcements[idx] = { ...this.announcements[idx], ...updates };
    this.saveAnnouncements();
    this.notify();
    return true;
  }

  public deleteAnnouncement(id: string): boolean {
    const prev = this.announcements.length;
    this.announcements = this.announcements.filter((a) => a.id !== id);
    if (this.announcements.length !== prev) {
      this.saveAnnouncements();
      this.notify();
      return true;
    }
    return false;
  }

  // Events
  public addEvent(event: Omit<CampusEvent, 'id'>): CampusEvent {
    const newEvt: CampusEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    this.events.unshift(newEvt);
    this.saveEvents();
    this.notify();
    return newEvt;
  }

  public updateEvent(id: string, updates: Partial<CampusEvent>): boolean {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.events[idx] = { ...this.events[idx], ...updates };
    this.saveEvents();
    this.notify();
    return true;
  }

  public deleteEvent(id: string): boolean {
    const prev = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    if (this.events.length !== prev) {
      this.saveEvents();
      this.notify();
      return true;
    }
    return false;
  }

  // Guide Settings
  public updateGuideSettings(settings: Partial<GuideSettings>): void {
    this.guideSettings = { ...this.guideSettings, ...settings };
    this.saveGuideSettings();
    this.notify();
  }

  // Reset to default seed
  public resetToDefaults(): void {
    this.places = seedInitialPlaces();
    this.schedules = DEFAULT_SCHEDULES;
    this.announcements = DEFAULT_ANNOUNCEMENTS;
    this.events = DEFAULT_EVENTS;
    this.guideSettings = DEFAULT_GUIDE_SETTINGS;
    this.savePlaces();
    this.saveSchedules();
    this.saveAnnouncements();
    this.saveEvents();
    this.saveGuideSettings();
    this.notify();
  }
}

export const campusDataService = new CampusDataService();
