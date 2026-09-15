import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Package, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Lock, 
  Users, 
  MapPin, 
  MessageSquare, 
  HeartHandshake, 
  Clock, 
  AlertTriangle,
  IndianRupee,
  Wrench,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingSlidesProps {
  onFinishSlides: () => void;
  onSkip: () => void;
}

interface SlideData {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  description: string;
  badgeIcon: React.ElementType;
  accentColor: string;
  bgGlow: string;
  highlights: {
    icon: React.ElementType;
    title: string;
    desc: string;
  }[];
  statPill?: {
    label: string;
    value: string;
  };
}

const SLIDES: SlideData[] = [
  {
    id: 0,
    tag: 'Borrow • Rent • Hire Nearby',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    title: 'Borrow, Don’t Buy. Hire Hyperlocal.',
    subtitle: 'Why buy expensive equipment you only use twice a year?',
    description: 'Needly connects you directly with verified neighbors to rent tools, cameras, camping kits, and appliances at a fraction of retail price, or hire trusted local service specialists.',
    badgeIcon: Package,
    accentColor: 'from-teal-600 to-emerald-600',
    bgGlow: 'bg-teal-500/10',
    statPill: {
      label: 'Average Resident Savings',
      value: 'Save up to 90% vs Buying'
    },
    highlights: [
      {
        icon: Camera,
        title: 'Huge Neighborhood Inventory',
        desc: 'DSLRs, power drills, projectors, sound systems, camping tents & party gear right down your street.'
      },
      {
        icon: Wrench,
        title: 'Verified Local Service Pros',
        desc: 'Plumbers, electricians, technicians, cleaning experts, and tutors ready on-demand.'
      },
      {
        icon: Sparkles,
        title: 'Monetize Your Idle Gear',
        desc: 'Turn your unused household equipment into passive income safely within your community.'
      }
    ]
  },
  {
    id: 1,
    tag: 'Trust & Identity Security',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Bank-Grade Trust & Escrow Safety',
    subtitle: 'Security built into every single rental & service transaction.',
    description: 'Safety is the core pillar of Needly. We protect your gear, your money, and your personal identity with comprehensive safeguards.',
    badgeIcon: ShieldCheck,
    accentColor: 'from-emerald-600 to-teal-700',
    bgGlow: 'bg-emerald-500/10',
    statPill: {
      label: 'Verified Community',
      value: '100% ID & Phone Verified'
    },
    highlights: [
      {
        icon: BadgeCheck,
        title: 'Government ID & OTP Verified Members',
        desc: 'Every active borrower and service provider is verified via phone OTP and identity verification.'
      },
      {
        icon: Lock,
        title: 'Escrow Security Deposit Protection',
        desc: 'Security deposits are safely locked in escrow and automatically refunded upon satisfactory return.'
      },
      {
        icon: Users,
        title: 'Authentic Completed-Booking Reviews',
        desc: 'Zero fake reviews or automated bots. All ratings come from verified completed community exchanges.'
      }
    ]
  },
  {
    id: 2,
    tag: 'Handover & Inspection Rules',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: '3 Golden Rules for Safe Handovers',
    subtitle: 'Simple, transparent habits for smooth and worry-free rentals.',
    description: 'Follow our standard 3-step safety checklist during every pickup, inspection, and return:',
    badgeIcon: Camera,
    accentColor: 'from-blue-600 to-teal-600',
    bgGlow: 'bg-blue-500/10',
    statPill: {
      label: 'Handover Protocol',
      value: '3-Min Condition Check'
    },
    highlights: [
      {
        icon: MapPin,
        title: '1. Meet in Safe, Public Places',
        desc: 'Coordinate handovers in daylight at apartment gates, building lobbies, or verified local public spots.'
      },
      {
        icon: Camera,
        title: '2. Snap 3 Quick Condition Photos',
        desc: 'Inspect the item and snap 2-3 condition photos directly in the in-app chat before taking possession.'
      },
      {
        icon: MessageSquare,
        title: '3. Keep All Chats Inside Needly',
        desc: 'All agreements, timestamps, and coordination are protected when maintained inside our encrypted chat.'
      }
    ]
  },
  {
    id: 3,
    tag: 'Needly Fair Play Shield',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Fair Play, Zero Hassle Guarantee',
    subtitle: 'Transparent terms, no hidden cuts, and 24/7 dispute help.',
    description: 'We believe in honest neighborhood sharing. Experience complete peace of mind with transparent policies and responsive dispute support.',
    badgeIcon: HeartHandshake,
    accentColor: 'from-purple-600 to-indigo-600',
    bgGlow: 'bg-purple-500/10',
    statPill: {
      label: 'Platform Transparency',
      value: 'Zero Hidden Fees'
    },
    highlights: [
      {
        icon: IndianRupee,
        title: 'Automated 100% Deposit Return',
        desc: 'Once the owner confirms safe return, deposits are released instantly without arbitrary platform cuts.'
      },
      {
        icon: AlertTriangle,
        title: 'Zero Tolerance Against Spam',
        desc: 'Proactive detection algorithms identify and ban any fraudulent listings or bad actors immediately.'
      },
      {
        icon: Clock,
        title: 'Prompt Community Mediation',
        desc: 'Our dedicated local dispute team assists promptly if any timing, return, or condition issue arises.'
      }
    ]
  }
];

