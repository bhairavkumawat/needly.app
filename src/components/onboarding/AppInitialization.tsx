import React, { useState } from 'react';
import { OnboardingSlides } from './OnboardingSlides';
import { AuthScreen } from './AuthScreen';
import { motion, AnimatePresence } from 'motion/react';

interface AppInitializationProps {
  onComplete: () => void;
  initialPhase?: 'slides' | 'auth';
}

export const AppInitialization: React.FC<AppInitializationProps> = ({ 
  onComplete,
  initialPhase = 'slides'
}) => {
  const [phase, setPhase] = useState<'slides' | 'auth'>(initialPhase);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start selection:bg-teal-500 selection:text-white font-sans antialiased">
      <div 
        id="needly-init-container"
        className="w-full max-w-lg bg-white text-slate-900 min-h-screen shadow-md relative flex flex-col overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {phase === 'slides' ? (
            <motion.div
              key="slides-phase"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <OnboardingSlides
                onFinishSlides={() => setPhase('auth')}
                onSkip={() => setPhase('auth')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="auth-phase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <AuthScreen
                onBackToSlides={() => setPhase('slides')}
                onSuccess={onComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
