
import { subDays } from "date-fns";
import { Sensation, LegacyLogEntry } from "./types";

// Re-export for backward compatibility
export type { Sensation, LegacyLogEntry };

// This is kept for mock data only
export type LogEntry = LegacyLogEntry;

export const bodyParts = [
  "Head",
  "Face",
  "Eyes",
  "Ears",
  "Nose",
  "Mouth",
  "Jaw",
  "Neck",
  "Throat",
  "Shoulders",
  "Chest",
  "Upper Back",
  "Lower Back",
  "Stomach",
  "Abdomen",
  "Hips",
  "Arms",
  "Elbows",
  "Wrists",
  "Hands",
  "Fingers",
  "Legs",
  "Thighs",
  "Knees",
  "Ankles",
  "Feet",
  "Toes",
  "Other",
];

// 3-level Wheel of Emotions data structure
// Based on the Plutchik Wheel of Emotions model
export const emotionCategories = [
  {
    name: "Happy",
    color: "#FDCB58", // Yellow (Mood Tracking)
    subCategories: [
      { name: "Joyful", emotions: ["Excited", "Interested", "Liberated", "Ecstatic", "Invigorated", "Amused", "Confident", "Important", "Fulfilled"] },
      { name: "Proud", emotions: ["Accepted", "Powerful", "Courageous", "Creative", "Provocative", "Respected"] },
      { name: "Optimistic", emotions: ["Hopeful", "Loving", "Sensitive", "Inspired", "Open", "Playful", "Intimate"] },
      { name: "Peaceful", emotions: ["Trusting", "Thankful", "Secure", "Nurturing", "Comfortable", "Relaxed", "Serene"] },
    ],
  },
  {
    name: "Sad",
    color: "#4D87E6", // Blue (Sleep)
    subCategories: [
      { name: "Lonely", emotions: ["Isolated", "Abandoned", "Alone", "Inferior", "Empty", "Apathetic", "Indifferent"] },
      { name: "Guilty", emotions: ["Ashamed", "Remorseful", "Ignored", "Victimized", "Abandoned"] },
      { name: "Depressed", emotions: ["Inferior", "Empty", "Vulnerable", "Powerless", "Bored", "Despair"] },
      { name: "Hurt", emotions: ["Disappointed", "Embarrassed", "Devastated", "Rejected", "Insecure"] },
    ],
  },
  {
    name: "Disgust",
    color: "#A876C4", // Purple (Therapy)
    subCategories: [
      { name: "Awful", emotions: ["Repulsed", "Nauseated", "Detestable", "Revolted", "Sickened", "Repelled"] },
      { name: "Disapproving", emotions: ["Judgmental", "Loathing", "Critical", "Disappointed", "Disapproval"] },
      { name: "Avoidance", emotions: ["Hesitant", "Aversion", "Detestable", "Revolted", "Awful"] },
    ],
  },
  {
    name: "Anger",
    color: "#EB7995", // Pink (Community)
    subCategories: [
      { name: "Frustrated", emotions: ["Infuriated", "Irritated", "Aggravated", "Agitated", "Distant", "Critical"] },
      { name: "Mad", emotions: ["Furious", "Enraged", "Hostile", "Hateful", "Resentful", "Violated"] },
      { name: "Aggressive", emotions: ["Provoked", "Hostile", "Hateful", "Threatened", "Oppressed", "Aggressive"] },
      { name: "Hurt", emotions: ["Embarrassed", "Jealous", "Violated", "Resentful", "Withdrawn", "Skeptical", "Suspicious"] },
    ],
  },
  {
    name: "Fearful",
    color: "#5CAE5C", // Green (Mindfulness)
    subCategories: [
      { name: "Scared", emotions: ["Frightened", "Terrified", "Shocked", "Overwhelmed", "Helpless"] },
      { name: "Anxious", emotions: ["Worried", "Inadequate", "Insecure", "Inferior", "Insignificant", "Worthless", "Overwhelmed"] },
      { name: "Rejected", emotions: ["Alienated", "Ridiculed", "Persecuted", "Disrespected", "Humiliated", "Inadequate"] },
      { name: "Insecure", emotions: ["Submissive", "Rejected", "Humiliated", "Insecure", "Inferior", "Inadequate", "Insignificant", "Worthless"] },
    ],
  },
  {
    name: "Surprise",
    color: "#60C3B7", // Teal (Stress Relief)
    subCategories: [
      { name: "Excited", emotions: ["Eager", "Energetic", "Liberated", "Ecstatic", "Amazed", "Awe"] },
      { name: "Amazed", emotions: ["Astonished", "Awe", "Eager", "Energetic", "Shocked", "Dismayed"] },
      { name: "Confused", emotions: ["Perplexed", "Disillusioned", "Amazed", "Astonished", "Startled", "Dismayed"] },
    ],
  },
];


