import React, { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Sparkles, Navigation, X } from 'lucide-react';
import { Place } from '../../types';

interface CampusGuideProps {
  currentMessage?: string | null;
  onFindLocationClick?: () => void;
  onSelectQuickDestination?: (placeId: string) => void;
  isNavigating?: boolean;
}

export const CampusGuide: React.FC<CampusGuideProps> = ({
  currentMessage,
  onFindLocationClick,
  onSelectQuickDestination,
  isNavigating = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!isNavigating);
  const [dismissedContextual, setDismissedContextual] = useState<boolean>(false);

  // If navigating and there's a contextual message, show a minimal floating contextual card
  if (isNavigating && currentMessage && !dismissedContextual) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-20 pointer-events-none animate-in fade-in duration-200">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md p-3 flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-blue-800" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold tracking-wide text-blue-900 uppercase">
              Campus Guide
            </span>
            <p className="text-xs font-medium text-slate-800 leading-tight">
              "{currentMessage}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedContextual(true)}
            className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Dismiss guide tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-20 select-none">
      {/* Collapsed floating button */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-blue-900 shadow-md flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all"
          aria-label="Open Campus Guide"
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-blue-800" />
          </div>
          <span className="text-xs font-medium text-slate-800">Campus Guide</span>
        </button>
      ) : (
        /* Expanded clean assistant card */
        <div className="w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-3.5 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-800" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Campus Guide
                </h4>
                <span className="text-[10px] text-slate-500">
                  Arunai Navigation Assistant
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              aria-label="Minimize Campus Guide"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5">
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {currentMessage || "Hi! Where would you like to go on campus today?"}
            </p>
          </div>

          {/* Assistant Action Shortcuts */}
          <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-100">
            {onFindLocationClick && (
              <button
                type="button"
                onClick={onFindLocationClick}
                className="w-full min-h-[38px] px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Find a Location</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => onSelectQuickDestination?.('central-library')}
                className="text-[11px] font-medium text-slate-600 hover:text-blue-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors"
              >
                Central Library
              </button>
              <button
                type="button"
                onClick={() => onSelectQuickDestination?.('ai-ds-dept')}
                className="text-[11px] font-medium text-slate-600 hover:text-blue-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors"
              >
                AI & DS Dept
              </button>
              <button
                type="button"
                onClick={() => onSelectQuickDestination?.('canteen')}
                className="text-[11px] font-medium text-slate-600 hover:text-blue-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-colors"
              >
                Canteen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
