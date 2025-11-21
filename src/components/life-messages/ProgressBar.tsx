'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  shortLabel?: string;
}

const STEPS: Step[] = [
  { id: 0, label: 'Add Messages', shortLabel: 'Messages' },
  { id: 1, label: 'Map to Belief', shortLabel: 'Belief' },
  { id: 2, label: 'Patterns', shortLabel: 'Patterns' },
  { id: 3, label: 'Summary', shortLabel: 'Summary' },
  { id: 4, label: 'Action Planner', shortLabel: 'Actions' },
];

interface ProgressBarProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

/**
 * Progress bar showing 5 steps of the life messages exercise
 */
export function ProgressBar({ currentStep, onStepClick, completedSteps = [] }: ProgressBarProps) {
  return (
    <nav aria-label="Life messages exercise progress" className="w-full">
      <ol className="flex items-center justify-between w-full">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPast = currentStep > step.id;
          const isClickable = onStepClick && (isPast || isCompleted);

          return (
            <li key={step.id} className="flex-1 flex items-center">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && !isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isPast && !isCompleted && 'border-primary bg-background text-primary',
                    !isCurrent && !isPast && !isCompleted && 'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:border-primary hover:bg-primary/10'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${step.label}${isCurrent ? ' (current step)' : ''}${isCompleted ? ' (completed)' : ''}`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span className="font-semibold text-sm">{step.id + 1}</span>
                  )}
                </button>

                {/* Step Label */}
                <span
                  className={cn(
                    'mt-2 text-xs sm:text-sm font-medium text-center transition-colors',
                    isCurrent && 'text-foreground',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel || step.label}</span>
                </span>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-[2px] flex-1 transition-colors mx-1 sm:mx-2',
                    (isPast || isCompleted) ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
