import React, { useState } from 'react';
import { adminAuthService } from '../../services/adminAuthService';
import { ShieldCheck, Lock, User, AlertCircle, X, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('aec@admin2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const res = adminAuthService.login(username, password);
      setIsLoading(false);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-[#FFFDF8] rounded-3xl border border-[#C9A45C]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 box-border">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#651C32] to-[#461323] text-white flex items-center justify-between border-b border-[#C9A45C]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#461323] border border-[#C9A45C]/50 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#C9A45C] block">
                RESTRICTED ACCESS
              </span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight">
                Campus Editor Login
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#75666A] leading-relaxed">
            Sign in with administrative credentials to access the <strong>AEC Campus Editor</strong>, manage facility opening hours, update crowd telemetry, and publish campus notices.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#75666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]/30 focus:border-[#C9A45C]"
                placeholder="e.g. admin"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
              Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#75666A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:ring-2 focus:ring-[#C9A45C]/30 focus:border-[#C9A45C]"
                placeholder="••••••••••••"
              />
            </div>
            <span className="text-[10px] text-[#75666A] mt-1 block">
              Default credentials: <code className="bg-[#F7F1E5] px-1 py-0.5 rounded text-[#651C32]">admin</code> / <code className="bg-[#F7F1E5] px-1 py-0.5 rounded text-[#651C32]">aec@admin2026</code>
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] bg-[#651C32] hover:bg-[#461323] text-white font-bold text-xs uppercase tracking-wider rounded-xl py-3 flex items-center justify-center gap-2 shadow-md border border-[#C9A45C]/40 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>{isLoading ? 'Verifying...' : 'Access Campus Editor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
