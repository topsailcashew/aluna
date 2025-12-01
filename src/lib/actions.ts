
"use server";

import { z } from "zod";

const sensationSchema = z.object({
  id: z.string(),
  location: z.string().min(1, "Location is required."),
  intensity: z.number().min(0).max(10),
  notes: z.string().max(200, "Notes are too long.").optional().default(""),
});

const logEntrySchema = z.object({
  emotion: z.string().min(1, "A level 2 emotion selection is required."),
  specificEmotions: z
    .array(z.string())
    .min(1, "At least one specific emotion must be selected."),
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
    .max(2000, "Journal entry is too long (max 2000 characters)")
    .optional(),
});

export async function submitLogEntry(formData: unknown) {
  const parsed = logEntrySchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // The actual data saving is now handled on the client-side via the WellnessLogProvider
  // to leverage Firestore's real-time capabilities and optimistic updates.
  // This server action is now primarily for validation.
  console.log("Validated log entry:", parsed.data);

  return { success: true, message: "Your entry has been validated." };
}
