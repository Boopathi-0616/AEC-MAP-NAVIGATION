import React from 'react';
import { CampusGuide, CampusGuideProps } from './CampusGuide';
import { CharacterState } from '../../types';

export interface NavigationCharacterProps {
  state?: CharacterState;
  turnDirection?: 'left' | 'right' | 'straight' | null;
  maneuver?: any;
  bearing?: number; // degrees
  currentLocation?: any;
  nextWaypoint?: any;
  isNavigating?: boolean;
  compact?: boolean;
  isSpeaking?: boolean;
  onCharacterClick?: () => void;
  statusText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showControls?: boolean;
}

/**
 * NavigationCharacter - Backwards-compatible facade and wrapper around the upgraded 3D CampusGuide.
 * Provides complete fidelity, high-precision kinematics, and AEC smart campus navigation integration.
 */
export const NavigationCharacter: React.FC<NavigationCharacterProps> = ({
  state = 'idle',
  turnDirection = null,
  maneuver = null,
  bearing = 0,
  currentLocation = null,
  nextWaypoint = null,
  isNavigating = false,
  compact = false,
  isSpeaking = false,
  onCharacterClick,
  statusText,
  size = 'md',
  showControls = true,
}) => {
  return (
    <CampusGuide
      state={state}
      turnDirection={turnDirection}
      maneuver={maneuver}
      bearing={bearing}
      currentLocation={currentLocation}
      nextWaypoint={nextWaypoint}
      isNavigating={isNavigating}
      isSpeaking={isSpeaking}
      statusText={statusText}
      size={compact ? 'sm' : size}
      showControls={!compact && showControls}
      onCharacterClick={onCharacterClick}
    />
  );
};

export { CampusGuide };