export const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ onFinishSlides, onSkip }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  
  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setSlideDirection('forward');
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      onFinishSlides();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setSlideDirection('backward');
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const slide = SLIDES[currentSlideIndex];
  const BadgeIcon = slide.badgeIcon;
  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  return (
    <div 
      className="flex flex-col h-full min-h-[92vh] justify-between px-5 py-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Needly Brand Mark + Skip Button */}
      <div className="flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 font-normal text-sm">
            N
          </div>
          <span className="text-lg font-normal tracking-tight text-slate-900">
            Needly<span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-600 ml-0.5"></span>
          </span>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-normal text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Skip to Login
        </button>
      </div>

      {/* Main Slide Content with Animated Transitions */}
      <div className="flex-1 flex flex-col justify-center relative overflow-hidden my-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: slideDirection === 'forward' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'forward' ? -30 : 30 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="flex flex-col"
          >
            {/* Tag Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal border ${slide.tagColor}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                {slide.tag}
              </span>
            </div>

            {/* Slide Title */}
            <h1 className="text-2xl sm:text-3xl font-normal text-slate-900 tracking-tight leading-tight mb-2">
              {slide.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              {slide.description}
            </p>

            {/* Visual Highlight Stat Card (if present) */}
            {slide.statPill && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3 mb-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-normal text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-normal tracking-wider uppercase">
                      {slide.statPill.label}
                    </div>
                    <div className="text-xs sm:text-sm font-normal text-white">
                      {slide.statPill.value}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-normal text-teal-300 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded-md">
                  Guaranteed
                </span>
              </div>
            )}

            {/* 3 Informative Pillars / Highlights */}
            <div className="space-y-2.5">
              {slide.highlights.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-teal-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xs sm:text-sm font-normal text-slate-900 mb-0.5">
                        {item.title}
                      </h2>
                      <p className="text-xs text-slate-500 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Step Dots Indicator & Next / Back Buttons */}
      <div className="shrink-0 pt-4 border-t border-slate-100">
        {/* Step Indicator Dots */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSlideDirection(index > currentSlideIndex ? 'forward' : 'backward');
                  setCurrentSlideIndex(index);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === currentSlideIndex 
                    ? 'w-7 h-2 bg-gradient-to-r from-emerald-600 to-teal-600' 
                    : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <span className="text-xs font-normal text-slate-500">
            {currentSlideIndex + 1} of {SLIDES.length}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2.5">
          {currentSlideIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-normal text-xs sm:text-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-normal text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span>{isLastSlide ? 'Get Started & Log In' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
