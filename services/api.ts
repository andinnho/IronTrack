import { supabase } from '../lib/supabase';
import { ExerciseDefinition, WeekDayWorkout, WorkoutExercise, HistoryLog, CompletionLog, MuscleGroup } from '../types';
import { INITIAL_WEEK_SCHEDULE, INITIAL_EXERCISES } from '../constants';

// Mappers
const mapExerciseFromDB = (data: any): ExerciseDefinition => ({
  id: data.id,
  name: data.name,
  slug: data.slug,
  target: (data.muscle_group === 'abs' ? 'core' : data.muscle_group) as MuscleGroup, 
  targetMuscle: data.target_muscle,
  equipment: data.equipment,
  level: data.level,
  imageUrl: data.image_url || data.image || `https://placehold.co/200x200/1e293b/0ea5e9?text=${encodeURIComponent(data.name)}`,
});

export const api = {
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user;
  },

  getAllExercises: async (): Promise<ExerciseDefinition[]> => {
    try {
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      
      // If error or table is empty, return initial constants so the UI isn't blank
      if (error || !data || data.length === 0) {
        if (error) console.error('Supabase error fetching exercises:', error.message);
        return INITIAL_EXERCISES;
      }
      
      return data.map(mapExerciseFromDB);
    } catch (err) {
      console.error('Failed to fetch exercises, falling back to local data', err);
      return INITIAL_EXERCISES;
    }
  },

  getSchedule: async (): Promise<WeekDayWorkout[]> => {
    try {
      const user = await api.getUser();

      const { data: schedules } = await supabase
        .from('user_schedules')
        .select('day_id, title')
        .eq('user_id', user.id);

      const { data: items } = await supabase
        .from('workout_items')
        .select(`
          *,
          exercises:exercise_id (*)
        `)
        .eq('user_id', user.id);

      return INITIAL_WEEK_SCHEDULE.map(day => {
        const dbSchedule = schedules?.find(s => s.day_id === day.dayId);
        const dayItems = items?.filter(i => i.day_id === day.dayId) || [];

        return {
          ...day,
          title: dbSchedule?.title || day.title,
          exercises: dayItems.map((item: any) => {
             const exData = item.exercises;
             const img = exData?.image_url || exData?.image || `https://placehold.co/200x200/1e293b/0ea5e9?text=Ex`;
             
             return {
              id: item.id,
              exerciseId: item.exercise_id,
              name: exData?.name || 'Exercício Removido',
              target: (exData?.muscle_group === 'abs' ? 'core' : exData?.muscle_group) as MuscleGroup,
              imageUrl: img,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight,
              notes: item.notes
            };
          })
        };
      });
    } catch (error) {
      console.error('Error loading schedule:', error);
      return INITIAL_WEEK_SCHEDULE;
    }
  },

  updateDayTitle: async (dayId: string, title: string) => {
    const user = await api.getUser();
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
    await supabase.from('workout_items').insert({
      user_id: user.id,
      day_id: dayId,
      exercise_id: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      notes: exercise.notes
    });
  },

  updateWorkoutExercise: async (id: string, updates: Partial<WorkoutExercise>) => {
    const user = await api.getUser();
    await supabase.from('workout_items').update({
       sets: updates.sets,
       reps: updates.reps,
       weight: updates.weight,
       notes: updates.notes
    }).eq('id', id).eq('user_id', user.id);
  },

  deleteWorkoutExercise: async (id: string) => {
    const user = await api.getUser();
    await supabase.from('workout_items').delete().eq('id', id).eq('user_id', user.id);
  },

  logHistory: async (log: Omit<HistoryLog, 'id'>) => {
    const user = await api.getUser();
    await supabase.from('history_logs').insert({
      user_id: user.id,
      exercise_id: log.exerciseId,
      weight: log.weight,
      reps: log.reps,
      sets: log.sets,
      date: log.date
    });
  },

  getHistory: async (): Promise<HistoryLog[]> => {
    const user = await api.getUser();
    const { data, error } = await supabase
      .from('history_logs')
      .select(`*, exercises:exercise_id (name)`)
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    
    if (error) return [];
    return (data || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      exerciseId: row.exercise_id,
      exerciseName: row.exercises?.name,
      weight: row.weight,
      reps: row.reps,
      sets: row.sets
    }));
  },

  markWorkoutComplete: async () => {
    const user = await api.getUser();
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('completion_logs')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    if (!data) {
      await supabase.from('completion_logs').insert({ user_id: user.id, date: today });
    }
  },

  getCompletions: async (): Promise<CompletionLog[]> => {
    const user = await api.getUser();
    const { data, error } = await supabase
      .from('completion_logs')
      .select('date')
      .eq('user_id', user.id);
    
    if (error) return [];
    return data || [];
  }
};