
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, Plus, XIcon } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

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
import { Checkbox } from "@/components/ui/checkbox";
import { useWellnessLog } from "@/context/wellness-log-provider";
import { useRouter } from "next/navigation";
import { EmotionWheelWrapper } from "./emotion-wheel-wrapper";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

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
});

type CheckInFormValues = z.infer<typeof formSchema>;

const StepSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(
    ({ children, className }, ref) => {
    return (
        <section ref={ref} className={`h-screen w-screen flex flex-col p-4 sm:p-6 snap-start relative ${className}`}>
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

  const [currentSensation, setCurrentSensation] = React.useState({
    location: '',
    intensity: 5,
    notes: '',
  });

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emotion: "",
      specificEmotions: [],
      sensations: [],
      thoughts: [],
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

  React.useEffect(() => {
    form.setValue("specificEmotions", []);
  }, [selectedLevel2Emotion, form]);


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


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-screen snap-y snap-mandatory overflow-y-scroll overflow-x-hidden">
        
        <StepSection ref={sensationRef}>
            <div className="flex flex-col items-center justify-center h-full text-center relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full max-w-lg h-96">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 via-indigo-600 to-yellow-300 rounded-full blur-3xl opacity-50"></div>
                    </div>
                </div>
                <div className="relative z-10 w-full px-4">
                    <h1 className="font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tighter text-foreground mb-4">Where Do You Feel It?</h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Scan your body. Note any physical sensations, their location, and intensity.
                    </p>
                    <Card className="w-full max-w-4xl mx-auto bg-background/80 backdrop-blur-sm rounded-2xl flex flex-col h-auto max-h-[60vh]">
                        <CardContent className="flex-1 grid md:grid-cols-2 gap-x-8 gap-y-4 p-6 overflow-hidden">
                          {/* Left: Editor */}
                          <div className="flex flex-col gap-4 text-left">
                            <h3 className="font-semibold text-lg">Log a new sensation</h3>
                             <FormItem>
                                <FormLabel>Location</FormLabel>
                                <Select 
                                  value={currentSensation.location} 
                                  onValueChange={(val) => setCurrentSensation(p => ({...p, location: val}))}
                                >
                                    <SelectTrigger className="bg-white/50">
                                        <SelectValue placeholder="Select a body part" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bodyParts.map((part) => (
                                            <SelectItem key={part} value={part}>
                                                {part}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                            <FormItem>
                               <FormLabel>Intensity: {currentSensation.intensity}</FormLabel>
                               <Slider
                                  value={[currentSensation.intensity]}
                                  max={10}
                                  step={1}
                                  onValueChange={(vals) => setCurrentSensation(p => ({...p, intensity: vals[0]}))}
                               />
                            </FormItem>
                             <FormItem>
                                <FormLabel>Sensation Notes</FormLabel>
                                <Input 
                                  placeholder="e.g., tingling, warmth"
                                  value={currentSensation.notes}
                                  onChange={(e) => setCurrentSensation(p => ({...p, notes: e.target.value}))}
                                  className="bg-white/50"
                                />
                            </FormItem>
                            <Button type="button" size="icon" onClick={addNewSensation} className="mt-auto self-end rounded-full">
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Log Sensation</span>
                            </Button>
                          </div>

                          {/* Right: Pills */}
                          <div className="flex flex-col gap-4">
                            <h3 className="font-semibold text-lg text-left">Logged Sensations</h3>
                             <ScrollArea className="h-full bg-black/5 rounded-lg border p-3">
                               {fields.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                    {fields.map((field, index) => (
                                       <motion.div
                                        key={field.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                       >
                                        <Badge variant="secondary" className="text-base py-1 pl-3 pr-2 h-auto">
                                          {field.location}: {field.intensity}/10
                                          <button type="button" onClick={() => remove(index)} className="ml-2 rounded-full hover:bg-black/10 p-0.5">
                                            <XIcon className="h-3 w-3" />
                                            <span className="sr-only">Remove {field.location}</span>
                                          </button>
                                        </Badge>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                               ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                  No sensations logged yet.
                                </div>
                               )}
                             </ScrollArea>
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
                      <h1 className="font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tighter text-foreground mb-4">How Do You Feel?</h1>
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
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                      {specificEmotionsOptions.map((item) => (
                                      <FormField
                                          key={item}
                                          control={form.control}
                                          name="specificEmotions"
                                          render={({ field }) => (
                                          <FormItem
                                              key={item}
                                              className="flex flex-row items-start space-x-3 space-y-0 p-3 bg-black/5 rounded-lg"
                                          >
                                              <FormControl>
                                              <Checkbox
                                                  checked={field.value?.includes(item)}
                                                  onCheckedChange={(checked) =>
                                                  checked
                                                      ? field.onChange([
                                                          ...(field.value ?? []),
                                                          item,
                                                      ])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                          (value) => value !== item
                                                          )
                                                      )
                                                  }
                                              />
                                              </FormControl>
                                              <FormLabel className="font-normal text-sm sm:text-base">
                                              {item}
                                              </FormLabel>
                                          </FormItem>
                                          )}
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
                    <h1 className="font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tighter text-foreground mb-4">
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
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {thoughtPatterns.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="thoughts"
                                            render={({ field }) => (
                                            <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-lg bg-black/5 p-3"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={
                                                    field.value?.includes(item.id)
                                                    }
                                                    onCheckedChange={(checked) =>
                                                    checked
                                                        ? field.onChange([
                                                            ...(field.value ?? []),
                                                            item.id,
                                                        ])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                            (value) =>
                                                                value !== item.id
                                                            )
                                                        )
                                                    }
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal text-sm sm:text-base">
                                                {item.label}
                                                </FormLabel>
                                            </FormItem>
                                            )}
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
            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
                <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="font-bold"
                >
                {form.formState.isSubmitting ? "Saving..." : "Save Entry"}
                </Button>
            </div>
        </StepSection>
      </form>
    </Form>
  );
}

    