import React, { useState, useEffect } from 'react';
import { Place, CharacterState } from '../types';
import { CAMPUS_PLACES } from '../data/campusPlaces';
import { Navigation, ShieldCheck, Volume2, VolumeX, Sparkles, Eye, Hand, MessageSquare, Maximize2 } from 'lucide-react';
import { NavigationCharacter } from '../components/character/NavigationCharacter';
import { GuideInspectorModal } from '../components/character/GuideInspectorModal';
import { speechService } from '../services/speechService';
import { campusDataService } from '../services/campusDataService';

interface GuidePageProps {
  onNavigateToPlace: (place: Place) => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  targetPlaceId?: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Where is the AI & Data Science Department located?',
    answer:
      'The AI and Data Science Department is located on the second floor, Wing B, of the Dr. Vikram Sarabhai Technology Block, approximately 350 metres from Main Gate 1.',
    targetPlaceId: 'ai-ds-dept',
  },
  {
    id: 'faq-2',
    question: 'How do I reach the Central Library?',
    answer:
      'The Dr. A.P.J. Abdul Kalam Central Library is straight ahead along the central avenue, right beside the central quadrangle.',
    targetPlaceId: 'central-library',
  },
  {
    id: 'faq-3',
    question: 'Where can I find drinking water and the campus canteen?',
    answer:
      'The Student Amenities Block houses the College Canteen, Bakery, and fresh juice counters on the South Campus quadrangle.',
    targetPlaceId: 'canteen',
  },
  {
    id: 'faq-4',
    question: 'Where are the emergency health clinic and first aid?',
    answer:
      'The Campus Health Centre with ambulance standby is located at the Student Amenities Block, Ground Floor North Wing. In urgent need, call 04175 255100.',
    targetPlaceId: 'medical-centre',
  },
  {
    id: 'faq-5',
    question: 'Where is the Principal Office and Cash Counter?',
    answer:
      'Administrative offices, including the Principal, Academic Deans, and Examination Cell, are located in the Main Administrative Block.',
    targetPlaceId: 'main-admin-block',
  },
];

