import { Place, Route, Coordinates, NavigationInstruction } from '../types';

export const INITIAL_USER_LOCATION: Coordinates = {
  x: 18,
  y: 78,
  lat: 12.2268,
  lng: 79.0730,
};

/**
 * Calculates a realistic campus walking route between start and destination
 */
export function generateCampusRoute(
  start: Coordinates,
  destination: Place
): Route {
  const dx = destination.coordinates.x - start.x;
  const dy = destination.coordinates.y - start.y;

  // Intermediate campus avenue waypoint to follow realistic pedestrian walkways
  const avenueMidX = start.x + dx * 0.45;
  const avenueMidY = start.y + dy * 0.2;

  const courtyardMidX = start.x + dx * 0.8;
  const courtyardMidY = start.y + dy * 0.75;

  const waypoints = [
    { x: start.x, y: start.y },
    { x: avenueMidX, y: avenueMidY },
    { x: courtyardMidX, y: courtyardMidY },
    { x: destination.coordinates.x, y: destination.coordinates.y },
  ];

  const totalDist = destination.distanceMeters;
  const step1Dist = Math.round(totalDist * 0.35);
  const step2Dist = Math.round(totalDist * 0.35);
  const step3Dist = totalDist - step1Dist - step2Dist;

  const steps: NavigationInstruction[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      maneuver: 'straight',
      instruction: 'Walk straight on the Main Campus Avenue towards the Academic Quadrangle.',
      distanceMeters: step1Dist,
      landmark: 'Pass Administrative Block on your right',
      guideHint: 'Follow the shaded pedestrian walkway.',
    },
    {
      id: 'step-2',
      stepNumber: 2,
      maneuver: dx > 0 ? 'turn-right' : 'turn-left',
      instruction: `Turn ${dx > 0 ? 'right' : 'left'} near the Central Library corridor walkway.`,
      distanceMeters: step2Dist,
      landmark: 'Library Entrance Sign',
      guideHint: `Continue straight for ${step2Dist} metres.`,
    },
    {
      id: 'step-3',
      stepNumber: 3,
      maneuver: 'arrive',
      instruction: `Arrive at ${destination.name}.`,
      distanceMeters: step3Dist,
      landmark: destination.building,
      guideHint: "You're almost there. The main entrance is straight ahead.",
    },
  ];

  return {
    id: `route-${destination.id}`,
    destinationId: destination.id,
    destinationName: destination.name,
    totalDistanceMeters: destination.distanceMeters,
    totalWalkTimeMinutes: destination.walkTimeMinutes,
    waypoints,
    steps,
  };
}
