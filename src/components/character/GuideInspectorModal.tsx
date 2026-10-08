import React, { useState, useEffect, useRef } from 'react';
import { CampusGuide } from './CampusGuide';
import { CharacterState } from '../../types';
import { speechService } from '../../services/speechService';
import {
  X,
  Sparkles,
  Hand,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MessageSquare,
  Award,
  Eye,
  Footprints,
  Compass,
  RotateCw,
  Layers,
  Smile,
} from 'lucide-react';

interface GuideInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideInspectorModal: React.FC<GuideInspectorModalProps> = ({ isOpen, onClose }) => {
  const [activeState, setActiveState] = useState<CharacterState>('idle');
  const [bearingAngle, setBearingAngle] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechService.getIsSpeaking());
  const [statusMessage, setStatusMessage] = useState<string>('Ready for interactive exploration');
  const autoRotateIntervalRef = useRef<number | null>(null);

  // Subscribe to real speechService speaking state
  useEffect(() => {
    const unsub = speechService.subscribeSpeaking((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  // Auto-rotate 360° turntable loop
  useEffect(() => {
    if (isAutoRotating) {
      autoRotateIntervalRef.current = window.setInterval(() => {
        setBearingAngle((prev) => (prev + 3) % 360);
      }, 50);
    } else if (autoRotateIntervalRef.current !== null) {
      clearInterval(autoRotateIntervalRef.current);
      autoRotateIntervalRef.current = null;
    }

    return () => {
      if (autoRotateIntervalRef.current !== null) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, [isAutoRotating]);

  if (!isOpen) return null;

  // Complete Master Action Poses from Character Sheet
  const masterActionPoses: Record<
    string,
    {
      state: CharacterState;
      label: string;
      desc: string;
      speech: string;
      status: string;
      handPose: 'Open Hand' | 'Pointing Hand' | 'Relaxed Hand';
      expression: 'Neutral' | 'Smile' | 'Talking' | 'Focused Navigation' | 'Alert' | 'Confident' | 'Friendly' | 'Arrival';
      bearing?: number;
      duration?: number;
    }
  > = {
    idle: {
      state: 'idle',
      label: 'Idle',
      desc: 'Relaxed posture, gentle breathing',
      speech: 'Arunai Engineering College campus guide standing by.',
      status: 'Idle & Standing By',
      handPose: 'Relaxed Hand',
      expression: 'Friendly',
      bearing: 0,
    },
    welcome: {
      state: 'wave',
      label: 'Welcome Wave',
      desc: '3 cycles beside head, open hand',
      speech: 'Vanakkam! Welcome to Arunai Engineering College Smart Campus Navigation.',
      status: 'Welcome Wave (Open Hand)',
      handPose: 'Open Hand',
      expression: 'Friendly',
      bearing: 0,
      duration: 3800,
    },
    walk: {
      state: 'walking',
      label: 'Walk Forward',
      desc: 'Synchronized bipedal gait',
      speech: 'Navigation active. Follow the designated campus route.',
      status: 'Walking Forward',
      handPose: 'Relaxed Hand',
      expression: 'Focused Navigation',
      bearing: 0,
    },
    point_left: {
      state: 'point_left',
      label: 'Point Left',
      desc: 'Left IK arm + pointing finger',
      speech: 'Turn left ahead toward Dr. Vikram Sarabhai Technology Block.',
      status: 'Pointing Left (Pointing Hand)',
      handPose: 'Pointing Hand',
      expression: 'Focused Navigation',
      bearing: -35,
    },
    point_right: {
      state: 'point_right',
      label: 'Point Right',
      desc: 'Right IK arm + pointing finger',
      speech: 'Turn right ahead toward Dr. A.P.J. Abdul Kalam Central Library.',
      status: 'Pointing Right (Pointing Hand)',
      handPose: 'Pointing Hand',
      expression: 'Focused Navigation',
      bearing: 35,
    },
    point_forward: {
      state: 'point_forward',
      label: 'Point Forward',
      desc: 'Directs along central avenue',
      speech: 'Continue straight along the central campus avenue.',
      status: 'Pointing Forward (Pointing Hand)',
      handPose: 'Pointing Hand',
      expression: 'Focused Navigation',
      bearing: 0,
    },
    turn_left: {
      state: 'turn_left',
      label: 'Turn Left',
      desc: 'Turning walk + left point',
      speech: 'In 40 metres, make a left turn toward the Department Wing.',
      status: 'Turn Left Maneuver',
      handPose: 'Pointing Hand',
      expression: 'Alert',
      bearing: -45,
    },
    turn_right: {
      state: 'turn_right',
      label: 'Turn Right',
      desc: 'Turning walk + right point',
      speech: 'In 40 metres, make a right turn toward the Administrative Block.',
      status: 'Turn Right Maneuver',
      handPose: 'Pointing Hand',
      expression: 'Alert',
      bearing: 45,
    },
    talk: {
      state: 'talk',
      label: 'Voice Guide',
      desc: 'Mouth visemes & talking arm',
      speech: 'I am your Arunai Engineering College 3D Smart Campus Guide, here to navigate you.',
      status: 'Talking & Visemes',
      handPose: 'Relaxed Hand',
      expression: 'Talking',
      bearing: 0,
      duration: 4000,
    },
    scan: {
      state: 'look_around',
      label: 'Look Around',
      desc: 'Scans campus left & right',
      speech: 'Scanning campus landmarks, laboratories, and student amenities.',
      status: 'Scanning Campus Area',
      handPose: 'Relaxed Hand',
      expression: 'Alert',
      bearing: 0,
    },
    arrived: {
      state: 'arrived',
      label: 'Destination Arrival',
      desc: 'Double arm celebration + open hands',
      speech: 'You have reached your destination. Welcome to Arunai Engineering College!',
      status: 'Destination Reached (Arrival Celebration)',
      handPose: 'Open Hand',
      expression: 'Arrival',
      bearing: 0,
      duration: 4500,
    },
  };

  const handleTriggerAction = (key: keyof typeof masterActionPoses) => {
    const action = masterActionPoses[key];
    setActiveState(action.state);
    setStatusMessage(action.status);
    if (action.bearing !== undefined) {
      setBearingAngle(action.bearing);
    }

    if (speechService.getIsEnabled()) {
      speechService.speak(action.speech, {
        priority: 'high',
        interrupt: true,
        force: true,
        category: 'user',
      });
    }

    if (action.duration) {
      setTimeout(() => {
        setActiveState('idle');
        setStatusMessage('Ready for navigation');
      }, action.duration);
    }
  };

  const currentPoseMeta = Object.values(masterActionPoses).find((p) => p.state === activeState) || masterActionPoses.idle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#FFFDF8] rounded-3xl border border-[#C9A45C]/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 box-border flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#611424] to-[#420e18] text-white flex items-center justify-between border-b border-[#C9A45C]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#420e18] border border-[#C9A45C]/60 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#C9A45C] block">
                ARUNAI ENGINEERING COLLEGE
              </span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight">
                3D Master Campus Guide Rig & Turnaround
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Character Viewport */}
        <div className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#EFE7D8] flex flex-col items-center justify-center p-2.5 border-b border-[#E8DFD3] shrink-0">
          <div className="w-full h-64 sm:h-72 flex items-center justify-center relative">
            <CampusGuide
              state={activeState}
              bearing={bearingAngle}
              isSpeaking={isSpeaking}
              statusText={statusMessage}
              size="xl"
              showControls={false}
              className="bg-transparent shadow-none border-none w-full h-full p-0 flex items-center justify-center"
            />

            {/* Live Character Sheet Status Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8DFD3] text-[10px] shadow-2xs flex items-center gap-1.5">
                <Hand className="w-3 h-3 text-[#C9A45C]" />
                <span className="text-[#75666A]">Hand:</span>
                <span className="font-bold text-[#611424]">{currentPoseMeta.handPose}</span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#E8DFD3] text-[10px] shadow-2xs flex items-center gap-1.5">
                <Smile className="w-3 h-3 text-[#C9A45C]" />
                <span className="text-[#75666A]">Face:</span>
                <span className="font-bold text-[#611424]">{currentPoseMeta.expression}</span>
              </div>
            </div>
          </div>

          {/* Turnaround Views Controls (Front, 3/4 View, Right, Back, Left, Turntable) */}
          <div className="w-full mt-2 px-3 py-1.5 bg-white/95 rounded-2xl border border-[#E8DFD3] flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold text-[#611424] shadow-2xs">
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span className="text-[10px] uppercase tracking-wider text-[#75666A]">Turnaround Views:</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsAutoRotating(false);
                  setBearingAngle(0);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[10px] ${
                  bearingAngle === 0 && !isAutoRotating ? 'bg-[#611424] text-white' : 'hover:bg-[#FAF6EE] text-[#611424]'
                }`}
                title="Front View (0°)"
              >
                Front
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoRotating(false);
                  setBearingAngle(45);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[10px] ${
                  bearingAngle === 45 && !isAutoRotating ? 'bg-[#611424] text-white' : 'hover:bg-[#FAF6EE] text-[#611424]'
                }`}
                title="3/4 View (+45°)"
              >
                3/4 View
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoRotating(false);
                  setBearingAngle(90);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[10px] ${
                  bearingAngle === 90 && !isAutoRotating ? 'bg-[#611424] text-white' : 'hover:bg-[#FAF6EE] text-[#611424]'
                }`}
                title="Right Side (+90°)"
              >
                Right Side
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoRotating(false);
                  setBearingAngle(180);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[10px] ${
                  bearingAngle === 180 && !isAutoRotating ? 'bg-[#611424] text-white' : 'hover:bg-[#FAF6EE] text-[#611424]'
                }`}
                title="Back View (180°)"
              >
                Back View
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoRotating(false);
                  setBearingAngle(-90);
                }}
                className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-[10px] ${
                  bearingAngle === -90 && !isAutoRotating ? 'bg-[#611424] text-white' : 'hover:bg-[#FAF6EE] text-[#611424]'
                }`}
                title="Left Side (-90°)"
              >
                Left Side
              </button>

              <button
                type="button"
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`ml-1 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[10px] ${
                  isAutoRotating ? 'bg-[#C9A45C] text-[#241A1E]' : 'bg-[#FAF6EE] text-[#611424] hover:bg-[#EFE7D8]'
                }`}
                title="Turntable 360°"
              >
                <RotateCw className={`w-3 h-3 ${isAutoRotating ? 'animate-spin' : ''}`} />
                <span>Spin 360°</span>
              </button>
            </div>
          </div>
        </div>

        {/* Master Action Poses & Demonstration Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#611424]">
                Master Action Poses & Expressions
              </span>
              <span className="text-[10px] text-[#75666A] font-medium">Click to preview in 3D</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTriggerAction('idle')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'idle'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <Layers className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Idle</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Relaxed hands & breathing</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('welcome')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'wave'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <Hand className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Welcome Wave</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Beside head, open hand</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('walk')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'walking'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <Footprints className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Walk Forward</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Bipedal navigation gait</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('point_left')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'point_left'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <CornerUpLeft className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Point Left</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Left IK + pointing finger</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('point_right')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'point_right'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <CornerUpRight className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Point Right</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Right IK + pointing finger</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('point_forward')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'point_forward'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <ArrowUp className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Point Forward</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Directs along central route</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('talk')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'talk'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Talk</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Mouth visemes & gesture</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('scan')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'look_around'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <Eye className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Look Around</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Alert campus scan</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('turn_left')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'turn_left'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <CornerUpLeft className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Turn Left</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Turn gait + left gesture</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('turn_right')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs ${
                  activeState === 'turn_right'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <CornerUpRight className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Turn Right</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">Turn gait + right gesture</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAction('arrived')}
                className={`p-2 rounded-xl border text-left transition-all active:scale-95 cursor-pointer shadow-2xs col-span-2 sm:col-span-2 ${
                  activeState === 'arrived'
                    ? 'border-[#C9A45C] bg-[#FAF6EE] ring-2 ring-[#C9A45C]/40'
                    : 'border-[#E8DFD3] bg-white hover:bg-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#611424]">
                  <Award className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Arrival Celebration</span>
                </div>
                <span className="text-[9px] text-[#75666A] block mt-0.5">
                  Double arm collegiate welcome, open hands & joyous arrival smile
                </span>
              </button>
            </div>
          </div>

          {/* Master Character Sheet Specifications */}
          <div className="bg-[#FAF6EE] rounded-2xl p-3 border border-[#E8DFD3] text-[11px] text-[#75666A] space-y-1.5">
            <span className="font-bold text-[#611424] block">Master Character Sheet Specifications (GLB 3D Model)</span>
            <p>
              • <strong>Identity & Appearance</strong>: Arunai Engineering College Campus Guide. Young professional male, friendly intelligent look, expressive hazel eyes, large dark-rimmed glasses, neatly swept brown hair with quiff, warm natural smile.
            </p>
            <p>
              • <strong>Collegiate Attire</strong>: Deep Maroon/Burgundy blazer with cream/gold piping, AEC shield pocket crest with collegiate emblem, crisp white shirt with collar, deep maroon tie, cream tailored trousers with sharp crease lines, and polished black formal Oxford shoes.
            </p>
            <p>
              • <strong>Turnaround Integrity & Rig</strong>: Consistent across Front, 3/4 View, Left Side, Back (with center seam, rear vent & tapered hairline), and Right Side. Humanoid rig with articulated digits (Open, Pointing, and Relaxed hand poses) and facial expression channels.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF6EE] border-t border-[#E8DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#611424]">Active: {statusMessage}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#611424] hover:bg-[#420e18] text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-xs border border-[#C9A45C]/40"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
