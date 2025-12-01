
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

// This is a new, 3-level data structure for emotions.
export const emotionCategories = [
  {
    name: "Happy",
    color: "#F9B233", // Bolder Orange
    subCategories: [
      { name: "Peaceful", emotions: ["Content", "Relaxed", "Calm", "Serene", "Tranquil", "At Ease", "Grounded", "Fulfilled", "Secure"] },
      { name: "Joyful", emotions: ["Pleased", "Glad", "Cheerful", "Elated", "Ecstatic", "Jubilant", "Radiant", "Delighted", "Overjoyed"] },
      { name: "Proud", emotions: ["Satisfied", "Triumphant", "Confident", "Accomplished", "Respected", "Valued", "Assured", "Capable", "Worthy"] },
      { name: "Optimistic", emotions: ["Hopeful", "Encouraged", "Inspired", "Positive", "Enthusiastic", "Eager", "Motivated", "Ambitious", "Trusting"] },
    ],
  },
  {
    name: "Sad",
    color: "#EF798A", // Bolder Pink
    subCategories: [
      { name: "Hurt", emotions: ["Disappointed", "Pained", "Sorrowful", "Let Down", "Wounded", "Betrayed", "Crushed", "Grieved", "Heartbroken"] },
      { name: "Lonely", emotions: ["Isolated", "Abandoned", "Empty", "Forsaken", "Alienated", "Unwanted", "Disconnected", "Alone", "Rejected"] },
      { name: "Guilty", emotions: ["Ashamed", "Remorseful", "Regretful", "Culpable", "Sorry", "Contrite", "Self-reproach", "Disgraced", "Blameworthy"] },
      { name: "Depressed", emotions: ["Gloomy", "Miserable", "Dejected", "Despondent", "Hopeless", "Melancholy", "Defeated", "Powerless", "Lifeless"] },
    ],
  },
  {
    name: "Disgusted",
    color: "#A086D3", // Bolder Purple
    subCategories: [
      { name: "Repelled", emotions: ["Revolted", "Nauseated", "Sickened", "Averse", "Disturbed", "Appalled", "Offended", "Contemptuous", "Horrified"] },
      { name: "Disapproving", emotions: ["Judgmental", "Critical", "Loathing", "Scornful", "Skeptical", "Cynical", "Condemning", "Repulsed", "Displeased"] },
    ],
  },
  {
    name: "Angry",
    color: "#61A0AF", // Bolder Teal/Blue
    subCategories: [
      { name: "Frustrated", emotions: ["Irritated", "Annoyed", "Exasperated", "Impatient", "Aggravated", "Agitated", "Restless", "Bothered", "Vexed"] },
      { name: "Hostile", emotions: ["Aggressive", "Furious", "Enraged", "Hateful", "Violent", "Threatening", "Provoked", "Irate", "Outraged"] },
      { name: "Bitter", emotions: ["Resentful", "Vindictive", "Spiteful", "Jealous", "Grudge-holding", "Acrimonious", "Caustic", "Malicious", "Sullen"] },
    ],
  },
  {
    name: "Fearful",
    color: "#48B3A6", // Bolder Teal/Green
    subCategories: [
      { name: "Anxious", emotions: ["Worried", "Nervous", "Stressed", "Apprehensive", "Uneasy", "Tense", "Edgy", "Overwhelmed", "Frazzled"] },
      { name: "Insecure", emotions: ["Inadequate", "Inferior", "Uncertain", "Self-conscious", "Vulnerable", "Worthless", "Unsure", "Exposed", "Helpless"] },
      { name: "Scared", emotions: ["Frightened", "Terrified", "Panicked", "Alarmed", "Petrified", "Dread", "Horrified", "Afraid", "Daunted"] },
    ],
  },
  {
    name: "Surprised",
    color: "#F2CD5C", // Bolder Yellow
    subCategories: [
      { name: "Amazed", emotions: ["Astonished", "Awestruck", "Impressed", "Startled", "Moved", "Speechless", "Stunned", "Wonder", "Dumbfounded"] },
      { name: "Confused", emotions: ["Baffled", "Puzzled", "Perplexed", "Bewildered", "Disoriented", "Lost", "Uncertain", "Muddled", "Clueless"] },
      { name: "Excited", emotions: ["Eager", "Enthusiastic", "Thrilled", "Anticipating", "Energetic", "Lively", "Aroused", "Fired up", "Passionate"] },
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
