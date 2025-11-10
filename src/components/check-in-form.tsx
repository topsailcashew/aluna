
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitLogEntry } from "@/lib/actions";
import { bodyParts, thoughtPatterns, emotionCategories } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { useWellnessLog } from "@/context/wellness-log-provider";
import { useRouter } from "next/navigation";
import { EmotionWheelWrapper } from "./emotion-wheel-wrapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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

function StepCard({ children }: { children: React.ReactNode }) {
    return (
        <Card className="w-full h-full flex flex-col border-0 bg-transparent shadow-none rounded-none">
            {children}
        </Card>
    )
}

export function CheckInForm() {
  const { toast } = useToast();
  const { addLogEntry } = useWellnessLog();
  const router = useRouter();
  const [api, setApi] = React.useState<CarouselApi>();

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
    // Reset specific emotions when the level 2 emotion changes
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

  const handleNext = () => {
    api?.scrollNext();
  };

  const handlePrev = () => {
    api?.scrollPrev();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent>
            {/* Step 1: Sensations */}
            <CarouselItem className="h-full">
              <StepCard>
                <CardHeader>
                  <CardTitle>1. Log Physical Sensations</CardTitle>
                  <CardDescription>
                    Where in your body are you feeling something?
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col md:flex-row gap-4 items-start p-4 border rounded-lg"
                    >
                      <div className="grid gap-4 flex-1 w-full">
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
                                  defaultValue={[5]}
                                  max={10}
                                  step={1}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`sensations.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="e.g., 'buzzing', 'tightness', 'warmth'"
                                  {...field}
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
                        className="shrink-0"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove sensation</span>
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        id: `sensation-${Date.now()}`,
                        location: "",
                        intensity: 5,
                        notes: "",
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sensation
                  </Button>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="button" onClick={handleNext}>
                    Next <ArrowRight className="ml-2" />
                  </Button>
                </CardFooter>
              </StepCard>
            </CarouselItem>

            {/* Step 2: Emotions */}
            <CarouselItem className="h-full">
              <StepCard>
                <CardHeader>
                  <CardTitle>2. Select Your Emotion</CardTitle>
                  <CardDescription>
                    First, pick a broad category, then a specific feeling.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-auto">
                    <div className="flex-1 flex items-center justify-center">
                        <FormField
                            control={form.control}
                            name="emotion"
                            render={({ field }) => (
                                <FormItem className="w-full">
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
                  <AnimatePresence>
                    {specificEmotionsOptions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6 pt-6 border-t"
                      >
                        <FormField
                          control={form.control}
                          name="specificEmotions"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">
                                  Which of these best describe how you're feeling?
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Select all that apply.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {specificEmotionsOptions.map((item) => (
                                  <FormField
                                    key={item}
                                    control={form.control}
                                    name="specificEmotions"
                                    render={({ field }) => (
                                      <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
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
                                        <FormLabel className="font-normal">
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    <ArrowLeft className="mr-2" /> Previous
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Next <ArrowRight className="ml-2" />
                  </Button>
                </CardFooter>
              </StepCard>
            </CarouselItem>

            {/* Step 3: Thoughts */}
            <CarouselItem className="h-full">
              <StepCard>
                <CardHeader>
                  <CardTitle>3. Notice Your Thoughts</CardTitle>
                  <CardDescription>
                    What kind of thinking is happening?
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
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
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([
                                            ...(field.value ?? []),
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
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
                </CardContent>
                <CardFooter className="justify-between">
                   <Button type="button" variant="outline" onClick={handlePrev}>
                    <ArrowLeft className="mr-2" /> Previous
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save Entry"}
                  </Button>
                </CardFooter>
              </StepCard>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </form>
    </Form>
  );
}

    