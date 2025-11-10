
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, Trash2 } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { HumanBodyWrapper } from "@/components/human-body-wrapper";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from 'next/image';

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

function StepSection({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <section className={`h-screen w-screen flex flex-col p-4 sm:p-6 snap-start relative ${className}`}>
            {children}
        </section>
    )
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function CheckInForm() {
  const { toast } = useToast();
  const { addLogEntry } = useWellnessLog();
  const router = useRouter();

  const sensationRef = React.useRef<HTMLDivElement>(null);
  const emotionRef = React.useRef<HTMLDivElement>(null);
  const thoughtRef = React.useRef<HTMLDivElement>(null);

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
  
  const thinkingPatternImage = PlaceHolderImages.find(img => img.id === 'thinking-patterns');

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

  const handleBodyPartClick = (part: {slug: string, title: string}) => {
    const capitalizedPart = capitalize(part.slug);
    if (bodyParts.includes(capitalizedPart)) {
         append({
            id: `sensation-${Date.now()}`,
            location: capitalizedPart,
            intensity: 5,
            notes: "",
        });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-screen snap-y snap-mandatory overflow-y-scroll overflow-x-hidden">
        
        {/* Step 1: Sensations */}
        <StepSection ref={sensationRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center h-full">
                <div className="p-4 md:p-8 h-full flex flex-col justify-center">
                <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl text-gray-700 mb-4 sm:mb-6">Where Do You Feel It?</h1>
                <p className="text-base sm:text-lg text-gray-600">
                    Click on the body part to log a sensation. Reflect on your body and identify{" "}
                    <span className="font-semibold">specific areas</span> where you experience discomfort or tension right now.
                </p>
                </div>

                <div className="flex flex-col items-center justify-center p-2 sm:p-4 h-full overflow-hidden">
                    <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-2xl flex flex-col h-full">
                    <CardContent className="flex-1 flex flex-col gap-4 p-4 sm:p-6 overflow-hidden">
                    <div className="relative w-full aspect-square mb-4 flex-shrink-0">
                        <HumanBodyWrapper
                            onClick={handleBodyPartClick}
                        />
                    </div>
                        <ScrollArea className="flex-grow">
                        {fields.map((field, index) => (
                        <motion.div
                            key={field.id}
                            layout
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex gap-4 items-start p-3 border rounded-lg bg-white/70 mb-2"
                        >
                            <div className="grid gap-3 flex-1 w-full">
                            <FormField
                                control={form.control}
                                name={`sensations.${index}.location`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a body part" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {bodyParts.map((part) => (
                                        <SelectItem key={part} value={part}>
                                            {part}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`sensations.${index}.intensity`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Intensity: {field.value ?? 5}</FormLabel>
                                    <FormControl>
                                    <Slider
                                        value={[field.value]}
                                        max={10}
                                        step={1}
                                        onValueChange={(vals) => field.onChange(vals[0])}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            </div>
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 mt-6"
                            onClick={() => remove(index)}
                            >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove sensation</span>
                            </Button>
                        </motion.div>
                        ))}
                        </ScrollArea>
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
            <div className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Select Your Emotion</CardTitle>
                    <CardDescription>
                        First, pick a broad category, then a specific feeling.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 grid md:grid-cols-2 gap-4 md:gap-8 items-center overflow-hidden">
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
                                            className="flex flex-row items-start space-x-3 space-y-0 p-3 bg-background/50 rounded-lg"
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
                </CardContent>
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center">
                    <Button type="button" size="icon" variant="ghost" className="rounded-full h-12 w-12 animate-bounce" onClick={() => scrollTo(thoughtRef)}>
                        <ArrowDown />
                    </Button>
                </div>
            </div>
        </StepSection>

        {/* Step 3: Thoughts */}
        <StepSection ref={thoughtRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center h-full">
                <div className="p-4 md:p-8 h-full flex flex-col justify-center">
                <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl text-gray-700 mb-4 sm:mb-6">
                    Thinking Patterns
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                    Take a moment to observe your thoughts. Recognize
                    recurring patterns and their impact on your feelings and
                    actions.
                </p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 sm:p-4 h-full overflow-hidden">
                <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-2xl flex flex-col h-full relative overflow-hidden">
                    {thinkingPatternImage && (
                    <Image
                        src={thinkingPatternImage.imageUrl}
                        alt={thinkingPatternImage.description}
                        fill
                        className="object-cover opacity-20"
                        data-ai-hint={thinkingPatternImage.imageHint}
                    />
                    )}
                    <div className="relative z-10 flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl">Notice Your Thoughts</CardTitle>
                        <CardDescription>
                        What kind of thinking is happening?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-full pr-3">
                        <FormField
                            control={form.control}
                            name="thoughts"
                            render={() => (
                            <FormItem className="space-y-3">
                                {thoughtPatterns.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="thoughts"
                                    render={({ field }) => (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-lg bg-background/60 p-3"
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
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </ScrollArea>
                    </CardContent>
                    </div>
                </Card>
                </div>
            </div>
            <CardFooter className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
                <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                >
                {form.formState.isSubmitting ? "Saving..." : "Save Entry"}
                </Button>
            </CardFooter>
        </StepSection>
      </form>
    </Form>
  );
}

    