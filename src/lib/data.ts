import { addDays, subDays } from "date-fns";

export type Sensation = {
  id: string;
  location: string;
  intensity: number;
  notes: string;
};

export type LogEntry = {
  id: string;
  date: string;
  emotion: string;
  sensations: Sensation[];
  thoughts: string[];
};

export const bodyParts = [
  "Head",
  "Neck",
  "Shoulders",
  "Arms",
  "Hands",
  "Chest",
  "Stomach",
  "Back",
  "Hips",
  "Legs",
  "Feet",
  "Other",
];

export const emotions = [
  { name: 'Happy', color: '#ff8c00' },
  { name: 'Playful', color: '#ff8c00' },
  { name: 'Content', color: '#ff8c00' },
  { name: 'Interested', color: '#ff8c00' },
  { name: 'Proud', color: '#ff8c00' },
  { name: 'Accepted', color: '#ff8c00' },
  { name: 'Powerful', color: '#ff8c00' },
  { name: 'Peaceful', color: '#ff8c00' },
  { name: 'Trusting', color: '#ff8c00' },
  { name: 'Optimistic', color: '#ff8c00' },

  { name: 'Sad', color: '#c71585' },
  { name: 'Lonely', color: '#c71585' },
  { name: 'Vulnerable', color: '#c71585' },
  { name: 'Despair', color: '#c71585' },
  { name: 'Guilty', color: '#c71585' },
  { name: 'Depressed', color: '#c71585' },
  { name: 'Hurt', color: '#c71585' },

  { name: 'Disgusted', color: '#8a2be2' },
  { name: 'Disapproving', color: '#8a2be2' },
  { name: 'Disappointed', color: '#8a2be2' },
  { name: 'Awful', color: '#8a2be2' },
  { name: 'Repelled', color: '#8a2be2' },
  
  { name: 'Angry', color: '#483d8b' },
  { name: 'Critical', color: '#483d8b' },
  { name: 'Distant', color: '#483d8b' },
  { name: 'Frustrated', color: '#483d8b' },
  { name: 'Aggressive', color: '#483d8b' },
  { name: 'Mad', color: '#483d8b' },
  { name: 'Bitter', color: '#483d8b' },
  { name: 'Humiliated', color: '#483d8b' },
  { name: 'Let down', color: '#483d8b' },
  
  { name: 'Fearful', color: '#008080' },
  { name: 'Threatened', color: '#008080' },
  { name: 'Rejected', color: '#008080' },
  { name: 'Weak', color: '#008080' },
  { name: 'Insecure', color: '#008080' },
  { name: 'Anxious', color: '#008080' },
  { name: 'Scared', color: '#008080' },
  
  { name: 'Bad', color: '#2e8b57' },
  { name: 'Bored', color: '#2e8b57' },
  { name: 'Busy', color: '#2e8b57' },
  { name: 'Stressed', color: '#2e8b57' },
  { name: 'Tired', color: '#2e8b57' },

  { name: 'Surprised', color: '#ffd700' },
  { name: 'Startled', color: '#ffd700' },
  { name: 'Confused', color: '#ffd700' },
  { name: 'Amazed', color: '#ffd700' },
  { name: 'Excited', color: '#ffd700' },
];

export const thoughtPatterns = [
  { id: "planning", label: "Planning or problem-solving" },
  { id: "worrying", label: "Worrying about the future" },
  { id: "ruminating", label: "Ruminating on the past" },
  { id: "self-critical", label: "Self-critical thoughts" },
  { id: "grateful", label: "Grateful or appreciative thoughts" },
  { id: "neutral", label: "Neutral or observational" },
  { id: "daydreaming", label: "Daydreaming or wandering" },
];

export const initialLogEntries: LogEntry[] = [
  {
    id: "1",
    date: subDays(new Date(), 7).toISOString(),
    emotion: "Sadness",
    sensations: [
      { id: "s1", location: "Chest", intensity: 7, notes: "Heaviness" },
    ],
    thoughts: ["ruminating"],
  },
  {
    id: "2",
    date: subDays(new Date(), 5).toISOString(),
    emotion: "Fearful",
    sensations: [
      { id: "s2", location: "Stomach", intensity: 8, notes: "Butterflies" },
      { id: "s3", location: "Hands", intensity: 6, notes: "Sweaty palms" },
    ],
    thoughts: ["worrying"],
  },
  {
    id: "3",
    date: subDays(new Date(), 4).toISOString(),
    emotion: "Happy",
    sensations: [
      { id: "s4", location: "Chest", intensity: 4, notes: "Warmth and lightness" },
    ],
    thoughts: ["grateful"],
  },
  {
    id: "4",
    date: subDays(new Date(), 2).toISOString(),
    emotion: "Excited",
    sensations: [
       { id: "s5", location: "Stomach", intensity: 5, notes: "Excited jitters" },
    ],
    thoughts: ["planning", "daydreaming"],
  },
  {
    id: "5",
    date: subDays(new Date(), 1).toISOString(),
    emotion: "Anger",
    sensations: [
       { id: "s6", location: "Head", intensity: 6, notes: "Tension headache" },
       { id: "s7", location: "Shoulders", intensity: 7, notes: "Tightness" },
    ],
    thoughts: ["self-critical", "ruminating"],
  },
];
