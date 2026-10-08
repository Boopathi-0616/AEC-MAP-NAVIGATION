import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onAllow,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border border-[#E8DFD3] flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F7F1E5] text-[#651C32] border border-[#C9A45C]/40 flex items-center justify-center mb-4 shadow-sm">
          <MapPin className="w-7 h-7 text-[#651C32]" />
        </div>

        <span className="text-[10px] font-bold tracking-widest uppercase text-[#C9A45C] mb-1">
          GPS PERMISSION
        </span>

        <h2 className="text-lg font-bold text-[#651C32] uppercase font-sans mb-2">
          Enable Live Location
        </h2>

        <p className="text-xs sm:text-sm text-[#75666A] mb-5 leading-relaxed font-medium">
          Allow location access to show your real-time position on the Arunai Engineering College campus and enable live walking directions.
        </p>

        <div className="flex items-center gap-1.5 text-xs text-[#2FA66A] font-semibold mb-6 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Used exclusively within college grounds</span>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onAllow}
            className="w-full min-h-[44px] py-3 px-4 bg-[#651C32] hover:bg-[#461323] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] border border-[#C9A45C]/40 cursor-pointer"
          >
            Enable Location
          </button>
          <button
            type="button"
            onClick={onDeny}
            className="w-full min-h-[44px] py-2.5 px-4 text-[#75666A] hover:text-[#241B1E] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};
