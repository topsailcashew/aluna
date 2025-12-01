'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { BreathingExercise } from '@/lib/constants/crisis-resources';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface BreathingAnimatorProps {
  exercise: BreathingExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'begin' | 'end';

const phaseDetails: Record<
  BreathingPhase,
  { text: string; scale: number; bgClass: string }
> = {
  begin: { text: 'Get Ready...', scale: 1, bgClass: 'from-gray-400 to-gray-500' },
  inhale: { text: 'Breathe In', scale: 1.5, bgClass: 'from-blue-400 to-blue-500' },
  hold1: { text: 'Hold', scale: 1.5, bgClass: 'from-purple-400 to-purple-500' },
  exhale: { text: 'Breathe Out', scale: 0.7, bgClass: 'from-green-400 to-green-500' },
  hold2: { text: 'Hold', scale: 0.7, bgClass: 'from-purple-400 to-purple-500' },
  end: { text: 'Finished', scale: 1, bgClass: 'from-gray-400 to-gray-500' },
};

export function BreathingAnimator({ exercise, open, onOpenChange }: BreathingAnimatorProps) {
  const [phase, setPhase] = useState<BreathingPhase>('begin');
  const [cyclesLeft, setCyclesLeft] = useState(exercise?.cycles || 0);

  const phaseSequence = useMemo(() => {
    if (!exercise) return [];
    const seq: { phase: BreathingPhase; duration: number }[] = [];
    seq.push({ phase: 'inhale', duration: exercise.pattern.inhale });
    if (exercise.pattern.hold1)
      seq.push({ phase: 'hold1', duration: exercise.pattern.hold1 });
    seq.push({ phase: 'exhale', duration: exercise.pattern.exhale });
    if (exercise.pattern.hold2)
      seq.push({ phase: 'hold2', duration: exercise.pattern.hold2 });
    return seq;
  }, [exercise]);

  useEffect(() => {
    if (!open || !exercise) {
      setPhase('begin');
      setCyclesLeft(0);
      return;
    }

    setCyclesLeft(exercise.cycles);
    setPhase('begin');
    let currentPhaseIndex = -1;
    let cycleCount = exercise.cycles;
    let mainTimeout: NodeJS.Timeout;

    // Use a function to schedule the next phase
    const scheduleNextPhase = () => {
      mainTimeout = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phaseSequence.length;
        const current = phaseSequence[currentPhaseIndex];

        if (currentPhaseIndex === 0) {
          cycleCount--;
          if (cycleCount < 0) {
            setPhase('end');
            return; // End of cycles
          }
          setCyclesLeft(cycleCount);
        }
        
        setPhase(current.phase);
        scheduleNextPhase();
      }, (currentPhaseIndex === -1 ? 2000 : phaseSequence[currentPhaseIndex].duration * 1000));
    };
    
    scheduleNextPhase();

    return () => clearTimeout(mainTimeout);
  }, [open, exercise, phaseSequence]);
  
  if (!exercise || !open) return null;

  const currentPhaseDetails = phaseDetails[phase];
  const duration = (phase === 'begin' || phase === 'end') 
    ? 2 
    : exercise.pattern[phase as 'inhale' | 'exhale' | 'hold1' | 'hold2'] || 2;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
      {/* Background Gradient */}
      <motion.div
        key={phase}
        className={cn("absolute inset-0 transition-colors duration-1000", currentPhaseDetails.bgClass)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background: `radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to))`,
        }}
      />
      
      {/* Close Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-black/10 hover:bg-black/20 text-white"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Title */}
      <div className="absolute top-16 text-center z-10">
        <h2 className="text-2xl font-bold text-white/90" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{exercise.name}</h2>
        <p className="text-white/70" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Follow the guide on screen.</p>
      </div>

      {/* Animator */}
      <div className="relative w-64 h-64 flex items-center justify-center text-white">
        {/* Pulsating circles */}
        <motion.div
            className="absolute w-full h-full bg-white/20 rounded-full"
            animate={{ scale: currentPhaseDetails.scale }}
            transition={{ duration, ease: 'easeInOut' }}
         />
         <motion.div
            className="absolute w-2/3 h-2/3 bg-white/30 rounded-full"
            animate={{ scale: currentPhaseDetails.scale }}
            transition={{ duration, ease: 'easeInOut', delay: 0.1 }}
         />

         {/* Phase Text */}
         <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <p className="text-5xl font-bold tracking-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {currentPhaseDetails.text}
              </p>
            </motion.div>
          </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-16 text-center z-10 space-y-4">
        {phase !== 'end' && phase !== 'begin' && (
             <p className="text-white/80 font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Cycles left: {cyclesLeft}</p>
        )}
        {phase === 'end' && (
             <p className="text-white font-semibold text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>Well done.</p>
        )}
        <Button onClick={() => onOpenChange(false)} variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
            End Session
        </Button>
      </div>
    </div>
  );
}
