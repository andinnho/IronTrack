import { WeekDayWorkout, HistoryLog, CompletionLog, ExerciseDefinition } from '../types';
import { INITIAL_WEEK_SCHEDULE, INITIAL_EXERCISES } from '../constants';

// Keys for LocalStorage
const SCHEDULE_KEY = 'irontrack_schedule';
const HISTORY_KEY = 'irontrack_history';
const COMPLETION_KEY = 'irontrack_completion';
const EXERCISES_KEY = 'irontrack_exercises';

export const storageService = {
  // --- Schedule Methods ---
  getSchedule: (): WeekDayWorkout[] => {
    const data = localStorage.getItem(SCHEDULE_KEY);
    return data ? JSON.parse(data) : INITIAL_WEEK_SCHEDULE;
  },

  saveSchedule: (schedule: WeekDayWorkout[]) => {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
  },

  updateDayWorkout: (dayId: string, title: string) => {
    const schedule = storageService.getSchedule();
    const updated = schedule.map(day => 
      day.dayId === dayId ? { ...day, title } : day
    );
    storageService.saveSchedule(updated);
    return updated;
  },

  // --- Exercise Definition Methods (Simulating RapidAPI cache) ---
  getAllExercises: (): ExerciseDefinition[] => {
    const data = localStorage.getItem(EXERCISES_KEY);
    return data ? JSON.parse(data) : INITIAL_EXERCISES;
  },

  // --- History & Progress Methods ---
  logSet: (log: Omit<HistoryLog, 'id'>) => {
    const history = storageService.getHistory();
    const newLog: HistoryLog = { ...log, id: Date.now().toString() };
    history.push(newLog);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  getHistory: (): HistoryLog[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },

  getHistoryForExercise: (exerciseId: string): HistoryLog[] => {
    const all = storageService.getHistory();
    return all.filter(h => h.exerciseId === exerciseId).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  // --- Attendance / Completion ---
  markWorkoutComplete: () => {
    const logs = storageService.getCompletions();
    const today = new Date().toISOString().split('T')[0];
    if (!logs.find(l => l.date === today)) {
      logs.push({ date: today });
      localStorage.setItem(COMPLETION_KEY, JSON.stringify(logs));
    }
  },

  getCompletions: (): CompletionLog[] => {
    const data = localStorage.getItem(COMPLETION_KEY);
    return data ? JSON.parse(data) : [];
  }
};