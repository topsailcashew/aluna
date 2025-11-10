
"use server";

import { z } from "zod";

const sensationSchema = z.object({
  id: z.string(),
  location: z.string().min(1, "Location is required."),
  intensity: z.number().min(0).max(10),
  notes: z.string().optional(),
});

const logEntrySchema = z.object({
  emotion: z.string().min(1, "A level 2 emotion selection is required."),
  specificEmotions: z.array(z.string()).min(1, "At least one specific emotion must be selected."),
  sensations: z.array(sensationSchema),
  thoughts: z.array(z.string()),
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

  // In a real application, you would save this data to a database.
  // For this example, we'll just log it to the console.
  console.log("New log entry submitted:", parsed.data);

  // We can revalidate paths here if we were fetching data on the server.
  // e.g., revalidatePath('/dashboard');

  return { success: true, message: "Your entry has been logged." };
}
