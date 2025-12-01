'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, Brain, Heart, Plus, Waves, XIcon } from 'lucide-react';
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { submitLogEntry } from '@/lib/actions';
import { emotionCategories, thoughtPatterns } from '@/lib/data';
import { useWellnessLog } from '@/context/wellness-log-provider';
import { useRouter } from 'next/navigation';
import { EmotionWheelWrapper } from './emotion-wheel-wrapper';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ContextTagsSelector } from './context-tags-selector';
import { JournalEntryEditor } from './journal-entry-editor';
import { InteractiveBodyMap } from './interactive-body-map-v2';
import type { ContextTags } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const sensationSchema = z.object({
  id: z.string(),
  location: z.string().min(1, 'Please select a location.'),
  intensity: z.number().min(0).max(10),
  notes: z.string().max(200, 'Notes are too long.').optional().default(''),
});

const formSchema = z.object({
  emotion: z.string().min(1, 'Please select a primary emotion.'),
  specificEmotions: z
    .array(z.string())
    .min(1, 'Please select at least one specific emotion.'),
  sensations: z.array(sensationSchema),
  thoughts: z.array(z.string()).optional().default([]),
  contextTags: z
    .object({
      location: z.string().optional(),
      activity: z.array(z.string()).optional(),
      triggers: z.array(z.string()).optional(),
      people: z.string().optional(),
      timeOfDay: z.string().optional(),
    })
    .optional(),
  journalEntry: z
    .string()
    .max(2000, 'Journal entry is too long (max 2000 characters)')
    .optional(),
});

type CheckInFormValues = z.infer<typeof formSchema>;

const steps = [
  {
    id: 'feel',
    title: 'How do you feel?',
    description: 'Connect with your emotional and physical state.',
    icon: Heart,
  },
  {
    id: 'reflect',
    title: 'Reflect on your thoughts.',
    description: 'Observe your mental landscape without judgment.',
    icon: Brain,
  },
  {
    id: 'understand',
    title: 'Understand the context.',
    description: 'What was happening when you felt this way?',
    icon: Waves,
  },
];

