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
} from 'lucide-react';

interface NavigationInstructionCardProps {
  route: Route;
  currentStepIndex: number;
  onNextStep: () => void;
  onEndNavigation: () => void;
  isVoiceGuidanceEnabled?: boolean;
  onToggleVoiceGuidance?: () => void;
}

export const NavigationInstructionCard: React.FC<NavigationInstructionCardProps> = ({
  route,
  currentStepIndex,
  onNextStep,
  onEndNavigation,
  isVoiceGuidanceEnabled = false,
  onToggleVoiceGuidance,
}) => {
  const currentStep: NavigationInstruction | undefined = route.steps[currentStepIndex];
  const isLastStep = currentStepIndex === route.steps.length - 1;

  if (!currentStep) return null;

  const renderManeuverIcon = (maneuver: NavigationInstruction['maneuver']) => {
    switch (maneuver) {
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className="w-6 h-6 text-white stroke-[2.5]" aria-hidden="true" />;
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className="w-6 h-6 text-white stroke-[2.5]" aria-hidden="true" />;
      case 'arrive':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400 stroke-[2.5]" aria-hidden="true" />;
      case 'straight':
      default:
        return <ArrowUp className="w-6 h-6 text-white stroke-[2.5]" aria-hidden="true" />;
    }
  };

  const spokenStepSummary = `Step ${currentStepIndex + 1} of ${route.steps.length}: In ${
    currentStep.distanceMeters
  } metres, ${currentStep.instruction}. ${
    currentStep.landmark ? `Landmark: ${currentStep.landmark}.` : ''
  }`;

  return (
    <div
      className="fixed top-14 left-0 right-0 z-30 p-3 pointer-events-none animate-in slide-in-from-top duration-250"
      role="region"
      aria-label="Active Turn-by-Turn Navigation Instructions"
    >
      {/* Live Screen Reader Announcement Anchor */}
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {spokenStepSummary}
      </div>

      <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-800 p-4 pointer-events-auto">
        <div className="flex items-start gap-3.5">
          {/* Directional Maneuver Icon */}
          <div
            className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            {renderManeuverIcon(currentStep.maneuver)}
          </div>

          {/* Turn instruction */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className="text-xl font-bold tracking-tight tabular-nums"
                aria-label={`Distance for this turn: ${currentStep.distanceMeters} metres`}
              >
                {currentStep.distanceMeters} m
              </span>
              <span
                className="text-xs text-slate-400 font-medium"
                aria-label={`Step ${currentStepIndex + 1} out of ${route.steps.length} total steps`}
              >
                Step {currentStepIndex + 1} of {route.steps.length}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-100 leading-snug">
              {currentStep.instruction}
            </p>

            {currentStep.landmark && (
              <p className="text-xs text-slate-300 mt-1">
                Landmark: {currentStep.landmark}
              </p>
            )}
          </div>

          {/* Controls: Audio guidance toggle & End navigation */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleVoiceGuidance && (
              <button
                type="button"
                onClick={onToggleVoiceGuidance}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isVoiceGuidanceEnabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
                title={
                  isVoiceGuidanceEnabled
                    ? 'Mute Voice Announcements'
                    : 'Enable Spoken Voice Navigation'
                }
                aria-label={
                  isVoiceGuidanceEnabled
                    ? 'Mute spoken audio guidance for turns'
                    : 'Enable spoken audio guidance for turns'
                }
                aria-pressed={isVoiceGuidanceEnabled}
              >
                {isVoiceGuidanceEnabled ? (
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onEndNavigation}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              title="End Navigation"
              aria-label="End active navigation and return to map overview"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Action Controls for step simulation / progression */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 truncate max-w-[160px]">
            To: {route.destinationName}
          </span>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <button
                type="button"
                onClick={onNextStep}
                className="min-h-[38px] px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                aria-label={`Advance to next step: Step ${currentStepIndex + 2} of ${
                  route.steps.length
                }`}
              >
                <span>Next Turn</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onEndNavigation}
                className="min-h-[38px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                aria-label={`Arrived at destination ${route.destinationName}. Click to finish navigation.`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Arrived</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
