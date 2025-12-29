import { supabase } from '../lib/supabase';
import { ExerciseDefinition, WeekDayWorkout, WorkoutExercise, HistoryLog, CompletionLog, MuscleGroup } from '../types';
import { INITIAL_WEEK_SCHEDULE, INITIAL_EXERCISES } from '../constants';

// Internal Mapper to sanitize database results into App types
const mapExerciseFromDB = (data: any): ExerciseDefinition => ({
  id: data.id,
  name: data.name,
  slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
  target: (data.muscle_group === 'abs' ? 'core' : data.muscle_group) as MuscleGroup, 
  targetMuscle: data.target_muscle,
  equipment: data.equipment,
  level: data.level,
  imageUrl: data.image_url || data.image || `https://placehold.co/200x200/1e293b/0ea5e9?text=${encodeURIComponent(data.name)}`,
});

export const api = {
  // --- Auth Helper ---
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('User not authenticated');
    return user;
  },

  // --- Exercises Library ---
  getAllExercises: async (): Promise<ExerciseDefinition[]> => {
    try {
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      
      // If the database returns no exercises (new project), we return the INITIAL_EXERCISES
      // as a "seed" fallback so the user is not greeted with an empty list.
      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase error fetching exercises:', error.message);
        return INITIAL_EXERCISES;
      }
      
      return data.map(mapExerciseFromDB);
    } catch (err) {
      console.error('Failed to fetch exercises, falling back to local data', err);
      return INITIAL_EXERCISES;
    }
  },

  // --- Schedule & Workouts ---
  getSchedule: async (): Promise<WeekDayWorkout[]> => {
    try {
      const user = await api.getUser();

      // 1. Fetch user custom day titles (e.g., user renamed "Segunda" to "Peito e Tríceps")
      const { data: schedules } = await supabase
        .from('user_schedules')
        .select('day_id, title')
        .eq('user_id', user.id);

      // 2. Fetch workout items joined with their exercise definitions
      const { data: items, error: itemsError } = await supabase
        .from('workout_items')
        .select(`
          *,
          exercises:exercise_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      // 3. Map the database flat structure back into the WeekDayWorkout hierarchy
      return INITIAL_WEEK_SCHEDULE.map(day => {
        const dbSchedule = schedules?.find(s => s.day_id === day.dayId);
        const dayItems = items?.filter(i => i.day_id === day.dayId) || [];

        return {
          ...day,
          title: dbSchedule?.title || day.title,
          exercises: dayItems.map((item: any) => {
             const exData = item.exercises;
             // Use internal exercise data if relationship joined correctly, otherwise safe fallback
             return {
              id: item.id,
              exerciseId: item.exercise_id,
              name: exData?.name || 'Exercício não encontrado',
              target: (exData?.muscle_group === 'abs' ? 'core' : exData?.muscle_group || 'other') as MuscleGroup,
              imageUrl: exData?.image_url || exData?.image || `https://placehold.co/200x200/1e293b/0ea5e9?text=Ex`,
              sets: item.sets || 3,
              reps: item.reps || 10,
              weight: item.weight || 0,
              notes: item.notes || ''
            };
          })
        };
      });
    } catch (error) {
      console.error('Error loading schedule from Supabase:', error);
      return INITIAL_WEEK_SCHEDULE;
    }
  },

  updateDayTitle: async (dayId: string, title: string) => {
    const user = await api.getUser();
    
    // Upsert logic for schedule titles
    const { data } = await supabase
      .from('user_schedules')
      .select('id')
      .eq('user_id', user.id)
      .eq('day_id', dayId)
      .single();

    if (data) {
       await supabase.from('user_schedules').update({ title }).eq('id', data.id);
    } else {
       await supabase.from('user_schedules').insert({ user_id: user.id, day_id: dayId, title });
    }
  },

  addWorkoutExercise: async (dayId: string, exercise: Omit<WorkoutExercise, 'id'>) => {
    const user = await api.getUser();
    const { error } = await supabase.from('workout_items').insert({
      user_id: user.id,
      day_id: dayId,
      exercise_id: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      notes: exercise.notes
    });
    if (error) throw error;
  },

  updateWorkoutExercise: async (id: string, updates: Partial<WorkoutExercise>) => {
    const user = await api.getUser();
    const { error } = await supabase.from('workout_items').update({
       sets: updates.sets,
       reps: updates.reps,
       weight: updates.weight,
       notes: updates.notes
    }).eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  },

  deleteWorkoutExercise: async (id: string) => {
    const user = await api.getUser();
    const { error } = await supabase.from('workout_items').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
  },

  // --- History Logging ---
  logHistory: async (log: Omit<HistoryLog, 'id'>) => {
    const user = await api.getUser();
    const { error } = await supabase.from('history_logs').insert({
      user_id: user.id,
      exercise_id: log.exerciseId,
      weight: log.weight,
      reps: log.reps,
      sets: log.sets,
      date: log.date
    });
    if (error) throw error;
  },

  getHistory: async (): Promise<HistoryLog[]> => {
    try {
      const user = await api.getUser();
      const { data, error } = await supabase
        .from('history_logs')
        .select(`*, exercises:exercise_id (name)`)
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        exerciseId: row.exercise_id,
        exerciseName: row.exercises?.name || 'Desconhecido',
        weight: row.weight,
        reps: row.reps,
        sets: row.sets
      }));
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  },

  // --- Progress / Completion Tracker ---
  markWorkoutComplete: async () => {
    try {
      const user = await api.getUser();
      const today = new Date().toISOString().split('T')[0];
      
      // Prevent duplicate logs for the same day
      const { data } = await supabase
        .from('completion_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      
      if (!data) {
        await supabase.from('completion_logs').insert({ user_id: user.id, date: today });
      }
    } catch (err) {
      console.error('Error marking workout complete:', err);
    }
  },

  getCompletions: async (): Promise<CompletionLog[]> => {
    try {
      const user = await api.getUser();
      const { data, error } = await supabase
        .from('completion_logs')
        .select('date')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching completion logs:', err);
      return [];
    }
  }
};