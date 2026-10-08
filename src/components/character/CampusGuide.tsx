import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterState, Coordinates, NavigationInstruction } from '../../types';
import { Sparkles, Navigation } from 'lucide-react';
import { getCampusGuideGlbBuffer, CAMPUS_GUIDE_GLB_URL } from './campusGuideGlbAsset';

export interface CampusGuideProps {
  state?: CharacterState;
  destinationCoords?: Coordinates;
  userCoords?: Coordinates;
  bearing?: number;
  nextManeuver?: string;
  maneuver?: any;
  turnDirection?: 'left' | 'right' | 'straight' | null;
  currentLocation?: any;
  nextWaypoint?: any;
  isNavigating?: boolean;
  instruction?: NavigationInstruction;
  isSpeaking?: boolean;
  statusText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showControls?: boolean;
  className?: string;
  onCharacterClick?: () => void;
}

export const CampusGuide: React.FC<CampusGuideProps> = ({
  state = 'idle',
  destinationCoords,
  userCoords,
  bearing,
  nextManeuver,
  maneuver,
  turnDirection: explicitTurnDirection,
  currentLocation,
  nextWaypoint,
  isNavigating: explicitIsNavigating,
  instruction,
  isSpeaking = false,
  statusText,
  size = 'md',
  showControls = true,
  className = '',
  onCharacterClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const isSpeakingRef = useRef(isSpeaking);
  const targetRotationRef = useRef<number>(0);
  const waveStartTimeRef = useRef<number | null>(null);

  // Sync refs to avoid re-instantiating WebGL context on prop changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Derive turn direction from explicit prop, maneuver, or state
  const turnDirection = useMemo(() => {
    if (explicitTurnDirection) return explicitTurnDirection;
    const s = state?.toLowerCase() || '';
    const m = (nextManeuver || (typeof maneuver === 'string' ? maneuver : '') || instruction?.instruction || '').toLowerCase();
    if (s.includes('left') || m.includes('left')) return 'left';
    if (s.includes('right') || m.includes('right')) return 'right';
    return 'straight';
  }, [explicitTurnDirection, state, nextManeuver, maneuver, instruction]);

  const turnRef = useRef(turnDirection);
  useEffect(() => {
    turnRef.current = turnDirection;
  }, [turnDirection]);

  const maneuverRef = useRef(nextManeuver || (typeof maneuver === 'string' ? maneuver : null));
  useEffect(() => {
    maneuverRef.current = nextManeuver || (typeof maneuver === 'string' ? maneuver : null);
  }, [nextManeuver, maneuver]);

  const isNavigating = useMemo(() => {
    if (explicitIsNavigating !== undefined) return explicitIsNavigating;
    return Boolean(destinationCoords && userCoords);
  }, [explicitIsNavigating, destinationCoords, userCoords]);

  const isNavigatingRef = useRef(isNavigating);
  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  // Compute bearing rotation target (converted to radians)
  useEffect(() => {
    if (bearing !== undefined) {
      targetRotationRef.current = (bearing * Math.PI) / 180;
    } else if (turnDirection === 'left') {
      targetRotationRef.current = -0.45;
    } else if (turnDirection === 'right') {
      targetRotationRef.current = 0.45;
    } else {
      targetRotationRef.current = 0;
    }
  }, [bearing, turnDirection]);

  // Master WebGL Scene Setup & Kinematics Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Viewport dimensions
    const width = container.clientWidth || (size === 'xl' ? 320 : size === 'lg' ? 150 : 110);
    const height = container.clientHeight || (size === 'xl' ? 320 : size === 'lg' ? 160 : 130);

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 20);
    // Camera framing for full character presence matching turnaround reference
    if (size === 'xl') {
      camera.position.set(0, 1.05, 3.10);
      camera.lookAt(0, 0.95, 0);
    } else if (size === 'lg') {
      camera.position.set(0, 1.15, 2.75);
      camera.lookAt(0, 1.08, 0);
    } else {
      camera.position.set(0, 1.25, 2.30);
      camera.lookAt(0, 1.15, 0);
    }

    // 2. RENDERER WITH HIGH QUALITY SHADOWS & COLOR MANAGEMENT
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. STUDIO LIGHTING RIG (Optimized for clean, polished NPC character portraiture)
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.15);
    scene.add(ambientLight);

    // Balanced Hemisphere Light (prevents muddy black shadow cavities while maintaining depth)
    const hemiLight = new THREE.HemisphereLight(0xfff9f2, 0x5a423a, 0.65);
    scene.add(hemiLight);

    // Key Light (Warm collegiate illumination from upper-right front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(2.4, 3.8, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Soft Cream Fill Light from upper-left
    const fillLight = new THREE.DirectionalLight(0xfcf5ec, 0.85);
    fillLight.position.set(-2.4, 2.2, 2.2);
    scene.add(fillLight);

    // Dedicated Face Fill / Key Light (Directly illuminates the face to eliminate harsh shadows & dark patches)
    const faceFillLight = new THREE.DirectionalLight(0xfff2e6, 0.90);
    faceFillLight.position.set(0.15, 1.45, 1.8);
    faceFillLight.target.position.set(0, 1.35, 0);
    scene.add(faceFillLight);
    scene.add(faceFillLight.target);

    // Subtle Eye Specular / Catchlight (Creates crisp, sparkling hazel eyes with lively NPC presence)
    const eyeCatchLight = new THREE.PointLight(0xffffff, 0.55, 3.5);
    eyeCatchLight.position.set(0, 1.48, 1.3);
    scene.add(eyeCatchLight);

    // Golden Rim Light (Separates hair silhouette, shoulders, and maroon blazer from background)
    const goldRimLight = new THREE.DirectionalLight(0xd9b360, 1.45);
    goldRimLight.position.set(-2.0, 3.0, -2.6);
    scene.add(goldRimLight);

    // Maroon Bounce from lower floor
    const maroonBounce = new THREE.PointLight(0x611424, 0.40, 4);
    maroonBounce.position.set(0, 0.15, 1.2);
    scene.add(maroonBounce);

    // Character Root in Scene
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    // 4. LOAD MASTER GLB MODEL & BIND HUMANOID RIG NODES
    let isDisposed = false;
    let animationFrameId: number;

    // Skeletal Rig Bones & Expression Nodes
    let pelvis: THREE.Object3D | null = null;
    let torsoGroup: THREE.Object3D | null = null;
    let headGroup: THREE.Object3D | null = null;
    let leftEye: THREE.Object3D | null = null;
    let rightEye: THREE.Object3D | null = null;
    let leftBrow: THREE.Object3D | null = null;
    let rightBrow: THREE.Object3D | null = null;
    let mouthGroup: THREE.Object3D | null = null;

    let leftUpperArm: THREE.Object3D | null = null;
    let leftElbow: THREE.Object3D | null = null;
    let leftWrist: THREE.Object3D | null = null;
    let leftThumb: THREE.Object3D | null = null;
    let leftIndex: THREE.Object3D | null = null;
    let leftMiddle: THREE.Object3D | null = null;
    let leftRing: THREE.Object3D | null = null;
    let leftPinky: THREE.Object3D | null = null;

    let rightUpperArm: THREE.Object3D | null = null;
    let rightElbow: THREE.Object3D | null = null;
    let rightWrist: THREE.Object3D | null = null;
    let rightThumb: THREE.Object3D | null = null;
    let rightIndex: THREE.Object3D | null = null;
    let rightMiddle: THREE.Object3D | null = null;
    let rightRing: THREE.Object3D | null = null;
    let rightPinky: THREE.Object3D | null = null;

    let leftHip: THREE.Object3D | null = null;
    let leftKnee: THREE.Object3D | null = null;
    let rightHip: THREE.Object3D | null = null;
    let rightKnee: THREE.Object3D | null = null;

    // 5. ANIMATION POSE CHANNELS
    const currentPose = {
      pelvisY: 0.90,
      rootRotY: 0,
      torsoRotX: 0,
      torsoRotY: 0,
      torsoRotZ: 0,
      headRotX: 0,
      headRotY: 0,
      headRotZ: 0,

      // Left Arm Chain
      lUpperArmX: 0.08,
      lUpperArmY: 0,
      lUpperArmZ: 0.14,
      lElbowX: -0.15,
      lWristX: 0,
      lWristY: 0,
      lWristZ: 0,

      // Left Hand Digits
      lThumbX: 0.15,
      lThumbZ: 0.42,
      lIndexX: 0.35,
      lMiddleX: 0.40,
      lRingX: 0.45,
      lPinkyX: 0.50,

      // Right Arm Chain
      rUpperArmX: 0.08,
      rUpperArmY: 0,
      rUpperArmZ: -0.14,
      rElbowX: -0.15,
      rWristX: 0,
      rWristY: 0,
      rWristZ: 0,

      // Right Hand Digits
      rThumbX: 0.15,
      rThumbZ: -0.42,
      rIndexX: 0.35,
      rMiddleX: 0.40,
      rRingX: 0.45,
      rPinkyX: 0.50,

      // Legs
      lHipX: 0,
      lKneeX: 0,
      rHipX: 0,
      rKneeX: 0,

      // Expressions
      browY: 0.190,
      browZ: 0.05,
      eyeScaleY: 1.0,
      mouthScaleY: 1.0,
      mouthPosY: 0.052,
    };

    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      const rawState = (stateRef.current || 'idle').toLowerCase();
      const currentTurn = turnRef.current;
      const currentManeuver = maneuverRef.current;
      const speaking = isSpeakingRef.current;
      const navigating = isNavigatingRef.current;

      // Handle Wave 3-Cycle finite duration
      if (rawState === 'wave') {
        if (waveStartTimeRef.current === null) {
          waveStartTimeRef.current = time;
        }
      } else {
        waveStartTimeRef.current = null;
      }

      let effectiveState = rawState;
      if (rawState === 'wave' && waveStartTimeRef.current !== null) {
        const waveElapsed = time - waveStartTimeRef.current;
        if (waveElapsed > 3.6) {
          effectiveState = 'idle';
        }
      }

      // Smooth orientation lerping towards target heading
      const targetRad = targetRotationRef.current;
      const angleDiff = Math.atan2(Math.sin(targetRad - currentPose.rootRotY), Math.cos(targetRad - currentPose.rootRotY));
      currentPose.rootRotY += angleDiff * Math.min(1, delta * 5.0);
      characterRoot.rotation.y = currentPose.rootRotY;

      // TARGET POSE DEFAULT (Relaxed idle with natural breathing)
      const targetPose = {
        pelvisY: 0.90 + Math.sin(time * 2.2) * 0.008,
        torsoRotX: 0,
        torsoRotY: 0,
        torsoRotZ: 0,
        headRotX: 0,
        headRotY: 0,
        headRotZ: 0,

        // Left Arm Chain
        lUpperArmX: 0.08,
        lUpperArmY: 0,
        lUpperArmZ: 0.14,
        lElbowX: -0.15,
        lWristX: 0,
        lWristY: 0,
        lWristZ: 0,

        // Left Hand Digits (Relaxed pose default)
        lThumbX: 0.15,
        lThumbZ: 0.42,
        lIndexX: 0.35,
        lMiddleX: 0.40,
        lRingX: 0.45,
        lPinkyX: 0.50,

        // Right Arm Chain
        rUpperArmX: 0.08,
        rUpperArmY: 0,
        rUpperArmZ: -0.14,
        rElbowX: -0.15,
        rWristX: 0,
        rWristY: 0,
        rWristZ: 0,

        // Right Hand Digits (Relaxed pose default)
        rThumbX: 0.15,
        rThumbZ: -0.42,
        rIndexX: 0.35,
        rMiddleX: 0.40,
        rRingX: 0.45,
        rPinkyX: 0.50,

        // Legs
        lHipX: 0,
        lKneeX: 0,
        rHipX: 0,
        rKneeX: 0,

        // Facial Channels
        browY: 0.190,
        browZ: 0.05,
        eyeScaleY: 1.0,
        mouthScaleY: 1.0,
        mouthPosY: 0.052,
      };

      // Natural eye blinking cycle
      const blinkCycle = time % 4.0;
      const isBlinking = blinkCycle > 3.82 && blinkCycle < 3.96;
      targetPose.eyeScaleY = isBlinking ? 0.08 : 1.0;

      // Check navigation states
      const isTurnLeft =
        effectiveState === 'turn_left' ||
        effectiveState === 'walk_left' ||
        effectiveState === 'point_left' ||
        currentTurn === 'left' ||
        currentManeuver?.includes('left');

      const isTurnRight =
        effectiveState === 'turn_right' ||
        effectiveState === 'walk_right' ||
        effectiveState === 'point_right' ||
        currentTurn === 'right' ||
        currentManeuver?.includes('right');

      const isWalking =
        effectiveState === 'walking' ||
        effectiveState === 'walk' ||
        effectiveState === 'walk_forward' ||
        effectiveState === 'running' ||
        navigating;

      // ACTION POSES & GESTURES
      if (effectiveState === 'arrived' || effectiveState === 'celebrate') {
        // --- 1. ARRIVAL & CELEBRATION (Master Character: triumphant welcoming collegiate pose) ---
        const cheerSway = Math.sin(time * 5.0) * 0.15;
        targetPose.pelvisY = 0.90 + Math.abs(Math.sin(time * 4.0)) * 0.025;

        // Open collegiate cheer gesture: both arms raised high and wide of head
        targetPose.lUpperArmX = -1.25 + cheerSway * 0.2;
        targetPose.lUpperArmZ = 0.85;
        targetPose.lElbowX = -0.55;
        targetPose.lWristZ = cheerSway * 0.3;

        targetPose.rUpperArmX = -1.25 - cheerSway * 0.2;
        targetPose.rUpperArmZ = -0.85;
        targetPose.rElbowX = -0.55;
        targetPose.rWristZ = -cheerSway * 0.3;

        // Open Hands (Fingers extended & spread)
        targetPose.lIndexX = 0.05;
        targetPose.lMiddleX = 0.05;
        targetPose.lRingX = 0.05;
        targetPose.lPinkyX = 0.05;
        targetPose.rIndexX = 0.05;
        targetPose.rMiddleX = 0.05;
        targetPose.rRingX = 0.05;
        targetPose.rPinkyX = 0.05;

        // Arrival Expression: Bright celebratory smile & raised happy brows
        targetPose.headRotY = Math.sin(time * 2.0) * 0.12;
        targetPose.headRotZ = Math.sin(time * 2.5) * 0.04;
        targetPose.browY = 0.198;
        targetPose.browZ = 0.09;
        targetPose.mouthScaleY = 1.8;
        targetPose.mouthPosY = 0.048;
      } else if (isTurnLeft) {
        // --- 2. TURN LEFT / POINT LEFT (Master Character: walking gait + left pointing hand) ---
        const walkSpeed = 5.2;
        const stride = Math.sin(time * walkSpeed);
        targetPose.lHipX = stride * 0.42;
        targetPose.rHipX = -stride * 0.42;
        targetPose.lKneeX = Math.max(0, -stride * 0.38);
        targetPose.rKneeX = Math.max(0, stride * 0.38);
        targetPose.pelvisY = 0.90 + Math.abs(Math.cos(time * walkSpeed)) * 0.028;

        targetPose.torsoRotZ = 0.06;
        targetPose.torsoRotY = 0.15;
        targetPose.headRotY = 0.42;

        // Left Arm points leftwards with safe clearance
        targetPose.lUpperArmX = -1.35;
        targetPose.lUpperArmY = -0.32;
        targetPose.lUpperArmZ = 0.65;
        targetPose.lElbowX = -0.22;
        targetPose.lWristZ = -0.25;

        // Left Hand in Pointing Pose: Index straight, Thumb folded, others curled in
        targetPose.lIndexX = 0.0;
        targetPose.lThumbX = 0.35;
        targetPose.lMiddleX = 1.35;
        targetPose.lRingX = 1.45;
        targetPose.lPinkyX = 1.50;

        // Right Arm counterbalances
        targetPose.rUpperArmX = stride * 0.32;
        targetPose.rUpperArmZ = -0.14;
        targetPose.rElbowX = -0.22;

        // Focused navigation brows
        targetPose.browY = 0.188;
        targetPose.browZ = 0.02;
      } else if (isTurnRight) {
        // --- 3. TURN RIGHT / POINT RIGHT (Master Character: walking gait + right pointing hand) ---
        const walkSpeed = 5.2;
        const stride = Math.sin(time * walkSpeed);
        targetPose.lHipX = stride * 0.42;
        targetPose.rHipX = -stride * 0.42;
        targetPose.lKneeX = Math.max(0, -stride * 0.38);
        targetPose.rKneeX = Math.max(0, stride * 0.38);
        targetPose.pelvisY = 0.90 + Math.abs(Math.cos(time * walkSpeed)) * 0.028;

        targetPose.torsoRotZ = -0.06;
        targetPose.torsoRotY = -0.15;
        targetPose.headRotY = -0.42;

        // Right Arm points rightwards
        targetPose.rUpperArmX = -1.35;
        targetPose.rUpperArmY = 0.32;
        targetPose.rUpperArmZ = -0.65;
        targetPose.rElbowX = -0.22;
        targetPose.rWristZ = 0.25;

        // Right Hand in Pointing Pose: Index straight, others curled
        targetPose.rIndexX = 0.0;
        targetPose.rThumbX = 0.35;
        targetPose.rMiddleX = 1.35;
        targetPose.rRingX = 1.45;
        targetPose.rPinkyX = 1.50;

        // Left Arm counterbalances
        targetPose.lUpperArmX = -stride * 0.32;
        targetPose.lUpperArmZ = 0.14;
        targetPose.lElbowX = -0.22;

        targetPose.browY = 0.188;
        targetPose.browZ = 0.02;
      } else if (effectiveState === 'point_forward') {
        // --- 4. POINT FORWARD (Directs path along campus avenue) ---
        targetPose.rUpperArmX = -1.45;
        targetPose.rUpperArmY = -0.12;
        targetPose.rUpperArmZ = -0.18;
        targetPose.rElbowX = -0.18;

        // Right Hand in Pointing Pose
        targetPose.rIndexX = 0.0;
        targetPose.rThumbX = 0.35;
        targetPose.rMiddleX = 1.35;
        targetPose.rRingX = 1.45;
        targetPose.rPinkyX = 1.50;

        targetPose.lUpperArmX = 0.08;
        targetPose.lUpperArmZ = 0.14;
        targetPose.lElbowX = -0.15;
        targetPose.headRotY = 0;

        targetPose.browY = 0.188;
        targetPose.browZ = 0.02;
      } else if (effectiveState === 'wave') {
        // --- 5. WELCOME WAVE (Master Character: hand held safely BESIDE the head, Open Hand Pose) ---
        const waveAngle = Math.sin(time * 7.0);
        targetPose.rUpperArmX = -1.20;
        targetPose.rUpperArmY = -0.10;
        targetPose.rUpperArmZ = -0.75; // Extended well out to right side (>15cm clear of head)
        targetPose.rElbowX = -1.35; // Flexed elbow
        targetPose.rWristZ = waveAngle * 0.32;
        targetPose.rWristX = 0.15;

        // Open Hand Pose for welcoming gesture
        targetPose.rIndexX = 0.05;
        targetPose.rMiddleX = 0.05;
        targetPose.rRingX = 0.05;
        targetPose.rPinkyX = 0.05;

        targetPose.lUpperArmX = 0.08;
        targetPose.lUpperArmZ = 0.14;
        targetPose.lElbowX = -0.15;

        // Friendly warm smile & elevated brows
        targetPose.headRotY = 0.15;
        targetPose.headRotZ = 0.06;
        targetPose.browY = 0.196;
        targetPose.browZ = 0.08;
        targetPose.mouthScaleY = 1.4;
      } else if (effectiveState === 'talk' || speaking) {
        // --- 6. TALK / CONVERSATIONAL GUIDANCE (Phonetic visemes & communicative gestures) ---
        const talkWave = Math.sin(time * 3.5) * 0.18;
        targetPose.rUpperArmX = -0.75 + talkWave;
        targetPose.rUpperArmY = -0.15;
        targetPose.rUpperArmZ = -0.28;
        targetPose.rElbowX = -0.85 + talkWave * 0.4;
        targetPose.rWristX = 0.1;

        targetPose.lUpperArmX = -0.65 - talkWave;
        targetPose.lUpperArmY = 0.15;
        targetPose.lUpperArmZ = 0.28;
        targetPose.lElbowX = -0.75;

        targetPose.headRotY = Math.sin(time * 1.8) * 0.14;
        targetPose.headRotX = Math.sin(time * 6.0) * 0.04;

        // Phonetic mouth syllables
        const syllable = Math.sin(time * 16) * 0.5 + 0.5;
        targetPose.mouthScaleY = 1.0 + syllable * 2.2;
        targetPose.mouthPosY = 0.052 - syllable * 0.012;

        targetPose.browY = 0.192 + Math.sin(time * 3.0) * 0.004;
      } else if (effectiveState === 'look_around') {
        // --- 7. LOOK AROUND (Smooth scanning of campus landmarks) ---
        targetPose.headRotY = Math.sin(time * 1.5) * 0.55;
        targetPose.torsoRotY = Math.sin(time * 1.5) * 0.12;

        targetPose.lUpperArmX = 0.10;
        targetPose.lUpperArmZ = 0.14;
        targetPose.lElbowX = -0.15;

        targetPose.rUpperArmX = 0.10;
        targetPose.rUpperArmZ = -0.14;
        targetPose.rElbowX = -0.15;

        // Alert scanning brows
        targetPose.browY = 0.195;
        targetPose.browZ = 0.03;
      } else if (isWalking) {
        // --- 8. SYNCHRONIZED WALKING GAIT (Anatomical bipedal walk forward) ---
        const walkSpeed = effectiveState === 'running' ? 8.8 : 5.8;
        const stride = Math.sin(time * walkSpeed);
        const counterStride = Math.cos(time * walkSpeed);

        targetPose.lHipX = stride * 0.52;
        targetPose.rHipX = -stride * 0.52;
        targetPose.lKneeX = Math.max(0, -stride * 0.44);
        targetPose.rKneeX = Math.max(0, stride * 0.44);

        targetPose.lUpperArmX = -stride * 0.40;
        targetPose.rUpperArmX = stride * 0.40;
        targetPose.lUpperArmZ = 0.14;
        targetPose.rUpperArmZ = -0.14;
        targetPose.lElbowX = -0.25;
        targetPose.rElbowX = -0.25;

        targetPose.pelvisY = 0.90 + Math.abs(counterStride) * 0.035;
        targetPose.headRotY = Math.sin(time * 2.8) * 0.04;

        // Focused navigation expression
        targetPose.browY = 0.188;
        targetPose.browZ = 0.03;
      } else {
        // --- 9. IDLE (Master Reference: relaxed arms resting at sides, friendly intelligent demeanor) ---
        const idleSway = Math.sin(time * 1.6) * 0.025;
        targetPose.lUpperArmX = 0.08 + idleSway;
        targetPose.lUpperArmZ = 0.14;
        targetPose.lElbowX = -0.14;

        targetPose.rUpperArmX = 0.08 - idleSway;
        targetPose.rUpperArmZ = -0.14;
        targetPose.rElbowX = -0.14;

        targetPose.headRotY = Math.sin(time * 0.85) * 0.06;
      }

      // UNIVERSAL EXPONENTIAL POSE DAMPING (Guarantees zero snapping between all states)
      const dampFactor = 12.0;
      const damp = (curr: number, targ: number) => THREE.MathUtils.damp(curr, targ, dampFactor, delta);

      currentPose.pelvisY = damp(currentPose.pelvisY, targetPose.pelvisY);
      if (pelvis) pelvis.position.y = currentPose.pelvisY;

      currentPose.torsoRotX = damp(currentPose.torsoRotX, targetPose.torsoRotX);
      currentPose.torsoRotY = damp(currentPose.torsoRotY, targetPose.torsoRotY);
      currentPose.torsoRotZ = damp(currentPose.torsoRotZ, targetPose.torsoRotZ);
      if (torsoGroup) torsoGroup.rotation.set(currentPose.torsoRotX, currentPose.torsoRotY, currentPose.torsoRotZ);

      currentPose.headRotX = damp(currentPose.headRotX, targetPose.headRotX);
      currentPose.headRotY = damp(currentPose.headRotY, targetPose.headRotY);
      currentPose.headRotZ = damp(currentPose.headRotZ, targetPose.headRotZ);
      if (headGroup) headGroup.rotation.set(currentPose.headRotX, currentPose.headRotY, currentPose.headRotZ);

      // Left Arm Chain
      currentPose.lUpperArmX = damp(currentPose.lUpperArmX, targetPose.lUpperArmX);
      currentPose.lUpperArmY = damp(currentPose.lUpperArmY, targetPose.lUpperArmY);
      currentPose.lUpperArmZ = damp(currentPose.lUpperArmZ, targetPose.lUpperArmZ);
      if (leftUpperArm) leftUpperArm.rotation.set(currentPose.lUpperArmX, currentPose.lUpperArmY, currentPose.lUpperArmZ);

      currentPose.lElbowX = damp(currentPose.lElbowX, targetPose.lElbowX);
      if (leftElbow) leftElbow.rotation.x = currentPose.lElbowX;

      currentPose.lWristX = damp(currentPose.lWristX, targetPose.lWristX);
      currentPose.lWristZ = damp(currentPose.lWristZ, targetPose.lWristZ);
      if (leftWrist) leftWrist.rotation.set(currentPose.lWristX, 0, currentPose.lWristZ);

      // Left Hand Digits
      currentPose.lThumbX = damp(currentPose.lThumbX, targetPose.lThumbX);
      currentPose.lIndexX = damp(currentPose.lIndexX, targetPose.lIndexX);
      currentPose.lMiddleX = damp(currentPose.lMiddleX, targetPose.lMiddleX);
      currentPose.lRingX = damp(currentPose.lRingX, targetPose.lRingX);
      currentPose.lPinkyX = damp(currentPose.lPinkyX, targetPose.lPinkyX);
      if (leftThumb) leftThumb.rotation.x = currentPose.lThumbX;
      if (leftIndex) leftIndex.rotation.x = currentPose.lIndexX;
      if (leftMiddle) leftMiddle.rotation.x = currentPose.lMiddleX;
      if (leftRing) leftRing.rotation.x = currentPose.lRingX;
      if (leftPinky) leftPinky.rotation.x = currentPose.lPinkyX;

      // Right Arm Chain
      currentPose.rUpperArmX = damp(currentPose.rUpperArmX, targetPose.rUpperArmX);
      currentPose.rUpperArmY = damp(currentPose.rUpperArmY, targetPose.rUpperArmY);
      currentPose.rUpperArmZ = damp(currentPose.rUpperArmZ, targetPose.rUpperArmZ);
      if (rightUpperArm) rightUpperArm.rotation.set(currentPose.rUpperArmX, currentPose.rUpperArmY, currentPose.rUpperArmZ);

      currentPose.rElbowX = damp(currentPose.rElbowX, targetPose.rElbowX);
      if (rightElbow) rightElbow.rotation.x = currentPose.rElbowX;

      currentPose.rWristX = damp(currentPose.rWristX, targetPose.rWristX);
      currentPose.rWristZ = damp(currentPose.rWristZ, targetPose.rWristZ);
      if (rightWrist) rightWrist.rotation.set(currentPose.rWristX, 0, currentPose.rWristZ);

      // Right Hand Digits
      currentPose.rThumbX = damp(currentPose.rThumbX, targetPose.rThumbX);
      currentPose.rIndexX = damp(currentPose.rIndexX, targetPose.rIndexX);
      currentPose.rMiddleX = damp(currentPose.rMiddleX, targetPose.rMiddleX);
      currentPose.rRingX = damp(currentPose.rRingX, targetPose.rRingX);
      currentPose.rPinkyX = damp(currentPose.rPinkyX, targetPose.rPinkyX);
      if (rightThumb) rightThumb.rotation.x = currentPose.rThumbX;
      if (rightIndex) rightIndex.rotation.x = currentPose.rIndexX;
      if (rightMiddle) rightMiddle.rotation.x = currentPose.rMiddleX;
      if (rightRing) rightRing.rotation.x = currentPose.rRingX;
      if (rightPinky) rightPinky.rotation.x = currentPose.rPinkyX;

      // Legs
      currentPose.lHipX = damp(currentPose.lHipX, targetPose.lHipX);
      currentPose.lKneeX = damp(currentPose.lKneeX, targetPose.lKneeX);
      if (leftHip) leftHip.rotation.x = currentPose.lHipX;
      if (leftKnee) leftKnee.rotation.x = currentPose.lKneeX;

      currentPose.rHipX = damp(currentPose.rHipX, targetPose.rHipX);
      currentPose.rKneeX = damp(currentPose.rKneeX, targetPose.rKneeX);
      if (rightHip) rightHip.rotation.x = currentPose.rHipX;
      if (rightKnee) rightKnee.rotation.x = currentPose.rKneeX;

      // Eyebrows & Eyes
      currentPose.browY = damp(currentPose.browY, targetPose.browY);
      currentPose.browZ = damp(currentPose.browZ, targetPose.browZ);
      if (leftBrow) {
        leftBrow.position.y = currentPose.browY;
        leftBrow.rotation.z = currentPose.browZ;
      }
      if (rightBrow) {
        rightBrow.position.y = currentPose.browY;
        rightBrow.rotation.z = -currentPose.browZ;
      }

      currentPose.eyeScaleY = damp(currentPose.eyeScaleY, targetPose.eyeScaleY);
      if (leftEye) leftEye.scale.y = currentPose.eyeScaleY;
      if (rightEye) rightEye.scale.y = currentPose.eyeScaleY;

      // Animated Mouth
      currentPose.mouthScaleY = damp(currentPose.mouthScaleY, targetPose.mouthScaleY);
      currentPose.mouthPosY = damp(currentPose.mouthPosY, targetPose.mouthPosY);
      if (mouthGroup) {
        mouthGroup.scale.y = currentPose.mouthScaleY;
        mouthGroup.position.y = currentPose.mouthPosY;
      }

      renderer.render(scene, camera);
    };

    // Load and bind Master GLB Model
    const loader = new GLTFLoader();

    const onModelLoaded = (gltf: any) => {
      if (isDisposed) return;
      const model = gltf.scene;

      // Selective shadow mapping: body and clothing cast realistic shadows onto the ground and each other,
      // while facial features (hair, glasses, eyes, brow, nose, chin) do not cast or receive harsh dark shadow map occlusions.
      model.traverse((child: any) => {
        if (child.isMesh) {
          const name = child.name || '';
          const isFacialOrHead =
            name === 'head' ||
            name === 'chin' ||
            name === 'nose' ||
            name.startsWith('nose') ||
            name.includes('Ear') ||
            name.includes('hair') ||
            name.includes('Eye') ||
            name.includes('Iris') ||
            name.includes('Pupil') ||
            name.includes('Brow') ||
            name.includes('Rim') ||
            name.includes('Lens') ||
            name.includes('Bridge') ||
            name.includes('Temple') ||
            name.includes('Lip') ||
            name.includes('teeth') ||
            name.includes('glasses');

          if (isFacialOrHead) {
            child.castShadow = false;
            child.receiveShadow = false;
          } else {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }
      });

      characterRoot.add(model);

      // Bind skeletal rig nodes
      pelvis = model.getObjectByName('pelvis') || null;
      torsoGroup = model.getObjectByName('torsoGroup') || null;
      headGroup = model.getObjectByName('headGroup') || null;
      leftEye = model.getObjectByName('leftEye') || null;
      rightEye = model.getObjectByName('rightEye') || null;
      leftBrow = model.getObjectByName('leftBrow') || null;
      rightBrow = model.getObjectByName('rightBrow') || null;
      mouthGroup = model.getObjectByName('mouthGroup') || null;

      // Left arm and articulated digits
      leftUpperArm = model.getObjectByName('leftUpperArm') || null;
      leftElbow = model.getObjectByName('leftElbow') || null;
      leftWrist = model.getObjectByName('leftWrist') || null;
      leftThumb = model.getObjectByName('leftThumb') || null;
      leftIndex = model.getObjectByName('leftIndex') || null;
      leftMiddle = model.getObjectByName('leftMiddle') || null;
      leftRing = model.getObjectByName('leftRing') || null;
      leftPinky = model.getObjectByName('leftPinky') || null;

      // Right arm and articulated digits
      rightUpperArm = model.getObjectByName('rightUpperArm') || null;
      rightElbow = model.getObjectByName('rightElbow') || null;
      rightWrist = model.getObjectByName('rightWrist') || null;
      rightThumb = model.getObjectByName('rightThumb') || null;
      rightIndex = model.getObjectByName('rightIndex') || null;
      rightMiddle = model.getObjectByName('rightMiddle') || null;
      rightRing = model.getObjectByName('rightRing') || null;
      rightPinky = model.getObjectByName('rightPinky') || null;

      // Legs
      leftHip = model.getObjectByName('leftHip') || null;
      leftKnee = model.getObjectByName('leftKnee') || null;
      rightHip = model.getObjectByName('rightHip') || null;
      rightKnee = model.getObjectByName('rightKnee') || null;

      // Start animation loop
      animate();
    };

    // Instant parse from pre-compiled buffer to eliminate network latency & iframe sandbox restrictions
    try {
      const buffer = getCampusGuideGlbBuffer();
      loader.parse(buffer, '', onModelLoaded, (err) => {
        console.warn('Failed to parse bundled GLB buffer, falling back to URL fetch:', err);
        loader.load(CAMPUS_GUIDE_GLB_URL, onModelLoaded, undefined, (fetchErr) => {
          console.error('Failed to load Master Campus Guide GLB model:', fetchErr);
        });
      });
    } catch (err) {
      console.warn('Error loading buffer, falling back to URL:', err);
      loader.load(CAMPUS_GUIDE_GLB_URL, onModelLoaded);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 110;
      const h = container.clientHeight || 130;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  // Maneuver badge label formatting
  const actionLabel = useMemo(() => {
    if (state === 'arrived' || state === 'celebrate') return 'Destination Reached';
    if (turnDirection === 'left' || nextManeuver?.includes('left') || state?.includes('left')) return 'Turn Left Ahead';
    if (turnDirection === 'right' || nextManeuver?.includes('right') || state?.includes('right')) return 'Turn Right Ahead';
    if (nextManeuver === 'straight' || state === 'point_forward') return 'Continue Straight';
    if (isNavigating) return 'Following Route';
    if (isSpeaking) return 'Speaking Guide';
    return 'Campus Guide';
  }, [state, turnDirection, nextManeuver, isNavigating, isSpeaking]);

  return (
    <div
      onClick={onCharacterClick}
      className={`glass-panel rounded-2xl p-2 transition-all shadow-lg border border-[#C9A45C]/30 select-none group flex flex-col items-center relative box-border ${
        size === 'xl' ? 'w-full max-w-sm' : size === 'lg' ? 'w-36 sm:w-40' : 'w-26 sm:w-32'
      } ${className}`}
      role="region"
      aria-label={`Arunai Engineering College 3D Campus Guide Assistant. Action: ${actionLabel}. ${isSpeaking ? 'Voice guidance speaking.' : ''}`}
    >
      {/* Speaking Pulse Ring */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none ring-2 ring-[#C9A45C] ring-offset-2 ring-offset-transparent animate-pulse">
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A45C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#611424]"></span>
          </span>
        </div>
      )}

      {/* 3D Canvas Mounting Container */}
      <div
        ref={mountRef}
        className={`w-full overflow-hidden rounded-xl flex items-center justify-center relative ${
          size === 'xl' ? 'h-64 sm:h-72' : size === 'lg' ? 'h-36 sm:h-40' : 'h-24 sm:h-28'
        }`}
      />

      {/* Action & Directional Status Footer */}
      {showControls && (
        <div className="w-full text-center mt-1.5 px-0.5">
          <div className="flex items-center justify-center gap-1">
            {isSpeaking ? (
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-2.5 bg-[#C9A45C] animate-pulse rounded-full" />
                <span className="w-1 h-3.5 bg-[#611424] animate-pulse rounded-full" />
                <span className="w-1 h-2 bg-[#C9A45C] animate-pulse rounded-full" />
              </span>
            ) : isNavigating ? (
              <Navigation className="w-2.5 h-2.5 text-[#C9A45C]" />
            ) : (
              <Sparkles className="w-2.5 h-2.5 text-[#C9A45C]" />
            )}
            <span className="text-[10px] sm:text-[11px] font-bold text-[#611424] truncate uppercase tracking-tight">
              {actionLabel}
            </span>
          </div>

          {statusText && (
            <span className="text-[9px] text-[#75666A] block truncate max-w-[110px] mx-auto font-medium">
              {statusText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
