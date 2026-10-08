import React from 'react';
import { Route, NavigationInstruction } from '../../types';
import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  CheckCircle2,
  X,
  ChevronRight,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

interface NavigationPanelProps {
  route: Route;
  currentStepIndex: number;
  onNextStep: () => void;
  onEndNavigation: () => void;
  isVoiceGuidanceEnabled?: boolean;
  onToggleVoiceGuidance?: () => void;
  onRepeatInstruction?: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  route,
  currentStepIndex,
  onNextStep,
  onEndNavigation,
  isVoiceGuidanceEnabled = false,
  onToggleVoiceGuidance,
  onRepeatInstruction,
}) => {
  const currentStep: NavigationInstruction | undefined = route.steps[currentStepIndex];
  const isLastStep = currentStepIndex === route.steps.length - 1;

  if (!currentStep) return null;

  const renderManeuverIcon = (maneuver: NavigationInstruction['maneuver']) => {
    switch (maneuver) {
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className="w-5 h-5 text-[#C9A45C] stroke-[2.5]" aria-hidden="true" />;
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className="w-5 h-5 text-[#C9A45C] stroke-[2.5]" aria-hidden="true" />;
      case 'arrive':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5]" aria-hidden="true" />;
      case 'straight':
      default:
        return <ArrowUp className="w-5 h-5 text-[#C9A45C] stroke-[2.5]" aria-hidden="true" />;
    }
  };

  return (
    <div
      role="region"
      aria-label="Active Turn-by-Turn Navigation Instructions"
      className="w-full max-w-md mx-auto animate-in slide-in-from-top-3 duration-250 select-none z-30"
    >
      <div className="glass-maroon text-white rounded-3xl p-4 shadow-2xl border border-[#C9A45C]/40">
        <div className="flex items-start gap-3.5">
          {/* Directional Maneuver Icon in Gold/Maroon badge */}
          <div
            className="w-11 h-11 rounded-2xl bg-[#461323] border border-[#C9A45C]/40 flex items-center justify-center shrink-0 shadow-md"
            aria-hidden="true"
          >
            {renderManeuverIcon(currentStep.maneuver)}
          </div>

          {/* Turn instruction */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className="text-xl font-black tracking-tight tabular-nums text-white"
                aria-label={`Distance: ${currentStep.distanceMeters} metres`}
              >
                {currentStep.distanceMeters} m
              </span>
              <span className="text-[11px] text-[#C9A45C] font-semibold tracking-wide uppercase">
                Step {currentStepIndex + 1} of {route.steps.length}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#FFFDF8] leading-snug">
              {currentStep.instruction}
            </p>

            {currentStep.landmark && (
              <p className="text-[11px] text-[#E8DFD3] mt-0.5 font-medium">
                Landmark: {currentStep.landmark}
              </p>
            )}
          </div>

          {/* Audio toggle & Cancel */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleVoiceGuidance && (
              <button
                type="button"
                onClick={onToggleVoiceGuidance}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isVoiceGuidanceEnabled
                    ? 'bg-[#C9A45C] text-[#461323]'
                    : 'bg-black/20 text-white/70 hover:text-white'
                }`}
                title={isVoiceGuidanceEnabled ? 'Mute voice audio' : 'Enable voice audio'}
                aria-label="Toggle voice guidance"
              >
                {isVoiceGuidanceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            )}

            {onRepeatInstruction && isVoiceGuidanceEnabled && (
              <button
                type="button"
                onClick={onRepeatInstruction}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-[#C9A45C]/30 text-[#C9A45C] hover:text-white flex items-center justify-center transition-all active:scale-90"
                title="Repeat spoken instruction"
                aria-label="Repeat spoken instruction"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onEndNavigation}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors"
              title="End Navigation"
              aria-label="End Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progression action buttons */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-[#E8DFD3] truncate max-w-[150px]">
            To: {route.destinationName}
          </span>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <button
                type="button"
                onClick={onNextStep}
                className="min-h-[36px] px-3.5 py-1.5 bg-[#C9A45C] hover:bg-[#DFBF7B] text-[#461323] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <span>Next Turn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onEndNavigation}
                className="min-h-[36px] px-3.5 py-1.5 bg-[#2FA66A] hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Arrived</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
