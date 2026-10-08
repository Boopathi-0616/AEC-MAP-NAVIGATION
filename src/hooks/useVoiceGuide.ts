import { useState, useEffect, useCallback, useRef } from 'react';
import { Route, Coordinates, CharacterState } from '../types';
import { speechService, VoicePriority, VoiceOptions } from '../services/speechService';

interface UseVoiceGuideProps {
  route: Route | null;
  currentStepIndex: number;
  isNavigating: boolean;
  currentLocation?: Coordinates | null;
  destinationName?: string | null;
}

export interface UseVoiceGuideReturn {
  isVoiceEnabled: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  characterAction: CharacterState;
  maneuverState: 'idle' | 'walking' | 'turn_left' | 'turn_right' | 'straight' | 'approaching' | 'arrived';
  toggleVoice: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string, options?: boolean | VoiceOptions) => void;
  stop: () => void;
  repeatCurrentInstruction: () => void;
  unlockAudio: () => void;
}

/**
 * Enterprise Navigation Voice Guide Hook for Arunai Engineering College.
 * Synchronizes voice instructions, navigation lifecycle, and 3D character kinematics.
 */
export function useVoiceGuide({
  route,
  currentStepIndex,
  isNavigating,
  currentLocation,
  destinationName,
}: UseVoiceGuideProps): UseVoiceGuideReturn {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(speechService.getIsEnabled());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechService.getIsSpeaking());
  const [isSupported] = useState<boolean>(speechService.isVoiceSupported());
  const [characterAction, setCharacterAction] = useState<CharacterState>('idle');
  const [maneuverState, setManeuverState] = useState<
    'idle' | 'walking' | 'turn_left' | 'turn_right' | 'straight' | 'approaching' | 'arrived'
  >('idle');

  // Track triggered voice prompts to prevent repetition and collisions
  const spokenTriggersRef = useRef<Set<string>>(new Set());
  const prevNavigatingRef = useRef<boolean>(false);
  const prevStepIndexRef = useRef<number>(-1);
  const activeRouteIdRef = useRef<string | null>(null);

  // Subscribe to real SpeechService speaking state
  useEffect(() => {
    const unsub = speechService.subscribeSpeaking((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  const toggleVoice = useCallback(() => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    speechService.setEnabled(nextState);
  }, [isVoiceEnabled]);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setIsVoiceEnabled(enabled);
    speechService.setEnabled(enabled);
  }, []);

  const speak = useCallback((text: string, options?: boolean | VoiceOptions) => {
    speechService.speak(text, options);
  }, []);

  const stop = useCallback(() => {
    speechService.stop();
  }, []);

  const unlockAudio = useCallback(() => {
    speechService.unlock();
  }, []);

  // MILESTONE 1: NAVIGATION START
  useEffect(() => {
    if (isNavigating && !prevNavigatingRef.current && route) {
      // New navigation session started
      spokenTriggersRef.current.clear();
      activeRouteIdRef.current = route.id || `${Date.now()}`;
      
      const target = destinationName || route.destinationName;
      const initialStep = route.steps[0];

      setCharacterAction('walk_forward');
      setManeuverState('walking');

      // Build consolidated start message
      let startMsg = `Navigation started. Follow the route to ${target}.`;
      if (initialStep) {
        startMsg += ` In ${initialStep.distanceMeters} metres, ${initialStep.instruction}.`;
        if (initialStep.landmark) {
          startMsg += ` Landmark: ${initialStep.landmark}.`;
        }
        // Mark step 0 as voiced to prevent concurrent duplicate speech collision
        const step0Key = `step-0-${initialStep.instruction}`;
        spokenTriggersRef.current.add(step0Key);
      }

      prevStepIndexRef.current = 0;
      spokenTriggersRef.current.add('nav-start');

      // Speak start instruction with High priority and interrupt flag
      speechService.speak(startMsg, {
        priority: 'high',
        interrupt: true,
        category: 'start',
        force: true,
      });
    }

    // MILESTONE: NAVIGATION CANCELLED / ENDED
    if (!isNavigating && prevNavigatingRef.current) {
      spokenTriggersRef.current.clear();
      prevStepIndexRef.current = -1;
      activeRouteIdRef.current = null;
      setCharacterAction('idle');
      setManeuverState('idle');
      speechService.stop();
    }

    prevNavigatingRef.current = isNavigating;
  }, [isNavigating, route, destinationName]);

  // MILESTONE 2: TURNS, MANEUVERS & STEP TRANSITIONS
  useEffect(() => {
    if (!isNavigating || !route) return;

    const currentStep = route.steps[currentStepIndex];
    if (!currentStep) return;

    const isArrivalStep =
      currentStepIndex === route.steps.length - 1 || currentStep.maneuver === 'arrive';
    const triggerKey = `step-${currentStepIndex}-${currentStep.instruction}`;

    // MILESTONE 4: ARRIVAL
    if (isArrivalStep) {
      setCharacterAction('arrived');
      setManeuverState('arrived');
      if (!spokenTriggersRef.current.has('arrival-trigger')) {
        spokenTriggersRef.current.add('arrival-trigger');
        const dest = destinationName || route.destinationName;
        speechService.speak(`You have reached your destination: ${dest}.`, {
          priority: 'critical',
          interrupt: true,
          category: 'arrival',
          force: true,
        });
      }
      return;
    }

    // Determine Turn / Maneuver Character Action
    if (currentStep.maneuver.includes('left')) {
      setCharacterAction('turn_left');
      setManeuverState('turn_left');
    } else if (currentStep.maneuver.includes('right')) {
      setCharacterAction('turn_right');
      setManeuverState('turn_right');
    } else if (currentStep.maneuver === 'straight') {
      setCharacterAction('walk_forward');
      setManeuverState('straight');
    } else {
      setCharacterAction('walking');
      setManeuverState('walking');
    }

    // Speak Step Instruction on step progression
    if (currentStepIndex !== prevStepIndexRef.current && !spokenTriggersRef.current.has(triggerKey)) {
      spokenTriggersRef.current.add(triggerKey);
      prevStepIndexRef.current = currentStepIndex;

      let msg = '';
      if (currentStep.maneuver.includes('left')) {
        msg = `In ${currentStep.distanceMeters} metres, turn left.`;
      } else if (currentStep.maneuver.includes('right')) {
        msg = `In ${currentStep.distanceMeters} metres, turn right.`;
      } else if (currentStep.maneuver === 'straight') {
        msg = `Continue straight for ${currentStep.distanceMeters} metres.`;
      } else {
        msg = `${currentStep.instruction}.`;
      }

      if (currentStep.landmark) {
        msg += ` Landmark: ${currentStep.landmark}.`;
      }

      speechService.speak(msg, {
        priority: 'high',
        category: 'turn',
        cooldownKey: triggerKey,
      });
    }
  }, [isNavigating, route, currentStepIndex, destinationName]);

  // MILESTONE 3: PROXIMITY APPROACH ANNOUNCEMENTS (100m, 50m)
  useEffect(() => {
    if (!isNavigating || !route) return;

    // Do not play proximity countdowns if at final step
    if (currentStepIndex >= route.steps.length - 1) return;

    const remainingDistance = route.steps
      .slice(currentStepIndex)
      .reduce((sum, s) => sum + s.distanceMeters, 0);

    const roundedDist = Math.round(remainingDistance / 10) * 10;

    if (remainingDistance > 85 && remainingDistance <= 115 && !spokenTriggersRef.current.has('dist-100')) {
      spokenTriggersRef.current.add('dist-100');
      speechService.speak(`Your destination is about 100 metres ahead.`, {
        priority: 'low',
        category: 'proximity',
        cooldownKey: 'dist-100',
      });
    } else if (remainingDistance > 35 && remainingDistance <= 65 && !spokenTriggersRef.current.has('dist-50')) {
      spokenTriggersRef.current.add('dist-50');
      setCharacterAction('look_around');
      speechService.speak(`You are almost there. Your destination is about 50 metres ahead.`, {
        priority: 'low',
        category: 'proximity',
        cooldownKey: 'dist-50',
      });
    }
  }, [isNavigating, route, currentStepIndex]);

  // Public Replay / Repeat Instruction method
  const repeatCurrentInstruction = useCallback(() => {
    if (!isNavigating || !route) {
      speechService.speak(
        'Arunai Engineering College Smart Campus Navigation is ready. Choose a destination or tap any department to begin.',
        {
          priority: 'high',
          interrupt: true,
          force: true,
          category: 'user',
        }
      );
      return;
    }

    const currentStep = route.steps[currentStepIndex];
    const target = destinationName || route.destinationName;

    if (!currentStep) {
      speechService.speak(`Navigating to ${target}. Follow the path highlighted on your map.`, {
        priority: 'high',
        interrupt: true,
        force: true,
        category: 'user',
      });
      return;
    }

    const isArrivalStep =
      currentStepIndex === route.steps.length - 1 || currentStep.maneuver === 'arrive';

    if (isArrivalStep) {
      speechService.speak(`You have reached your destination: ${target}.`, {
        priority: 'critical',
        interrupt: true,
        force: true,
        category: 'user',
      });
      return;
    }

    let repeatMsg = `Step ${currentStepIndex + 1} of ${route.steps.length}: In ${currentStep.distanceMeters} metres, ${currentStep.instruction}.`;
    if (currentStep.landmark) {
      repeatMsg += ` Landmark: ${currentStep.landmark}.`;
    }

    speechService.speak(repeatMsg, {
      priority: 'high',
      interrupt: true,
      force: true,
      category: 'user',
    });
  }, [isNavigating, route, currentStepIndex, destinationName]);

  return {
    isVoiceEnabled,
    isSpeaking,
    isSupported,
    characterAction,
    maneuverState,
    toggleVoice,
    setVoiceEnabled,
    speak,
    stop,
    repeatCurrentInstruction,
    unlockAudio,
  };
}
