
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, Plus, XIcon } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { submitLogEntry } from "@/lib/actions";
import { bodyParts, thoughtPatterns, emotionCategories } from "@/lib/data";
import { useWellnessLog } from "@/context/wellness-log-provider";
import { useRouter } from "next/navigation";
import { EmotionWheelWrapper } from "./emotion-wheel-wrapper";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ContextTagsSelector } from "./context-tags-selector";
import { JournalEntryEditor } from "./journal-entry-editor";
import { InteractiveBodyMap, bodyPartMapping } from "./interactive-body-map-v2";
import type { ContextTags } from "@/lib/types";

const sensationSchema = z.object({
  id: z.string(),
  location: z.string().min(1, "Please select a location."),
  intensity: z.number().min(0).max(10),
  notes: z.string().max(200, "Notes are too long.").optional().default(""),
});

const formSchema = z.object({
  emotion: z.string().min(1, "Please select an emotion from the wheel."),
  specificEmotions: z.array(z.string()).min(1, "Please select at least one specific emotion."),
  sensations: z.array(sensationSchema),
  thoughts: z.array(z.string()).optional().default([]),
  // Phase 1: New optional fields
  contextTags: z.object({
    location: z.string().optional(),
    activity: z.array(z.string()).optional(),
    triggers: z.array(z.string()).optional(),
    people: z.string().optional(),
    timeOfDay: z.string().optional(),
  }).optional(),
  journalEntry: z.string().max(2000, "Journal entry is too long (max 2000 characters)").optional(),
});

type CheckInFormValues = z.infer<typeof formSchema>;

const StepSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(
    ({ children, className }, ref) => {
    return (
        <section ref={ref} className={`min-h-screen w-screen flex flex-col p-4 sm:p-6 snap-start snap-always relative ${className}`}>
            {children}
        </section>
    )
});
StepSection.displayName = 'StepSection';

