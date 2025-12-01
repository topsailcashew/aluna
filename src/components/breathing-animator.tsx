'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BreathingExercise } from '@/lib/constants/crisis-resources';
import { cn } from '@/lib/utils';

interface BreathingAnimatorProps {
  exercise: BreathingExercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'begin' | 'end';

const phaseDetails: Record<
  BreathingPhase,
  { text: string; scale: number; textColor: string }
> = {
  begin: { text: 'Get Ready...', scale: 1, textColor: 'text-foreground' },
  inhale: { text: 'Breathe In', scale: 1.5, textColor: 'text-blue-500' },
  hold1: { text: 'Hold', scale: 1.5, textColor: 'text-purple-500' },
  exhale: { text: 'Breathe Out', scale: 0.5, textColor: 'text-green-500' },
  hold2: { text: 'Hold', scale: 0.5, textColor: 'text-purple-500' },
  end: { text: 'Finished', scale: 1, textColor: 'text-foreground' },
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

    const timeout = setTimeout(() => {
      const advancePhase = () => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phaseSequence.length;
        const current = phaseSequence[currentPhaseIndex];

        if (currentPhaseIndex === 0) {
          cycleCount--;
          setCyclesLeft(cycleCount);
        }
        
        if (cycleCount < 0) {
            setPhase('end');
            return;
        }
        
        setPhase(current.phase);
        
        setTimeout(advancePhase, current.duration * 1000);
      };

      advancePhase();
    }, 2000); // Initial 2s delay

    return () => clearTimeout(timeout);
  }, [open, exercise, phaseSequence]);
  
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          <DialogDescription>Follow the guide on screen.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
            
          <div className="relative w-48 h-48 flex items-center justify-center">
            <motion.div
                className="absolute w-full h-full bg-primary/10 rounded-full"
                animate={{ scale: phaseDetails[phase].scale }}
                transition={{ duration: exercise.pattern[phase.startsWith('hold') ? 'inhale' : phase as 'inhale'|'exhale'] || 2, ease: 'easeInOut' }}
             />
             <motion.div
                className="absolute w-2/3 h-2/3 bg-primary/20 rounded-full"
                animate={{ scale: phaseDetails[phase].scale }}
                transition={{ duration: exercise.pattern[phase.startsWith('hold') ? 'inhale' : phase as 'inhale'|'exhale'] || 2, ease: 'easeInOut', delay: 0.1 }}
             />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <p className={cn("text-4xl font-bold tracking-tight", phaseDetails[phase].textColor)}>
                {phaseDetails[phase].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center space-y-4">
            {phase !== 'end' && phase !== 'begin' && (
                 <p className="text-muted-foreground">Cycles left: {cyclesLeft}</p>
            )}
            {phase === 'end' && (
                 <p className="text-foreground font-semibold">Well done.</p>
            )}
          <Button onClick={() => onOpenChange(false)} className="w-full" variant="outline">
            End Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
