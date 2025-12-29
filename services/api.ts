import { supabase } from '../lib/supabase';
import { ExerciseDefinition, WeekDayWorkout, WorkoutExercise, HistoryLog, CompletionLog, MuscleGroup } from '../types';
import { INITIAL_WEEK_SCHEDULE, INITIAL_EXERCISES } from '../constants';

// Helper to map DB response to ExerciseDefinition type
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
  // --- Auth & User context ---
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Usuário não autenticado');
    return user;
  },

  // --- Exercises Library ---
  getAllExercises: async (): Promise<ExerciseDefinition[]> => {
    try {
      const { data, error } = await supabase.from('exercises').select('*').order('name');
      
      // Fallback to constants if DB is empty or fails
      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase: Erro ao buscar exercícios, usando locais.', error.message);
        return INITIAL_EXERCISES;
      }
      
      return data.map(mapExerciseFromDB);
    } catch (err) {
      console.error('Erro crítico ao buscar exercícios:', err);
      return INITIAL_EXERCISES;
    }
  },

  // --- Workout Schedule ---
  getSchedule: async (): Promise<WeekDayWorkout[]> => {
    try {
      const user = await api.getUser();

      // 1. Get custom day titles
      const { data: schedules } = await supabase
        .from('user_schedules')
        .select('day_id, title')
        .eq('user_id', user.id);

      // 2. Get workout exercises with joined details
      const { data: items, error: itemsError } = await supabase
        .from('workout_items')
        .select(`
          *,
          exercises:exercise_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      // 3. Construct the WeekDayWorkout structure
      return INITIAL_WEEK_SCHEDULE.map(day => {
        const dbSchedule = schedules?.find(s => s.day_id === day.dayId);
        const dayItems = items?.filter(i => i.day_id === day.dayId) || [];

        return {
          ...day,
          title: dbSchedule?.title || day.title,
          exercises: dayItems.map((item: any) => {
             const ex = item.exercises;
             return {
              id: item.id,
              exerciseId: item.exercise_id,
              name: ex?.name || 'Exercício Removido',
              target: (ex?.muscle_group === 'abs' ? 'core' : ex?.muscle_group || 'other') as MuscleGroup,
              imageUrl: ex?.image_url || ex?.image || `https://placehold.co/200x200/1e293b/0ea5e9?text=Ex`,
              sets: item.sets || 3,
              reps: item.reps || 10,
              weight: item.weight || 0,
              notes: item.notes || ''
            };
          })
        };
      });
    } catch (error) {
      console.error('Erro ao carregar agenda do Supabase:', error);
      return INITIAL_WEEK_SCHEDULE;
    }
  },

  updateDayTitle: async (dayId: string, title: string) => {
    const user = await api.getUser();
    
    // Check for existing entry to decide between insert or update
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

  // --- CRUD Workout Items ---
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

  // --- Progressive Overload History ---
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
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  },

  // --- Consistency Logging ---
  markWorkoutComplete: async () => {
    try {
      const user = await api.getUser();
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already completed today
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
      console.error('Erro ao marcar treino como concluído:', err);
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
      console.error('Erro ao buscar logs de conclusão:', err);
      return [];
    }
  }
};