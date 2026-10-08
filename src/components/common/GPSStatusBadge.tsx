import React, { useState } from 'react';
import { Navigation2, AlertCircle, RefreshCw, Radio, CheckCircle2, X } from 'lucide-react';
import { GPSStatusType } from '../../types';

interface GPSStatusBadgeProps {
  status: GPSStatusType;
  onClick?: () => void;
  compact?: boolean;
}

export const GPSStatusBadge: React.FC<GPSStatusBadgeProps> = ({
  status,
  onClick,
  compact = false,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          label: 'Location available',
          detailedLabel: 'GPS location available. High accuracy positioning active on campus.',
          dotColor: 'bg-emerald-500',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          icon: <Navigation2 className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />,
        };
      case 'locating':
        return {
          label: 'Locating...',
          detailedLabel: 'Acquiring GPS satellite signal and campus positioning...',
          dotColor: 'bg-amber-400 animate-pulse',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" aria-hidden="true" />,
        };
      case 'weak':
        return {
          label: 'Weak GPS',
          detailedLabel: 'Weak GPS signal. Indoor interference may affect precision.',
          dotColor: 'bg-orange-500',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />,
        };
      case 'unavailable':
      default:
        return {
          label: 'Location unavailable',
          detailedLabel: 'GPS location unavailable. Please grant location permissions.',
          dotColor: 'bg-rose-500',
          textColor: 'text-rose-800',
          borderColor: 'border-rose-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />,
        };
    }
  };

  const config = getStatusConfig();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      setShowInfo(!showInfo);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 border ${config.borderColor} ${config.textColor} shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1`}
        title={config.detailedLabel}
        aria-label={`GPS Status: ${config.label}. Press to configure or check accuracy.`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dotColor}`} aria-hidden="true" />
        {!compact && <span>{config.label}</span>}
      </button>

      {/* Accessible GPS Details Popup if toggled */}
      {showInfo && (
        <div
          role="dialog"
          aria-label="GPS Status Information"
          className="absolute right-0 top-full mt-2 w-64 p-3 bg-white rounded-xl shadow-lg border border-slate-200 z-50 text-left animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-900">GPS Live Telemetry</span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close GPS info"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {config.detailedLabel}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
            <div>Campus Grid: Arunai Engg College</div>
            <div>Reference: Gate 1 Entrance Arch</div>
          </div>
        </div>
      )}
    </div>
  );
};
