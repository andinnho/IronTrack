import { supabase } from '../lib/supabase';
import { ExerciseDefinition, WeekDayWorkout, WorkoutExercise, HistoryLog, CompletionLog, MuscleGroup } from '../types';
import { INITIAL_WEEK_SCHEDULE, INITIAL_EXERCISES, getImg } from '../constants';

// Mapeamento de grupo muscular (Banco -> Frontend)
const mapMuscleGroup = (group: string): MuscleGroup => {
  const g = group?.toLowerCase();
  if (g === 'peito') return 'chest';
  if (g === 'costas') return 'back';
  if (g === 'ombro') return 'shoulders';
  if (g === 'biceps' || g === 'triceps') return 'arms';
  if (g === 'pernas' || g === 'panturrilha') return 'legs';
  if (g === 'abdomen') return 'core';
  if (g === 'cardio') return 'cardio';
  return 'other';
};

const mapExerciseFromDB = (data: any): ExerciseDefinition => ({
  id: String(data.id),
  name: data.nome || 'Sem nome',
  slug: data.slug || (data.nome ? data.nome.toLowerCase().replace(/\s+/g, '-') : 'sem-slug'),
  target: mapMuscleGroup(data.grupo_muscular), 
  targetMuscle: '', 
  equipment: data.equipamento || '',
  level: 'beginner',
  // Prioritize imagem_url from DB, fallback to getImg placeholder
  imageUrl: data.imagem_url || getImg(data.nome || 'Ex'),
});

export const api = {
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Usuário não autenticado');
    return user;
  },

  ensureExerciseExists: async (exerciseId: string) => {
    const { data, error } = await supabase.from('exercises').select('id').eq('id', exerciseId).maybeSingle();
    
    if (!data) {
      const def = INITIAL_EXERCISES.find(ex => ex.id === exerciseId);
      if (def) {
        await supabase.from('exercises').insert({
          id: def.id,
          nome: def.name,
          slug: def.slug,
          grupo_muscular: def.target === 'chest' ? 'peito' : 
                         def.target === 'back' ? 'costas' : 
                         def.target === 'shoulders' ? 'ombro' : 
                         def.target === 'arms' ? 'biceps' : 
                         def.target === 'legs' ? 'pernas' : 
                         def.target === 'cardio' ? 'cardio' : 'abdomen',
          equipamento: def.equipment,
          imagem_prompt: `ilustração de ${def.name}`
        });
      } else {
        throw new Error(`Exercício ${exerciseId} não encontrado na base de dados nem na configuração local.`);
      }
    }
  },

  getAllExercises: async (): Promise<ExerciseDefinition[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      if (!data || data.length === 0) return INITIAL_EXERCISES;
      
      return data.map(mapExerciseFromDB);
    } catch (err) {
      console.error('Erro ao buscar exercícios:', err);
      return INITIAL_EXERCISES;
    }
  },

  getRawExercises: async () => {
    const { data, error } = await supabase.from('exercises').select('*');
    if (error) throw error;
    return data;
  },

  updateExerciseImage: async (id: string, imageUrl: string) => {
    const { error } = await supabase
      .from('exercises')
      .update({ imagem_url: imageUrl })
      .eq('id', id);
    if (error) throw error;
  },

  getSchedule: async (): Promise<WeekDayWorkout[]> => {
    try {
      const user = await api.getUser();
      const { data: schedules } = await supabase
        .from('user_schedules')
        .select('day_id, title')
        .eq('user_id', user.id);

      const { data: items, error: itemsError } = await supabase
        .from('workout_items')
        .select(`*, exercises (*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw new Error(itemsError.message);

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
              name: ex?.nome || item.name || 'Exercício',
              target: mapMuscleGroup(ex?.grupo_muscular),
              imageUrl: ex?.imagem_url || getImg(ex?.nome || 'Ex'),
              sets: item.sets || 3,
              reps: item.reps || 10,
              weight: item.weight || 0,
              notes: item.notes || ''
            };
          })
        };
      });
    } catch (error: any) {
      console.error('Erro ao carregar agenda:', error.message);
      return INITIAL_WEEK_SCHEDULE;
    }
  },

  updateDayTitle: async (dayId: string, title: string) => {
    const user = await api.getUser();
    const { data } = await supabase.from('user_schedules').select('id').eq('user_id', user.id).eq('day_id', dayId).maybeSingle();
    if (data) {
       await supabase.from('user_schedules').update({ title }).eq('id', data.id);
    } else {
       await supabase.from('user_schedules').insert({ user_id: user.id, day_id: dayId, title });
    }
  },

  addWorkoutExercise: async (dayId: string, exercise: Omit<WorkoutExercise, 'id'>) => {
    const user = await api.getUser();
    await api.ensureExerciseExists(exercise.exerciseId);
    
    const { error } = await supabase.from('workout_items').insert({
      user_id: user.id,
      day_id: dayId,
      exercise_id: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      notes: exercise.notes
    });
    if (error) throw new Error(error.message);
  },

  updateWorkoutExercise: async (id: string, updates: Partial<WorkoutExercise>) => {
    const user = await api.getUser();
    const { error } = await supabase.from('workout_items').update({
       sets: updates.sets,
       reps: updates.reps,
       weight: updates.weight,
       notes: updates.notes
    }).eq('id', id).eq('user_id', user.id);
    if (error) throw new Error(error.message);
  },

  deleteWorkoutExercise: async (id: string) => {
    const user = await api.getUser();
    const { error } = await supabase.from('workout_items').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw new Error(error.message);
  },

  logHistory: async (log: Omit<HistoryLog, 'id'>) => {
    const user = await api.getUser();
    await api.ensureExerciseExists(log.exerciseId);
    const { error } = await supabase.from('history_logs').insert({
      user_id: user.id,
      exercise_id: log.exerciseId,
      weight: log.weight,
      reps: log.reps,
      sets: log.sets,
      date: log.date
    });
    if (error) throw new Error(error.message);
  },

  getHistory: async (): Promise<HistoryLog[]> => {
    try {
      const user = await api.getUser();
      const { data, error } = await supabase
        .from('history_logs')
        .select(`*, exercises (nome, imagem_url)`)
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (error) throw new Error(error.message);
      return (data || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        exerciseId: row.exercise_id,
        exerciseName: row.exercises?.nome || 'Desconhecido',
        weight: row.weight,
        reps: row.reps,
        sets: row.sets
      }));
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err.message);
      return [];
    }
  },

  markWorkoutComplete: async () => {
    try {
      const user = await api.getUser();
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('completion_logs').select('id').eq('user_id', user.id).eq('date', today).maybeSingle();
      if (!data) {
        await supabase.from('completion_logs').insert({ user_id: user.id, date: today });
      }
    } catch (err: any) {
      console.error('Erro ao marcar conclusão:', err.message);
    }
  },

  getCompletions: async (): Promise<CompletionLog[]> => {
    try {
      const user = await api.getUser();
      const { data, error } = await supabase.from('completion_logs').select('date').eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data || [];
    } catch (err: any) {
      console.error('Erro ao buscar conclusões:', err.message);
      return [];
    }
  }
};