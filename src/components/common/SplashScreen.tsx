import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  MapPin,
  Bot,
  Route as RouteIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { speechService } from '../../services/speechService';

interface SplashScreenProps {
  onComplete: () => void;
  /**
   * Optional callback if the user wants to jump straight into 3D Guide tab
   */
  onOpenGuide?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onOpenGuide,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  // Handle start transition
  const handleStart = (openGuide: boolean = false) => {
    if (isDismissing) return;
    setIsDismissing(true);

    try {
      speechService.unlock();
    } catch {
      // ignore
    }

    if (openGuide && onOpenGuide) {
      onOpenGuide();
    }

    // Trigger onComplete after smooth fade/scale transition
    setTimeout(() => {
      setHasExited(true);
      onComplete();
    }, 600);
  };

  // Keyboard accessibility: Enter or Space triggers start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (hasExited) return null;

  return (
    <AnimatePresence>
      {!isDismissing ? (
        <motion.div
          key="aec-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] w-screen h-screen min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#FAF6EE] text-[#241B1E] select-none p-4 sm:p-8"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 50% -10%, rgba(101, 28, 50, 0.08), transparent 70%),
              radial-gradient(ellipse 60% 50% at 50% 110%, rgba(201, 164, 92, 0.12), transparent 70%),
              linear-gradient(180deg, #FAF6EE 0%, #F5EFE3 50%, #FAF6EE 100%)
            `,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Arunai Engineering College Smart Campus Navigation System Welcome Screen"
        >
          {/* Animated Background Canvas Layer: Subtle Geometric Grid & Wayfinding Node Lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            {/* Subtle collegiate grid pattern */}
            <svg
              className="absolute inset-0 w-full h-full stroke-[#651C32]/[0.05]"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="splash-campus-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" />
                  <circle cx="0" cy="0" r="1.5" fill="#C9A45C" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#splash-campus-grid)" />
            </svg>

            {/* Glowing Wayfinding Transit Route Paths */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Route line 1 */}
              <motion.path
                d="M -100,200 C 250,150 400,450 700,300 C 900,200 950,600 1100,500"
                stroke="url(#route-grad-1)"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                initial={{ pathOffset: 0 }}
                animate={{ pathOffset: 1 }}
                transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
              />

              {/* Route line 2 */}
              <motion.path
                d="M -50,750 C 300,850 550,620 800,820 C 950,940 1050,700 1150,750"
                stroke="url(#route-grad-2)"
                strokeWidth="2"
                strokeDasharray="4 6"
                initial={{ pathOffset: 0 }}
                animate={{ pathOffset: -1 }}
                transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
              />

              {/* Pulsing Campus Node Anchors */}
              <motion.circle
                cx="400"
                cy="450"
                r="6"
                fill="#651C32"
                opacity="0.3"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="700"
                cy="300"
                r="5"
                fill="#C9A45C"
                opacity="0.4"
                animate={{ scale: [1, 2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <motion.circle
                cx="550"
                cy="620"
                r="7"
                fill="#651C32"
                opacity="0.25"
                animate={{ scale: [1, 1.7, 1], opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />

              <defs>
                <linearGradient id="route-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#651C32" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#C9A45C" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#651C32" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="route-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C9A45C" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#651C32" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#C9A45C" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Ambient Radial Vignette */}
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#651C32]/[0.05] blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#C9A45C]/[0.08] blur-3xl" />
          </div>

          {/* TOP BAR: Tiruvannamalai Location & Autonomous Version Tag */}
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between pt-1 sm:pt-2 px-1"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2FA66A] animate-ping" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-[#75666A]">
                Tiruvannamalai, Tamil Nadu
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#651C32] px-2.5 py-1 rounded-full bg-[#651C32]/5 border border-[#651C32]/10">
                <ShieldCheck className="w-3 h-3 text-[#C9A45C]" />
                Official Campus Portal
              </span>
              <button
                type="button"
                onClick={() => handleStart(false)}
                className="text-xs font-medium text-[#75666A] hover:text-[#651C32] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Skip splash screen"
              >
                Skip intro
              </button>
            </div>
          </motion.header>

          {/* MAIN HERO CONTENT */}
          <main className="relative z-10 w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center px-2 py-4">
            {/* 1. Official Emblem / Wayfinding Geometric Crest */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="relative mb-6 sm:mb-8 group"
            >
              {/* Outer soft glowing halo */}
              <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-tr from-[#651C32]/20 via-[#C9A45C]/25 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />

              {/* Crest Frame */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FAF6EE] to-[#F1E8D8] border-2 border-[#C9A45C]/60 flex items-center justify-center shadow-[0_12px_36px_-6px_rgba(70,19,35,0.2),0_4px_12px_rgba(201,164,92,0.15)]">
                {/* Collegiate Wayfinding Compass Crest SVG */}
                <svg
                  viewBox="0 0 48 48"
                  className="w-14 h-14 sm:w-16 sm:h-16 text-[#651C32]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Outer Shield Hexagon */}
                  <polygon
                    points="24,4 42,14 42,34 24,44 6,34 6,14"
                    stroke="#C9A45C"
                    strokeWidth="1.8"
                    fill="#651C32"
                    fillOpacity="0.06"
                  />
                  {/* Center Wayfinding Compass Rose */}
                  <line x1="24" y1="10" x2="24" y2="38" stroke="#651C32" strokeWidth="2.4" />
                  <line x1="10" y1="24" x2="38" y2="24" stroke="#651C32" strokeWidth="2.4" />
                  <polygon
                    points="24,9 27,24 24,21 21,24"
                    fill="#651C32"
                    stroke="#C9A45C"
                    strokeWidth="1.2"
                  />
                  <circle cx="24" cy="24" r="4.5" fill="#C9A45C" stroke="#FFFDF8" strokeWidth="1.6" />
                  {/* Surrounding orbit ring */}
                  <circle
                    cx="24"
                    cy="24"
                    r="12"
                    stroke="#C9A45C"
                    strokeWidth="1.2"
                    strokeDasharray="2 4"
                    opacity="0.75"
                  />
                </svg>

                {/* Micro AEC Emblem Stamp */}
                <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#651C32] border border-[#C9A45C] text-[#FFFDF8] text-[9px] sm:text-[10px] font-black tracking-widest shadow-md">
                  AEC
                </div>
              </div>
            </motion.div>

            {/* 2. Institutional College Name & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
              className="space-y-2 mb-4 sm:mb-6"
            >
              <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#C9A45C]">
                An Autonomous Institution
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#241B1E] uppercase leading-tight font-sans">
                Arunai Engineering College
              </h1>

              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="h-px w-6 sm:w-10 bg-[#C9A45C]/50" />
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#651C32] tracking-wider uppercase">
                  Smart Campus Navigation System
                </h2>
                <span className="h-px w-6 sm:w-10 bg-[#C9A45C]/50" />
              </div>

              <p className="max-w-md mx-auto text-xs sm:text-sm text-[#75666A] font-medium leading-relaxed pt-1.5 px-4">
                Interactive real-time wayfinding, live GPS tracking, and our official 3D Campus Guide
                avatar for effortless exploration.
              </p>
            </motion.div>

            {/* 3. Core Feature Badges (3 Pillars) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
              className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md mb-6 sm:mb-8"
            >
              {/* Feature 1: Live Campus Map */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-[#E8DFD3] shadow-xs text-center transition-transform hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-[#651C32]/10 flex items-center justify-center mb-1.5 text-[#651C32]">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#241B1E] leading-tight">
                  Interactive Map
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#75666A] mt-0.5 font-medium">
                  All 27+ venues
                </span>
              </div>

              {/* Feature 2: GPS Turn-by-Turn */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-[#E8DFD3] shadow-xs text-center transition-transform hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-[#C9A45C]/15 flex items-center justify-center mb-1.5 text-[#651C32]">
                  <RouteIcon className="w-4 h-4 text-[#832742]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#241B1E] leading-tight">
                  Live Guidance
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#75666A] mt-0.5 font-medium">
                  Turn-by-turn
                </span>
              </div>

              {/* Feature 3: 3D Guide Character */}
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-[#E8DFD3] shadow-xs text-center transition-transform hover:-translate-y-0.5">
                <div className="w-8 h-8 rounded-xl bg-[#651C32]/10 flex items-center justify-center mb-1.5 text-[#651C32]">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#241B1E] leading-tight">
                  3D AEC Guide
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#75666A] mt-0.5 font-medium">
                  Voice & gestures
                </span>
              </div>
            </motion.div>

            {/* 4. Primary "TAP TO START" CTA Button & Quick 3D Guide Link */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}
              className="w-full max-w-sm flex flex-col items-center gap-3"
            >
              {/* Main Prominent Button */}
              <button
                type="button"
                onClick={() => handleStart(false)}
                className="group relative w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#651C32] via-[#75203B] to-[#651C32] hover:from-[#541629] hover:to-[#541629] text-[#FFFDF8] font-bold text-sm sm:text-base tracking-wide uppercase border border-[#C9A45C]/40 shadow-[0_10px_28px_-6px_rgba(70,19,35,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
              >
                {/* Glossy light sweep reflection */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <span className="relative z-10 flex items-center gap-2">
                  <span>Tap to Start</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {/* Direct Alternative: Meet 3D Campus Guide */}
              {onOpenGuide && (
                <button
                  type="button"
                  onClick={() => handleStart(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#651C32] hover:text-[#461323] transition-colors py-1 px-3 rounded-lg hover:bg-[#651C32]/5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Meet 3D Campus Guide directly</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          </main>

          {/* FOOTER: Accreditation, Academic Excellence & Security */}
          <motion.footer
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.55 }}
            className="relative z-10 w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left pt-2 pb-1 text-[10px] sm:text-[11px] text-[#75666A]"
          >
            <div>
              <span className="font-semibold text-[#241B1E]">Arunai Engineering College</span>
              <span className="mx-1.5 text-[#C9A45C]">·</span>
              <span>Velu Nagar, Mathur, Tiruvannamalai - 606 603</span>
            </div>

            <div className="flex items-center gap-2 font-medium">
              <span>Campus Wayfinding v2.4</span>
              <span className="text-[#C9A45C]">·</span>
              <span className="text-[#651C32] font-semibold">NAAC Accredited</span>
            </div>
          </motion.footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
