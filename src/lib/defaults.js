// Default habits & tasks — exactly matching the paper diary.
export const DEFAULT_SETTINGS = {
  habits: [
    { id: 'no-sugar', label: 'No Sugar', type: 'habit' },
    { id: 'no-fast-food', label: 'No Fast Food', type: 'habit' },
    { id: 'no-corn', label: 'No Corn', type: 'habit' },
    { id: 'train-dog', label: 'Train My Dog', type: 'habit' },
    { id: 'train-body', label: 'Train My Body', type: 'habit' },
    { id: 'train-communication', label: 'Train Communication', type: 'habit' },
    { id: 'water-3l', label: 'Drink 3 Lit Water', type: 'habit' },
    { id: 'study-30', label: 'Study for 30 Minutes', type: 'task' },
    { id: 'content-instagram', label: 'Content Creation — Instagram', type: 'task' },
    { id: 'content-youtube', label: 'Content Creation — YouTube', type: 'task' },
  ],
  challenge: {
    name: '30-Day Challenge',
    length: 30,
    // Day 17 was 08/07/2026, so day 1 = 22/06/2026
    startDate: '2026-06-22',
  },
  notifications: false,
  reminderTime: '20:00',
  theme: 'dark',
}

// score: 1 (worst) → 5 (best), used for mood-vs-habit correlations
export const MOODS = [
  { emoji: '😊', label: 'Great', color: 'text-lime-500', score: 4 },
  { emoji: '😐', label: 'Okay', color: 'text-yellow-500', score: 2 },
  { emoji: '😢', label: 'Sad', color: 'text-blue-400', score: 1 },
  { emoji: '😡', label: 'Frustrated', color: 'text-red-500', score: 2 },
  { emoji: '🥱', label: 'Tired', color: 'text-purple-400', score: 3 },
  { emoji: '🔥', label: 'On Fire', color: 'text-orange-500', score: 5 },
]

export const EMPTY_ENTRY = (date) => ({
  date,
  checks: {},
  regret: '',
  achievement: '',
  take: '',
  mood: null,
  photos: [],
  tags: [],
  prompt: null,
  promptAnswer: '',
})

// Guided reflection prompts — a stable "prompt of the day" per date,
// with a shuffle to override.
export const PROMPTS = [
  'What would you do today if you had no fear?',
  'What did you learn about yourself today?',
  'Who made today better, and why?',
  'What is one thing you keep avoiding?',
  'Describe today in three words.',
  'What are you grateful for right now?',
  'What does your ideal day look like?',
  'What did you say no to today?',
  'What would you tell your younger self?',
  'What is working in your life right now?',
  'What one small change would improve tomorrow?',
  'What did you do today that took courage?',
  'What are you pretending not to know?',
  'What would a great version of tomorrow look like?',
  'What is one thing you are proud of this week?',
  'What has been on your mind lately?',
  'What advice would you give a friend in your situation?',
  'What did you notice today that you usually miss?',
  'How did you take care of yourself today?',
  'What is one thing you want to remember about today?',
]
