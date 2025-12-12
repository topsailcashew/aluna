/**
 * Mobile-First Check-In Form
 *
 * A full-screen carousel-based check-in experience optimized for mobile devices.
 * Three focused steps: Emotions → Sensations → Thoughts
 * No scrolling required - each step fits on one screen.
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { submitLogEntry } from '@/lib/actions';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { cn } from '@/lib/utils';

// Import step components
import { EmotionsStep } from './check-in-steps/emotions-step-new';
import { SensationsStep } from './check-in-steps/sensations-step-new';
import { ThoughtsStep } from './check-in-steps/thoughts-step';

const sensationSchema = z.object({
  id: z.string(),
  location: z.string().min(1),
  intensity: z.number().min(0).max(10),
  notes: z.string().optional().default(''),
});

const formSchema = z.object({
  emotion: z.string().min(1, 'Please select an emotion'),
  specificEmotions: z.array(z.string()).min(1, 'Select at least one specific emotion'),
  sensations: z.array(sensationSchema).default([]),
  thoughts: z.array(z.string()).default([]),
});

type CheckInFormValues = z.infer<typeof formSchema>;

const TOTAL_STEPS = 3;
const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const SWIPE_POWER = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function MobileCheckInForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const { toast } = useToast();
  const { addLogEntry } = useWellnessLog();
  const router = useRouter();

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emotion: '',
      specificEmotions: [],
      sensations: [],
      thoughts: [],
    },
  });

  // Handle swipe gestures
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipe = SWIPE_POWER(info.offset.x, info.velocity.x);

    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD && currentStep < TOTAL_STEPS - 1) {
      // Swipe left - next step
      goToNextStep();
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD && currentStep > 0) {
      // Swipe right - previous step
      goToPreviousStep();
    }
  };

  const goToNextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof CheckInFormValues)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ['emotion', 'specificEmotions'];
    }
    // Steps 1 and 2 are optional, no validation needed

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CheckInFormValues) => {
    try {
      const result = await submitLogEntry(data);
      if (result.success) {
        addLogEntry(data);
        toast({
          title: 'Check-in Saved',
          description: 'Your wellness check-in has been recorded.',
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to save entry',
        });
      }
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save entry. Please try again.',
      });
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const steps = [
    {
      id: 'emotions',
      title: 'How do you feel?',
      component: EmotionsStep,
    },
    {
      id: 'sensations',
      title: 'Physical sensations',
      component: SensationsStep,
    },
    {
      id: 'thoughts',
      title: 'Thought patterns',
      component: ThoughtsStep,
    },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Form {...form}>
      <div className="fixed inset-0 bg-background flex flex-col">
        {/* Header with Progress */}
        <div className="flex-none p-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">{steps[currentStep].title}</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary'
                    : 'w-2 bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {/* Main Content Area - Swipeable */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <CurrentStepComponent form={form} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      {/* Navigation Footer */}
      <div className="flex-none p-4 border-t bg-background">
        <div className="flex items-center justify-between gap-4">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div className="flex-1" />
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              className="flex-1"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              {form.formState.isSubmitting ? 'Saving...' : 'Complete'}
            </Button>
          )}
        </div>
      </div>
      </div>
    </Form>
  );
}
