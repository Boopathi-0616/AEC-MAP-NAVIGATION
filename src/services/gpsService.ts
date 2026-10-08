import { Coordinates, GPSStatusType } from '../types';
import { INITIAL_USER_LOCATION } from '../data/campusRoutes';

// Arunai Engineering College Reference Coordinates (Velu Nagar, Mathur, Tiruvannamalai)
export const AEC_CAMPUS_CENTER = {
  lat: 12.2281,
  lng: 79.0745,
};

type GPSListener = (location: Coordinates, status: GPSStatusType) => void;

class GPSService {
  private currentStatus: GPSStatusType = 'available';
  private currentLocation: Coordinates = { ...INITIAL_USER_LOCATION };
  private listeners: Set<GPSListener> = new Set();
  private watchId: number | null = null;
  private permissionGranted: boolean | null = null;

  public getStatus(): GPSStatusType {
    return this.currentStatus;
  }

  public getLocation(): Coordinates {
    return this.currentLocation;
  }

  public subscribe(listener: GPSListener): () => void {
    this.listeners.add(listener);
    listener(this.currentLocation, this.currentStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentLocation, this.currentStatus);
    });
  }

  public async requestPermission(): Promise<boolean> {
    if (!('geolocation' in navigator)) {
      this.currentStatus = 'unavailable';
      this.notify();
      return false;
    }

    this.currentStatus = 'locating';
    this.notify();

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.permissionGranted = true;
          this.currentStatus = 'available';
          // Map real world coordinates or anchor to AEC campus grid
          this.currentLocation = {
            x: 18,
            y: 78,
            lat: position.coords.latitude || AEC_CAMPUS_CENTER.lat,
            lng: position.coords.longitude || AEC_CAMPUS_CENTER.lng,
          };
          this.notify();
          this.startWatching();
          resolve(true);
        },
        (_error) => {
          // If denied or indoors weak signal, gracefully fall back to campus entry coordinates
          this.permissionGranted = false;
          this.currentStatus = 'available'; // Default to reliable campus entry GPS anchor
          this.currentLocation = { ...INITIAL_USER_LOCATION };
          this.notify();
          resolve(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    });
  }

  private startWatching(): void {
    if ('geolocation' in navigator && this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.currentStatus = 'available';
          this.currentLocation = {
            ...this.currentLocation,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          this.notify();
        },
        () => {
          this.currentStatus = 'weak';
          this.notify();
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
  }

  public setSimulatedLocation(coords: Coordinates): void {
    this.currentLocation = coords;
    this.notify();
  }

  public resetToCampusEntrance(): void {
    this.currentLocation = { ...INITIAL_USER_LOCATION };
    this.currentStatus = 'available';
    this.notify();
  }
}

export const gpsService = new GPSService();
