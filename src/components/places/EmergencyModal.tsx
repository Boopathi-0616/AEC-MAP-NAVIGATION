import React, { useState } from 'react';
import { Place } from '../../types';
import { CAMPUS_PLACES } from '../../data/campusPlaces';
import { ShieldAlert, Phone, Navigation, X, HeartPulse, ShieldCheck, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmergencyPlace: (place: Place) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onSelectEmergencyPlace,
}) => {
  const [confirmCallTarget, setConfirmCallTarget] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  if (!isOpen) return null;

  const emergencyPlaces = CAMPUS_PLACES.filter((p) => p.isEmergency);

  const handleCallConfirm = () => {
    if (confirmCallTarget) {
      window.location.href = `tel:${confirmCallTarget.phone.replace(/\s+/g, '')}`;
      setConfirmCallTarget(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-t-3xl sm:rounded-3xl border border-[#E8DFD3] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD3] flex items-center justify-between bg-[#F7F1E5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#651C32] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#241B1E] leading-tight uppercase font-sans">
                EMERGENCY ASSISTANCE
              </h2>
              <p className="text-xs text-[#75666A] font-medium">
                Arunai Engineering College Campus Security & Medical Response
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8DFD3] text-[#75666A] hover:text-[#241B1E] flex items-center justify-center transition-colors shrink-0"
            aria-label="Close emergency modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hotlines with Confirmation Protection */}
        <div className="p-4 bg-[#FAF6EE] border-b border-[#E8DFD3] grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() =>
              setConfirmCallTarget({
                name: 'Campus Medical Health Centre',
                phone: '+91 4175 255100',
              })
            }
            className="p-3 bg-white border border-[#E8DFD3] rounded-2xl flex items-center gap-2.5 hover:border-[#651C32] transition-colors text-left group cursor-pointer shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#75666A] block truncate font-medium">Health Clinic</span>
              <span className="text-xs font-bold text-[#651C32] truncate block">255100</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setConfirmCallTarget({
                name: 'Main Security Gate 1 & Patrol',
                phone: '+91 4175 255102',
              })
            }
            className="p-3 bg-white border border-[#E8DFD3] rounded-2xl flex items-center gap-2.5 hover:border-[#651C32] transition-colors text-left group cursor-pointer shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F7F1E5] text-[#651C32] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#75666A] block truncate font-medium">Security Gate</span>
              <span className="text-xs font-bold text-[#651C32] truncate block">255102</span>
            </div>
          </button>
        </div>

        {/* Emergency Locations List */}
        <div className="p-5 overflow-y-auto space-y-3">
          <h3 className="text-xs font-bold text-[#651C32] uppercase tracking-wider">
            Critical Campus Emergency Points
          </h3>

          {emergencyPlaces.map((place) => (
            <div
              key={place.id}
              className="p-3.5 rounded-2xl bg-white border border-[#E8DFD3] hover:border-[#651C32]/40 transition-all flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#241B1E] truncate">
                  {place.name}
                </h4>
                <p className="text-xs text-[#75666A] mt-0.5 truncate">
                  {place.building}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#75666A] mt-1 font-medium">
                  <span className="tabular-nums">{place.distanceMeters} m away</span>
                  <span className="text-[#C9A45C]">·</span>
                  <span className="tabular-nums">{place.walkTimeMinutes} min walk</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectEmergencyPlace(place);
                }}
                className="min-h-[38px] px-3.5 py-1.5 bg-[#651C32] hover:bg-[#461323] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>Navigate</span>
              </button>
            </div>
          ))}
        </div>

        {/* Call Confirmation Dialog */}
        {confirmCallTarget && (
          <div className="p-4 bg-[#F7F1E5] border-t border-[#E8DFD3] animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-[#651C32] mb-1">
              <AlertTriangle className="w-4 h-4 text-[#C9A45C]" />
              <span>Confirm Emergency Call</span>
            </div>
            <p className="text-xs text-[#241B1E] mb-3">
              Are you sure you want to dial <strong>{confirmCallTarget.name}</strong> at <strong>{confirmCallTarget.phone}</strong>?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCallConfirm}
                className="flex-1 py-2 px-3 bg-[#651C32] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#461323]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Confirm Call</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmCallTarget(null)}
                className="py-2 px-4 bg-white border border-[#E8DFD3] text-[#75666A] text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
