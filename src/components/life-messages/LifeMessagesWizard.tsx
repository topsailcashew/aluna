
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/use-auto-save';
import { ProgressBar } from './ProgressBar';
import { MessageGrid } from './MessageGrid';
import { BeliefPanel } from './BeliefPanel';
import { PatternsStep } from './PatternsStep';
import { SummaryCanvas } from './SummaryCanvas';
import { SummaryTextual } from './SummaryTextual';
import { MicroGoalCreator } from './MicroGoalCreator';
import { CrisisModal } from './CrisisModal';
import { LifeMessageSession, LifeMessage, Pattern, MicroGoal, AIReflectResponse } from '@/lib/types/life-messages';
import { saveDraftToLocal, loadDraftFromLocal } from '@/lib/utils/local-storage';
import { Download, Share2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authenticatedJsonRequest, AuthenticationError, RateLimitError, ApiError } from '@/lib/api-client';

interface LifeMessagesWizardProps {
  sessionId: string;
  initialData?: Partial<LifeMessageSession>;
  onSave: (session: Partial<LifeMessageSession>) => Promise<void>;
  onExportPDF?: () => void;
  onShare?: () => void;
}

/**
 * Main wizard container for the life messages exercise
 */
export function LifeMessagesWizard({
  sessionId,
  initialData,
  onSave,
  onExportPDF,
  onShare,
}: LifeMessagesWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 4>(initialData?.currentStep || 0);
  const [messages, setMessages] = useState<LifeMessage[]>(initialData?.messages || []);
  const [patterns, setPatterns] = useState<Pattern[]>(initialData?.patterns || []);
  const [microGoals, setMicroGoals] = useState<MicroGoal[]>(initialData?.microGoals || []);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<AIReflectResponse | null>(
    initialData?.aiInsights ? {
      synthesis: initialData.aiInsights.synthesis,
      reflections: initialData.aiInsights.reflections,
      experiments: initialData.aiInsights.experiments,
    } : null
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [useAIInsights, setUseAIInsights] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraftFromLocal(sessionId);
    if (draft && !initialData) {
      setMessages(draft.data.messages || []);
      setPatterns(draft.data.patterns || []);
      setMicroGoals(draft.data.microGoals || []);
      setCurrentStep(draft.data.currentStep || 0);
      toast({
        title: 'Draft loaded',
        description: 'Continuing from your last session.',
      });
    }
  }, [sessionId, initialData, toast]);

  // Session data for auto-save
  const sessionData: Partial<LifeMessageSession> = {
    id: sessionId,
    messages,
    patterns,
    microGoals,
    currentStep,
    isDraft: true,
    isComplete: currentStep === 4,
  };

  // Auto-save to Firestore
  const { status: saveStatus, lastSaved } = useAutoSave({
    data: sessionData,
    onSave: async (data) => {
      // Save to local storage first
      saveDraftToLocal(sessionId, data);
      // Then sync to Firestore
      await onSave(data);
    },
    delay: 10000, // 10 seconds
  });

  // Update message
  const updateMessage = (id: string, updates: Partial<LifeMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // Navigate steps
  const goToStep = (step: 0 | 1 | 2 | 3 | 4) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 0 | 1 | 2 | 3 | 4);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as 0 | 1 | 2 | 3 | 4);
    }
  };

  // AI Insights
  const fetchAIInsights = async () => {
    if (messages.length === 0) {
      toast({
        title: 'No messages',
        description: 'Add at least one message to get insights.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingAI(true);

    try {
      const data: AIReflectResponse = await authenticatedJsonRequest('/api/ai/reflect', {
        method: 'POST',
        body: {
          sessionId,
          messages: messages.map((m) => ({
            message: m.message,
            moodTag: m.moodTag,
            feelings: m.feelings,
            belief: m.belief,
          })),
          patterns: patterns.map((p) => p.label),
        },
      });

      if (data.crisis) {
        setShowCrisisModal(true);
        setIsLoadingAI(false);
        return;
      }

      setAiInsights(data);
      toast({
        title: 'Insights generated',
        description: 'Review your personalized reflections below.',
      });
    } catch (error) {
      console.error('Failed to fetch insights:', error);

      let errorMessage = 'Failed to generate insights. Please try again.';
      if (error instanceof AuthenticationError) {
        errorMessage = 'Please sign in to generate insights.';
      } else if (error instanceof RateLimitError) {
        errorMessage = `Rate limit exceeded. Try again in ${error.retryAfter} seconds.`;
      } else if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Validation for each step
  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return messages.length > 0 && messages.every((m) => m.message.trim() !== '');
      case 1:
        return messages.some((m) => m.belief && m.belief.trim() !== '');
      case 2:
        return patterns.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Header with Progress Bar */}
      <div className="sticky top-0 z-30 bg-background border-b pb-4 pt-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Life Messages Exercise</h1>

            {/* Auto-save Status */}
            <div className="flex items-center gap-3">
              <Badge
                variant={saveStatus === 'saved' ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  saveStatus === 'saving' && 'animate-pulse'
                )}
              >
                {saveStatus === 'idle' && 'Draft'}
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'error' && 'Error'}
              </Badge>

              {lastSaved && saveStatus === 'saved' && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <ProgressBar
            currentStep={currentStep}
            onStepClick={goToStep}
            completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Step A: Add Messages */}
        {currentStep === 0 && (
          <MessageGrid
            messages={messages}
            onMessagesChange={setMessages}
            selectedMessageId={selectedMessageId}
            onMessageSelect={setSelectedMessageId}
          />
        )}

        {/* Step B: Map to Belief */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-2">Map Messages to Beliefs</h2>
              <p className="text-muted-foreground">
                Click on a message below to identify the feelings and core beliefs behind it.
              </p>
            </div>

            <MessageGrid
              messages={messages}
              onMessagesChange={setMessages}
              selectedMessageId={selectedMessageId}
              onMessageSelect={setSelectedMessageId}
            />

            {selectedMessage && (
              <BeliefPanel
                message={selectedMessage}
                onUpdate={(updates) => updateMessage(selectedMessage.id, updates)}
                onClose={() => setSelectedMessageId(null)}
                isOpen={!!selectedMessageId}
              />
            )}
          </div>
        )}

        {/* Step C: Patterns */}
        {currentStep === 2 && <PatternsStep patterns={patterns} onChange={setPatterns} />}

        {/* Step D: Summary */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl font-semibold">Your Summary</h2>
              <p className="text-muted-foreground">
                Here's a visual representation of how your messages connect to core beliefs and patterns.
              </p>

              {/* Insights Toggle */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant={useAIInsights ? 'default' : 'outline'}
                  onClick={() => {
                    setUseAIInsights(!useAIInsights);
                    if (!useAIInsights && !aiInsights) {
                      fetchAIInsights();
                    }
                  }}
                  disabled={isLoadingAI}
                >
                  {isLoadingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {useAIInsights ? 'Hide Insights' : 'Get Insights'}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <SummaryCanvas messages={messages} patterns={patterns} />
            <SummaryTextual messages={messages} patterns={patterns} />

            {/* Insights Display */}
            {useAIInsights && aiInsights && (
              <div className="max-w-4xl mx-auto space-y-6 mt-8">
                {aiInsights.synthesis && (
                  <div className="p-6 bg-primary/5 border-l-4 border-primary rounded-lg">
                    <h3 className="font-semibold mb-2">Theme</h3>
                    <p className="text-sm text-muted-foreground">{aiInsights.synthesis}</p>
                  </div>
                )}

                {aiInsights.reflections && aiInsights.reflections.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Reflections</h3>
                    <ul className="space-y-3">
                      {aiInsights.reflections.map((reflection, i) => (
                        <li key={i} className="p-4 bg-muted rounded-lg text-sm">
                          {reflection}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.experiments && aiInsights.experiments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Experiments to Try</h3>
                    <ul className="space-y-3">
                      {aiInsights.experiments.map((experiment, i) => (
                        <li key={i} className="p-4 bg-accent/50 rounded-lg text-sm">
                          {experiment}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Export/Share Actions */}
            <div className="flex justify-center gap-4 pt-6">
              {onExportPDF && (
                <Button variant="outline" onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
              {onShare && (
                <Button variant="outline" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step E: Action Planner */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-2">Action Planning</h2>
              <p className="text-muted-foreground">
                Create SMART micro-goals to test your beliefs and try new behaviors.
              </p>
            </div>

            <MicroGoalCreator goals={microGoals} onChange={setMicroGoals} />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-4 px-4 sm:px-6 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of 5
          </span>

          <Button
            onClick={nextStep}
            disabled={currentStep === 4 || !canProceedFromStep(currentStep)}
          >
            {currentStep === 3 ? 'Continue to Actions' : 'Next'}
          </Button>
        </div>
      </div>

      {/* Crisis Modal */}
      <CrisisModal open={showCrisisModal} onOpenChange={setShowCrisisModal} />
    </div>
  );
}