// This is a flattened list for easier lookups in the chart components.
// We are not using this for now, but it might be useful later.
export const emotions = emotionCategories.flatMap(cat => 
  cat.subCategories.flatMap(sub => 
    sub.emotions.map(emo => ({
      name: emo,
      color: cat.color
    }))
  )
);


export const thoughtPatterns = [
  { id: "future_worry", label: "Worrying about the future" },
  { id: "past_rumination", label: "Dwelling on the past" },
  { id: "self_criticism", label: "Engaging in self-criticism" },
  { id: "black_and_white", label: "Black-and-white thinking" },
  { id: "catastrophizing", label: "Catastrophizing" },
  { id: "personalization", label: "Taking things personally" },
  { id: "mind_reading", label: "Assuming what others think" },
  { id: "should_statements", label: "Using 'should' statements" },
  { id: "gratitude", label: "Feeling grateful or appreciative" },
  { id: "problem_solving", label: "Planning or problem-solving" },
  { id: "observational", label: "Simply observing the present" },
  { id: "daydreaming", label: "Mind wandering or daydreaming" },
  { id: "curiosity", label: "Feeling curious or inquisitive" },
  { id: "replaying_conversations", label: "Replaying conversations" },
  { id: "making_comparisons", label: "Making comparisons to others" },
  { id: "self_doubt", label: "Experiencing self-doubt" },
];

export const initialLogEntries: LogEntry[] = [
  {
    id: "1",
    date: subDays(new Date(), 7).toISOString(),
    emotion: "Depressed",
    specificEmotions: ["Gloomy", "Miserable"],
    sensations: [
      { id: "s1", location: "Chest", intensity: 7, notes: "Heaviness" },
    ],
    thoughts: ["past_rumination"],
  },
  {
    id: "2",
    date: subDays(new Date(), 5).toISOString(),
    emotion: "Anxious",
    specificEmotions: ["Worried", "Stressed"],
    sensations: [
      { id: "s2", location: "Stomach", intensity: 8, notes: "Butterflies" },
      { id: "s3", location: "Hands", intensity: 6, notes: "Sweaty palms" },
    ],
    thoughts: ["future_worry"],
  },
  {
    id: "3",
    date: subDays(new Date(), 4).toISOString(),
    emotion: "Joyful",
    specificEmotions: ["Pleased", "Cheerful"],
    sensations: [
      { id: "s4", location: "Chest", intensity: 4, notes: "Warmth and lightness" },
    ],
    thoughts: ["gratitude"],
  },
  {
    id: "4",
    date: subDays(new Date(), 2).toISOString(),
    emotion: "Excited",
    specificEmotions: ["Eager", "Thrilled"],
    sensations: [
       { id: "s5", location: "Stomach", intensity: 5, notes: "Excited jitters" },
    ],
    thoughts: ["problem_solving", "daydreaming"],
  },
  {
    id: "5",
    date: subDays(new Date(), 1).toISOString(),
    emotion: "Frustrated",
    specificEmotions: ["Irritated", "Annoyed"],
    sensations: [
       { id: "s6", location: "Head", intensity: 6, notes: "Tension headache" },
       { id: "s7", location: "Shoulders", intensity: 7, notes: "Tightness" },
    ],
    thoughts: ["self_criticism", "past_rumination"],
  },
];
