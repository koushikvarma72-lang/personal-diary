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
  theme: 'dark',
}

export const EMPTY_ENTRY = (date) => ({
  date,
  checks: {},
  regret: '',
  achievement: '',
  take: '',
})
