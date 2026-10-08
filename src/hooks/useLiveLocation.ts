import { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, LiveLocationData } from '../types';
import { AEC_CAMPUS_CENTER } from '../services/gpsService';
import { INITIAL_USER_LOCATION } from '../data/campusRoutes';

export interface UseLiveLocationReturn {
  location: Coordinates | null;
  rawCoords: LiveLocationData;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  isTracking: boolean;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unavailable';
}

/**
 * Projects real GPS coordinates (lat/lng) onto the Arunai Engineering College 100x100 SVG grid
 */
function projectGpsToCampusGrid(lat: number, lng: number): { x: number; y: number } {
  // Arunai Campus approximate bounding box in Tiruvannamalai
  // Center: ~12.2281 N, 79.0745 E
  const latMin = 12.2255;
  const latMax = 12.2305;
  const lngMin = 79.0715;
  const lngMax = 79.0775;

  // Check if position is within campus bounding box
  const inCampus =
    lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;

  if (inCampus) {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    // In SVG, y increases downwards, while latitude increases upwards (North)
    const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100;
    return {
      x: Math.min(Math.max(x, 5), 95),
      y: Math.min(Math.max(y, 5), 95),
    };
  }

  // If outside campus boundary (e.g. testing remotely), anchor near Main Entrance Gate 1
  return { x: INITIAL_USER_LOCATION.x, y: INITIAL_USER_LOCATION.y };
}

export function useLiveLocation(): UseLiveLocationReturn {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [location, setLocation] = useState<Coordinates | null>(INITIAL_USER_LOCATION);
  const [accuracy, setAccuracy] = useState<number | null>(12); // meters
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'unavailable'
  >('prompt');

  const [rawCoords, setRawCoords] = useState<LiveLocationData>({
    latitude: AEC_CAMPUS_CENTER.lat,
    longitude: AEC_CAMPUS_CENTER.lng,
    accuracy: 12,
    heading: null,
    speed: null,
    timestamp: Date.now(),
  });

  const watchIdRef = useRef<number | null>(null);

  // Check if geolocation is available
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unavailable');
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handlePositionSuccess = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy: acc, heading: head, speed: spd } = pos.coords;

    const projected = projectGpsToCampusGrid(latitude, longitude);

    const updatedLocation: Coordinates = {
      x: projected.x,
      y: projected.y,
      lat: latitude,
      lng: longitude,
    };

    setLocation(updatedLocation);
    setAccuracy(acc ? Math.round(acc) : 10);
    setHeading(head !== null && !isNaN(head) ? Math.round(head) : null);
    setSpeed(spd !== null && !isNaN(spd) ? Math.round(spd * 3.6) : null); // km/h
    setError(null);
    setPermissionStatus('granted');

    setRawCoords({
      latitude,
      longitude,
      accuracy: acc ? Math.round(acc) : null,
      heading: head !== null ? Math.round(head) : null,
      speed: spd !== null ? Math.round(spd * 3.6) : null,
      timestamp: pos.timestamp,
    });
  }, []);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('Location permission was denied. Please allow location access in your browser settings.');
        setPermissionStatus('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        setError('GPS position is currently unavailable. Check your device location settings.');
        break;
      case err.TIMEOUT:
        setError('Location request timed out. Retrying GPS connection...');
        break;
      default:
        setError('An unexpected error occurred while obtaining location.');
    }
    // Keep last known or entrance location
  }, []);

  const startTracking = useCallback(async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser.');
      setPermissionStatus('unavailable');
      return false;
    }

    setError(null);

    return new Promise((resolve) => {
      // First get current position to trigger browser prompt and test
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionSuccess(pos);
          setIsTracking(true);
          setPermissionStatus('granted');

          // Start continuous watchPosition
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }

          watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionSuccess,
            handlePositionError,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 1000,
            }
          );

          resolve(true);
        },
        (err) => {
          handlePositionError(err);
          // If denied or timed out, resolve false
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000,
        }
      );
    });
  }, [handlePositionSuccess, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    rawCoords,
    accuracy,
    heading,
    speed,
    isTracking,
    startTracking,
    stopTracking,
    error,
    permissionStatus,
  };
}