export function CheckInForm() {
  const { toast } = useToast();
  const { addLogEntry } = useWellnessLog();
  const router = useRouter();

  const sensationRef = React.useRef<HTMLDivElement>(null);
  const emotionRef = React.useRef<HTMLDivElement>(null);
  const thoughtRef = React.useRef<HTMLDivElement>(null);
  const contextRef = React.useRef<HTMLDivElement>(null);
  const journalRef = React.useRef<HTMLDivElement>(null);
  const copingRef = React.useRef<HTMLDivElement>(null);

  const [currentSensation, setCurrentSensation] = React.useState({
    location: '',
    intensity: 5,
    notes: '',
  });

  const [selectedRegionParts, setSelectedRegionParts] = React.useState<string[]>([]);

  const [copingSuggestions, setCopingSuggestions] = React.useState<any>(null);
  const [isLoadingCoping, setIsLoadingCoping] = React.useState(false);

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emotion: "",
      specificEmotions: [],
      sensations: [],
      thoughts: [],
      contextTags: {},
      journalEntry: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sensations",
  });
  
  const selectedLevel2Emotion = form.watch("emotion");

  const specificEmotionsOptions = React.useMemo(() => {
    if (!selectedLevel2Emotion) return [];
    for (const category of emotionCategories) {
      const subCategory = category.subCategories.find(sub => sub.name === selectedLevel2Emotion);
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
        title: "Entry Saved",
        description: "Your wellness check-in has been logged successfully.",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };
  
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
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

  const generateCopingSuggestions = async () => {
    const formValues = form.getValues();

    // Calculate average intensity
    const avgIntensity = formValues.sensations.length > 0
      ? Math.round(formValues.sensations.reduce((sum, s) => sum + s.intensity, 0) / formValues.sensations.length)
      : 5;

    setIsLoadingCoping(true);

    try {
      const response = await fetch('/api/ai/coping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmotion: formValues.emotion,
          specificEmotions: formValues.specificEmotions,
          intensity: avgIntensity,
          contextTags: formValues.contextTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate coping suggestions');
      }

      const data = await response.json();
      setCopingSuggestions(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate coping suggestions. You can still complete your check-in.',
      });
    } finally {
      setIsLoadingCoping(false);
    }
  };


  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll overflow-x-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <StepSection ref={sensationRef}>
              <div className="flex flex-col items-center justify-center h-full text-center relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full max-w-lg h-96">
                          <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 via-indigo-600 to-yellow-300 rounded-full blur-3xl opacity-50"></div>
                      </div>
                  </div>
                  <div className="relative z-10 w-full px-4">
                      <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-foreground mb-4">Where Do You Feel It?</h1>
                      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                          Scan your body. Note any physical sensations, their location, and intensity.
                      </p>
                      <Card className="w-full max-w-6xl mx-auto bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left: Body Map */}
                            <div className="flex flex-col items-center">
                              <InteractiveBodyMap
                                selectedPart={currentSensation.location}
                                onPartSelect={(part) => {
                                  setCurrentSensation(p => ({...p, location: part}));
                                  setSelectedRegionParts([]);
                                }}
                                onRegionSelect={(regionId, parts) => {
                                  setSelectedRegionParts(parts);
                                  setCurrentSensation(p => ({...p, location: ''}));
                                }}
                              />
                            </div>

                            {/* Right: Form + Logged Sensations */}
                            <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px]">
                              {/* Inline Sensation Form */}
                              {currentSensation.location ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Card className="border-primary/50 shadow-lg">
                                    <CardContent className="p-4 space-y-4">
                                      {/* Selected Part Header */}
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h3 className="text-sm font-semibold text-muted-foreground">Selected</h3>
                                          <p className="text-xl font-bold text-primary">{currentSensation.location}</p>
                                        </div>
                                        <Badge variant="outline" className="text-sm">
                                          {currentSensation.intensity}/10
                                        </Badge>
                                      </div>

                                      {/* Intensity Slider */}
                                      <FormItem>
                                        <FormLabel>Intensity: {currentSensation.intensity}</FormLabel>
                                        <Slider
                                          value={[currentSensation.intensity]}
                                          max={10}
                                          step={1}
                                          onValueChange={(vals) => setCurrentSensation(p => ({...p, intensity: vals[0]}))}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                          <span>Mild</span>
                                          <span>Moderate</span>
                                          <span>Intense</span>
                                        </div>
                                      </FormItem>

                                      {/* Notes Input */}
                                      <FormItem>
                                        <FormLabel>How does it feel? (optional)</FormLabel>
                                        <Input
                                          placeholder="e.g., tingling, warmth, pressure"
                                          value={currentSensation.notes}
                                          onChange={(e) => setCurrentSensation(p => ({...p, notes: e.target.value}))}
                                        />
                                      </FormItem>

                                      {/* Buttons */}
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          onClick={addNewSensation}
                                          className="flex-1"
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => setCurrentSensation({ location: '', intensity: 5, notes: '' })}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ) : selectedRegionParts.length > 0 ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Card className="border-primary/50 shadow-lg">
                                    <CardContent className="p-4 space-y-4">
                                      <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Select specific area:</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                          {selectedRegionParts.map((part) => (
                                            <Button
                                              key={part}
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setCurrentSensation(p => ({...p, location: part}));
                                                setSelectedRegionParts([]);
                                              }}
                                              className="text-xs"
                                            >
                                              {part}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedRegionParts([])}
                                        className="w-full text-xs"
                                      >
                                        Cancel
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ) : (
                                <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                                  <p className="text-sm text-muted-foreground text-center px-4">
                                    👈 Click on the body to select a part
                                  </p>
                                </div>
                              )}

                              {/* Logged Sensations */}
                              {fields.length > 0 && (
                                <div>
                                  <h3 className="font-semibold text-sm mb-3 text-muted-foreground">
                                    Logged Sensations ({fields.length})
                                  </h3>
                                  <div className="space-y-2">
                                    <AnimatePresence>
                                      {fields.map((field, index) => (
                                        <motion.div
                                          key={field.id}
                                          layout
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -20 }}
                                          className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border text-sm"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge variant="default" className="text-xs">
                                                {field.location}
                                              </Badge>
                                              <span className="text-xs font-medium">
                                                {field.intensity}/10
                                              </span>
                                            </div>
                                            {field.notes && (
                                              <p className="text-xs text-muted-foreground italic truncate">
                                                "{field.notes}"
                                              </p>
                                            )}
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="ml-2 h-6 w-6 p-0 shrink-0"
                                          >
                                            <XIcon className="h-3 w-3" />
                                          </Button>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  </div>
              </div>
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center">
                  <Button type="button" size="icon" variant="ghost" className="rounded-full h-12 w-12 animate-bounce" onClick={() => scrollTo(emotionRef)}>
                      <ArrowDown />
                  </Button>
              </div>
          </StepSection>

          {/* Step 2: Emotions */}
          <StepSection ref={emotionRef}>
              <div className="flex flex-col items-center justify-center text-center h-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full max-w-lg h-96">
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-600 to-teal-400 rounded-full blur-3xl opacity-50"></div>
                      </div>
                  </div>

                  <div className="relative z-10 flex flex-col h-full w-full">
                    <div className="text-center pt-8">
                        <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-foreground mb-4">How Do You Feel?</h1>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            First, pick a broad category from the outer wheel, then a specific feeling from the inner wheel.
                        </p>
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-8 items-center overflow-hidden">
                        <div className="relative w-full h-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] max-h-[300px] sm:max-h-[400px] md:max-h-[500px] mx-auto aspect-square">
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
                                    <FormMessage className="text-center absolute -bottom-4 left-0 right-0" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <AnimatePresence>
                            {specificEmotionsOptions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col justify-center"
                            >
                                <ScrollArea className="pr-4">
                                <FormField
                                control={form.control}
                                name="specificEmotions"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base sm:text-lg font-semibold">
                                        Which of these best describe how you're feeling?
                                        </FormLabel>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                        Select all that apply.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {specificEmotionsOptions.map((item) => (
                                        <FormField
                                            key={item}
                                            control={form.control}
                                            name="specificEmotions"
                                            render={({ field }) => {
                                                const isSelected = field.value?.includes(item);
                                                return (
                                                <FormItem key={item}>
                                                    <FormControl>
                                                    <Button
                                                        type="button"
                                                        variant={isSelected ? "default" : "outline"}
                                                        size="sm"
                                                        className={cn(
                                                        "rounded-full px-4 transition-all",
                                                        isSelected && "shadow-md"
                                                        )}
                                                        onClick={() => {
                                                        if (isSelected) {
                                                            field.onChange(
                                                            field.value?.filter((value) => value !== item)
                                                            );
                                                        } else {
                                                            field.onChange([...(field.value ?? []), item]);
                                                        }
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
                                    <FormMessage className="pt-2" />
                                    </FormItem>
                                )}
                                />
                                </ScrollArea>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                  </div>
                  <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center">
                      <Button type="button" size="icon" variant="ghost" className="rounded-full h-12 w-12 animate-bounce" onClick={() => scrollTo(thoughtRef)}>
                          <ArrowDown />
                      </Button>
                  </div>
              </div>
          </StepSection>

          {/* Step 3: Thoughts */}
          <StepSection ref={thoughtRef}>
              <div className="flex flex-col items-center justify-center h-full text-center relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-full max-w-lg h-96">
                          <div className="absolute inset-0 bg-gradient-to-tl from-green-400 via-yellow-400 to-blue-500 rounded-full blur-3xl opacity-50"></div>
                      </div>
                  </div>
                  <div className="relative z-10 w-full px-4">
                      <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-foreground mb-4">
                          What's On Your Mind?
                      </h1>
                      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                          Observe your thoughts without judgment. What patterns do you notice? This helps in understanding your mental habits.
                      </p>
                      <Card className="w-full max-w-2xl mx-auto bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col max-h-[60vh]">
                          <CardContent className="flex-1 p-6">
                              <ScrollArea className="h-full pr-3">
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
                                                  <FormItem key={item.id}>
                                                      <FormControl>
                                                      <Button
                                                          type="button"
                                                          variant={isSelected ? "default" : "outline"}
                                                          size="sm"
                                                          className={cn(
                                                          "rounded-full px-4 transition-all",
                                                          isSelected && "shadow-md"
                                                          )}
                                                          onClick={() => {
                                                          if (isSelected) {
                                                              field.onChange(
                                                              field.value?.filter((value) => value !== item.id)
                                                              );
                                                          } else {
                                                              field.onChange([...(field.value ?? []), item.id]);
                                                          }
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
                              </ScrollArea>
                          </CardContent>
                      </Card>
                  </div>
              </div>
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center">
                  <Button type="button" size="icon" variant="ghost" className="rounded-full h-12 w-12 animate-bounce" onClick={() => scrollTo(contextRef)}>
                      <ArrowDown />
                  </Button>
              </div>
          </StepSection>

          {/* Step 4: Context Tags */}
          <StepSection ref={contextRef}>
              <div className="flex flex-col items-center justify-center h-full relative overflow-y-auto">
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-full max-w-lg h-96">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-3xl opacity-50"></div>
                      </div>
                  </div>
                  <div className="relative z-10 w-full px-4 py-8 max-w-4xl mx-auto">
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
              </div>
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center">
                  <Button type="button" size="icon" variant="ghost" className="rounded-full h-12 w-12 animate-bounce" onClick={() => scrollTo(journalRef)}>
                      <ArrowDown />
                  </Button>
              </div>
          </StepSection>

          {/* Step 5: Journal Entry */}
          <StepSection ref={journalRef}>
              <div className="flex flex-col items-center justify-center h-full relative overflow-y-auto">
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-full max-w-lg h-96">
                          <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 rounded-full blur-3xl opacity-50"></div>
                      </div>
                  </div>
                  <div className="relative z-10 w-full px-4 py-8 max-w-3xl mx-auto">
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
              </div>
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
                  <Button
                      type="button"
                      size="lg"
                      className="rounded-full px-8 shadow-lg"
                      onClick={() => {
                        generateCopingSuggestions();
                        scrollTo(copingRef);
                      }}
                  >
                      <ArrowDown className="h-5 w-5 mr-2" />
                      Get Coping Suggestions
                  </Button>
              </div>
          </StepSection>

          {/* Step 6: Coping Suggestions */}
          <StepSection ref={copingRef}>
              <div className="flex flex-col items-center justify-center h-full relative overflow-y-auto">
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-full max-w-lg h-96">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full blur-3xl opacity-50"></div>
                      </div>
                  </div>
                  <div className="relative z-10 w-full px-4 py-8 max-w-4xl mx-auto">
                      <h2 className="text-3xl font-bold mb-2 text-center">Coping Strategies</h2>
                      <p className="text-muted-foreground text-center mb-6">
                          Personalized suggestions to help you manage what you're feeling
                      </p>

                      {isLoadingCoping ? (
                          <Card className="bg-background/80 backdrop-blur-sm">
                              <CardContent className="p-8">
                                  <div className="space-y-4">
                                      {[...Array(3)].map((_, i) => (
                                          <div key={i} className="space-y-2">
                                              <div className="h-5 bg-muted animate-pulse rounded w-2/3" />
                                              <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                                          </div>
                                      ))}
                                  </div>
                              </CardContent>
                          </Card>
                      ) : copingSuggestions ? (
                          <div className="space-y-4">
                              {/* Priority Tip */}
                              <Card className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800">
                                  <CardContent className="p-4">
                                      <div className="flex items-start gap-2">
                                          <span className="text-2xl">⚡</span>
                                          <div>
                                              <p className="font-medium text-sm mb-1">Start Here</p>
                                              <p className="text-sm text-muted-foreground">
                                                  {copingSuggestions.priorityTip}
                                              </p>
                                          </div>
                                      </div>
                                  </CardContent>
                              </Card>

                              {/* Strategies */}
                              <ScrollArea className="h-[400px]">
                                  <div className="space-y-3 pr-4">
                                      {copingSuggestions.strategies.slice(0, 4).map((strategy: any, index: number) => (
                                          <Card key={index} className="bg-background/80 backdrop-blur-sm">
                                              <CardContent className="p-4">
                                                  <div className="flex items-start gap-3">
                                                      <div className="text-2xl">
                                                          {strategy.category === 'immediate' && '⚡'}
                                                          {strategy.category === 'grounding' && '❤️'}
                                                          {strategy.category === 'physical' && '🏃'}
                                                          {strategy.category === 'cognitive' && '🧠'}
                                                          {strategy.category === 'social' && '👥'}
                                                          {strategy.category === 'creative' && '🎨'}
                                                      </div>
                                                      <div className="flex-1 space-y-2">
                                                          <div className="flex items-start justify-between gap-2">
                                                              <h4 className="font-semibold text-sm">{strategy.title}</h4>
                                                              <Badge variant="outline" className="text-xs capitalize shrink-0">
                                                                  {strategy.category}
                                                              </Badge>
                                                          </div>
                                                          <p className="text-sm text-muted-foreground">
                                                              {strategy.description}
                                                          </p>
                                                          <div className="flex gap-2 text-xs text-muted-foreground">
                                                              <span>⏱️ {strategy.duration}</span>
                                                              <span>•</span>
                                                              <span className="capitalize">{strategy.intensity} effort</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      ))}
                                  </div>
                              </ScrollArea>
                          </div>
                      ) : (
                          <Card className="bg-background/80 backdrop-blur-sm">
                              <CardContent className="p-8 text-center">
                                  <p className="text-muted-foreground">
                                      Unable to load coping suggestions. You can still complete your check-in.
                                  </p>
                              </CardContent>
                          </Card>
                      )}
                  </div>
              </div>
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-between px-4 sm:px-6">
                  <Button
                      type="submit"
                      size="lg"
                      variant="outline"
                      disabled={form.formState.isSubmitting}
                      className="rounded-full px-8"
                  >
                      Skip & Complete
                  </Button>
                  <Button
                      type="submit"
                      size="lg"
                      disabled={form.formState.isSubmitting}
                      className="rounded-full px-8 shadow-lg"
                  >
                  {form.formState.isSubmitting ? (
                      <span className="animate-spin">⏳</span>
                  ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Complete Check-in
                      </>
                  )}
                  </Button>
              </div>
          </StepSection>
        </form>
      </Form>
    </div>
  );
}