export const GuidePage: React.FC<GuidePageProps> = ({ onNavigateToPlace }) => {
  const [activeFaq, setActiveFaq] = useState<string | null>('faq-1');
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [statusText, setStatusText] = useState<string>('Online');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(speechService.getIsEnabled());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechService.getIsSpeaking());
  const [showInspector, setShowInspector] = useState<boolean>(false);

  // Listen to speaking state from speechService
  useEffect(() => {
    const unsubSpeaking = speechService.subscribeSpeaking((speaking) => {
      setIsSpeaking(speaking);
      if (speaking) {
        setCharacterState('talk');
        setStatusText('Speaking Guide');
      } else {
        setCharacterState('idle');
        setStatusText('Online');
      }
    });

    const unsubData = campusDataService.subscribe(() => {
      setIsVoiceEnabled(speechService.getIsEnabled());
    });

    return () => {
      unsubSpeaking();
      unsubData();
    };
  }, []);

  const handleToggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    speechService.setEnabled(next);
  };

  const handlePlayFaqSpeech = (faq: FAQItem) => {
    speechService.speak(faq.answer, {
      priority: 'high',
      interrupt: true,
      force: true,
      category: 'faq',
    });
  };

  const handleTriggerAction = (state: CharacterState, text: string, speechMsg?: string) => {
    setCharacterState(state);
    setStatusText(text);
    if (speechMsg && isVoiceEnabled) {
      speechService.speak(speechMsg, {
        priority: 'high',
        interrupt: true,
        force: true,
        category: 'user',
      });
    }
    setTimeout(() => {
      if (!speechService.getIsSpeaking()) {
        setCharacterState('idle');
        setStatusText('Online');
      }
    }, 4000);
  };

  const handleNavigateByFaq = (placeId?: string) => {
    if (!placeId) return;
    const place = CAMPUS_PLACES.find((p) => p.id === placeId);
    if (place) {
      onNavigateToPlace(place);
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-lg mx-auto min-w-0 pb-28 px-3 sm:px-4 pt-3 sm:pt-4 box-border overflow-x-hidden select-none">
      {/* 3D Character Hero Card */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-[#E8DFD3] shadow-lg mb-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="shrink-0 flex flex-col items-center cursor-pointer" onClick={() => setShowInspector(true)}>
          <NavigationCharacter
            state={characterState}
            statusText={statusText}
            size="md"
            onCharacterClick={() => setShowInspector(true)}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInspector(true);
            }}
            className="mt-1 text-[9px] font-bold text-[#651C32] hover:text-[#461323] flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-2.5 h-2.5 text-[#C9A45C]" />
            <span>Open 3D Viewer</span>
          </button>
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C9A45C] block">
              3D CAMPUS COMPANION
            </span>
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isVoiceEnabled
                  ? 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                  : 'border-[#E8DFD3] text-[#75666A] bg-white hover:bg-[#F7F1E5]'
              }`}
              title={isVoiceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#75666A]" />
              )}
              <span className="text-[10px]">{isVoiceEnabled ? 'Voice On' : 'Muted'}</span>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#651C32] uppercase font-sans">
            AEC Campus Guide
          </h2>
          <p className="text-xs text-[#75666A] mt-1 leading-relaxed">
            Meet your smart student guide. Select destinations below or ask common questions to get 3D wayfinding instructions and voice narration.
          </p>

          {/* Quick interactive actions */}
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => handleTriggerAction('wave', 'Waving', 'Vanakkam! Welcome to Arunai Engineering College campus.')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF6EE] text-[11px] font-semibold text-[#651C32] border border-[#E8DFD3] flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Hand className="w-3 h-3 text-[#C9A45C]" />
              <span>Wave Hello</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerAction('look_around', 'Scanning', 'Scanning nearby academic blocks and campus pathways.')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF6EE] text-[11px] font-semibold text-[#651C32] border border-[#E8DFD3] flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Eye className="w-3 h-3 text-[#C9A45C]" />
              <span>Look Around</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerAction('talk', 'Speaking', 'I am here to guide you across all departments, labs, and student facilities.')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF6EE] text-[11px] font-semibold text-[#651C32] border border-[#E8DFD3] flex items-center gap-1 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3 h-3 text-[#C9A45C]" />
              <span>Speak Intro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide FAQs */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#651C32] uppercase tracking-wider">
            Common Questions & Directions
          </h3>
          <span className="text-[10px] text-[#75666A] font-medium">Click to expand</span>
        </div>

        {FAQS.map((faq) => {
          const isOpen = activeFaq === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-[#F7F1E5]/50 transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-[#241B1E]">
                  {faq.question}
                </span>
                <span className="text-[#C9A45C] font-semibold text-xs shrink-0">
                  {isOpen ? 'Close' : 'View'}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#E8DFD3]/70 bg-[#FAF6EE]">
                  <p className="text-xs text-[#75666A] leading-relaxed mb-3">
                    {faq.answer}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayFaqSpeech(faq)}
                      className="min-h-[36px] px-3 py-1.5 bg-white hover:bg-[#FAF6EE] text-[#651C32] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs border border-[#E8DFD3] cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>{isSpeaking ? 'Speaking...' : 'Listen Guide'}</span>
                    </button>

                    {faq.targetPlaceId && (
                      <button
                        type="button"
                        onClick={() => handleNavigateByFaq(faq.targetPlaceId)}
                        className="min-h-[36px] px-3.5 py-1.5 bg-[#651C32] hover:bg-[#461323] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-xs border border-[#C9A45C]/40 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>Navigate to Location</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System Note */}
      <div className="bg-[#F7F1E5] rounded-2xl p-4 text-xs text-[#75666A] flex items-start gap-2.5 border border-[#E8DFD3]">
        <ShieldCheck className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The Campus Guide respects student privacy and operates entirely within client browser geolocation. Voice guidance is synthesized client-side with zero audio data transmitted externally.
        </p>
      </div>

      {/* 3D Guide Interactive Inspector Modal */}
      <GuideInspectorModal
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
      />
    </div>
  );
};
