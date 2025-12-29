export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'legs' 
  | 'shoulders' 
  | 'arms' 
  | 'core' 
  | 'cardio' 
  | 'other';

export interface ExerciseDefinition {
  id: string;
  name: string;
  slug: string;
  target: MuscleGroup;
  targetMuscle?: string;
  equipment?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
}

export interface WorkoutExercise {
  id: string; // Unique instance ID in the workout
  exerciseId: string; // ID referencing definition
  name: string;
  target: MuscleGroup;
  imageUrl: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface WeekDayWorkout {
  dayId: string; // 'monday', 'tuesday', etc.
  dayName: string; // 'Segunda', 'Terça'
  title: string; // 'Peito e Tríceps'
  exercises: WorkoutExercise[];
}

export interface HistoryLog {
  id: string;
  date: string; // ISO date string
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  sets: number;
}

export interface CompletionLog {
  date: string; // ISO date YYYY-MM-DD
}

export interface UserSettings {
  name: string;
  theme: 'dark' | 'light';
}