export function CheckInForm() {
  const { toast } = useToast();
  const { addLogEntry } = useWellnessLog();
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);

  const [currentSensation, setCurrentSensation] = React.useState({
    location: '',
    intensity: 5,
    notes: '',
  });
  const [selectedRegionParts, setSelectedRegionParts] = React.useState<
    string[]
  >([]);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emotion: '',
      specificEmotions: [],
      sensations: [],
      thoughts: [],
      contextTags: {},
      journalEntry: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sensations',
  });

  const selectedLevel2Emotion = form.watch('emotion');

  const specificEmotionsOptions = React.useMemo(() => {
    if (!selectedLevel2Emotion) return [];
    for (const category of emotionCategories) {
      const subCategory = category.subCategories.find(
        (sub) => sub.name === selectedLevel2Emotion
      );
      if (subCategory) {
        return subCategory.emotions;
      }
    }
    return [];
  }, [selectedLevel2Emotion]);

  const onSubmit = async (data: CheckInFormValues) => {
    const result = await submitLogEntry(data);
    if (result.success) {
      addLogEntry(data);
      toast({
        title: 'Entry Saved',
        description:
          'Your wellness check-in has been logged successfully.',
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  const addNewSensation = () => {
    if (!currentSensation.location) {
      toast({
        variant: 'destructive',
        title: 'Location Missing',
        description: 'Please select a body part before logging a sensation.',
      });
      return;
    }
    append({
      id: `sensation-${Date.now()}`,
      ...currentSensation,
    });
    // Reset for next entry
    setCurrentSensation({ location: '', intensity: 5, notes: '' });
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="pb-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer',
                  currentStep === index
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
                onClick={() => setCurrentStep(index)}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-all',
                    currentStep >= index
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/30 bg-background'
                  )}
                >
                  <step.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="hidden sm:inline font-medium text-sm">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 transition-all',
                    currentStep > index ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                e.target instanceof HTMLElement &&
                e.target.tagName !== 'TEXTAREA'
              ) {
                e.preventDefault();
              }
            }}
            className="space-y-8"
          >
            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Feel */}
                {currentStep === 0 && (
                  <div className="space-y-8">
                     <div className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight">{steps[0].title}</h2>
                        <p className="text-muted-foreground">{steps[0].description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Emotion Wheel */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Emotion</h3>
                         <div className="relative w-full max-w-[400px] mx-auto aspect-square">
                           <FormField
                              control={form.control}
                              name="emotion"
                              render={({ field }) => (
                                <FormItem className="w-full h-full">
                                  <FormControl>
                                    <EmotionWheelWrapper
                                      selectedEmotion={field.value}
                                      onSelectEmotion={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-center" />
                                </FormItem>
                              )}
                            />
                         </div>
                         {specificEmotionsOptions.length > 0 && (
                             <FormField
                                control={form.control}
                                name="specificEmotions"
                                render={() => (
                                  <FormItem>
                                     <FormLabel className="text-base font-semibold">
                                        Specific feelings:
                                     </FormLabel>
                                    <div className="flex flex-wrap gap-2">
                                      {specificEmotionsOptions.map((item) => (
                                        <FormField
                                          key={item}
                                          control={form.control}
                                          name="specificEmotions"
                                          render={({ field }) => {
                                            const isSelected = field.value?.includes(item);
                                            return (
                                              <FormItem key={item} className="p-0">
                                                <FormControl>
                                                  <Button
                                                    type="button"
                                                    variant={isSelected ? "default" : "outline"}
                                                    size="sm"
                                                    className="rounded-full px-3"
                                                    onClick={() => {
                                                      const updated = isSelected
                                                        ? field.value?.filter((v) => v !== item)
                                                        : [...(field.value ?? []), item];
                                                      field.onChange(updated);
                                                    }}
                                                  >
                                                    {item}
                                                  </Button>
                                                </FormControl>
                                              </FormItem>
                                            );
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                         )}
                      </div>

                      {/* Body Map */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Sensation</h3>
                         <InteractiveBodyMap
                          selectedPart={currentSensation.location}
                          onPartSelect={(part) => {
                            setCurrentSensation(p => ({ ...p, location: part }));
                            setSelectedRegionParts([]);
                          }}
                          onRegionSelect={(regionId, parts) => {
                            setSelectedRegionParts(parts);
                            setCurrentSensation(p => ({ ...p, location: '' }));
                          }}
                        />

                        {/* Sensation Input */}
                        {currentSensation.location && (
                          <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}}>
                            <Card className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{currentSensation.location}</p>
                                   <Badge variant="outline">{currentSensation.intensity}/10</Badge>
                                </div>
                                <FormItem>
                                  <FormLabel>Intensity</FormLabel>
                                  <Slider
                                    value={[currentSensation.intensity]}
                                    max={10}
                                    step={1}
                                    onValueChange={(vals) => setCurrentSensation(p => ({ ...p, intensity: vals[0] }))}
                                  />
                                </FormItem>
                                 <FormItem>
                                  <FormLabel>Notes (optional)</FormLabel>
                                  <Input
                                    placeholder="e.g., tingling, warmth..."
                                    value={currentSensation.notes}
                                    onChange={(e) => setCurrentSensation(p => ({ ...p, notes: e.target.value }))}
                                  />
                                </FormItem>
                                <div className="flex gap-2">
                                  <Button type="button" onClick={addNewSensation} className="flex-1">
                                    <Plus className="h-4 w-4 mr-2" />Add Sensation
                                  </Button>
                                   <Button type="button" variant="outline" onClick={() => setCurrentSensation({ location: '', intensity: 5, notes: '' })}>
                                    Cancel
                                  </Button>
                                </div>
                            </Card>
                          </motion.div>
                        )}
                        
                        {selectedRegionParts.length > 0 && (
                            <Card className="p-4 space-y-2">
                                <p className="text-sm font-medium mb-2">Select a more specific area:</p>
                                <div className="flex flex-wrap gap-2">
                                     {selectedRegionParts.map((part) => (
                                      <Button
                                        key={part}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setCurrentSensation(p => ({ ...p, location: part }));
                                          setSelectedRegionParts([]);
                                        }}
                                      >
                                        {part}
                                      </Button>
                                    ))}
                                </div>
                            </Card>
                        )}
                        
                        {/* Logged Sensations */}
                        {fields.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Logged Sensations:</h4>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                                    <span>{field.location} ({field.intensity}/10)</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Reflect */}
                {currentStep === 1 && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight">{steps[1].title}</h2>
                            <p className="text-muted-foreground">{steps[1].description}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Journal Entry</h3>
                                <FormField
                                    control={form.control}
                                    name="journalEntry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <JournalEntryEditor
                                                    value={field.value || ""}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Thought Patterns</h3>
                                <FormField
                                    control={form.control}
                                    name="thoughts"
                                    render={() => (
                                      <FormItem>
                                        <div className="flex flex-wrap gap-2">
                                          {thoughtPatterns.map((item) => (
                                            <FormField
                                              key={item.id}
                                              control={form.control}
                                              name="thoughts"
                                              render={({ field }) => {
                                                const isSelected = field.value?.includes(item.id);
                                                return (
                                                  <FormItem key={item.id} className="p-0">
                                                    <FormControl>
                                                      <Button
                                                        type="button"
                                                        variant={isSelected ? "default" : "outline"}
                                                        size="sm"
                                                        className="rounded-full px-3"
                                                        onClick={() => {
                                                          const updated = isSelected
                                                            ? field.value?.filter((v) => v !== item.id)
                                                            : [...(field.value ?? []), item.id];
                                                          field.onChange(updated);
                                                        }}
                                                      >
                                                        {item.label}
                                                      </Button>
                                                    </FormControl>
                                                  </FormItem>
                                                );
                                              }}
                                            />
                                          ))}
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Step 3: Understand */}
                {currentStep === 2 && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tight">{steps[2].title}</h2>
                            <p className="text-muted-foreground">{steps[2].description}</p>
                        </div>
                        <FormField
                          control={form.control}
                          name="contextTags"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <ContextTagsSelector
                                  value={field.value || {}}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <Separator />
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? 'Saving...'
                    : 'Complete Check-in'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
