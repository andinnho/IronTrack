import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, MoreVertical } from 'lucide-react';
import { WeekDayWorkout, WorkoutExercise } from '../types';
import { storageService } from '../services/storage';
import ExerciseModal from './ExerciseModal';
import { MUSCLE_GROUPS } from '../constants';

const WorkoutDetail: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<WeekDayWorkout[]>([]);
  const [currentDay, setCurrentDay] = useState<WeekDayWorkout | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | undefined>(undefined);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadData();
  }, [dayId]);

  const loadData = () => {
    const data = storageService.getSchedule();
    setSchedule(data);
    const day = data.find(d => d.dayId === dayId);
    if (day) {
      setCurrentDay(day);
      setNewTitle(day.title);
    }
  };

  const handleUpdateTitle = () => {
    if (dayId && newTitle.trim()) {
      storageService.updateDayWorkout(dayId, newTitle);
      setIsEditingTitle(false);
      loadData();
    }
  };

  const handleSaveExercise = (exData: Partial<WorkoutExercise>) => {
    if (!currentDay) return;

    const newSchedule = [...schedule];
    const dayIndex = newSchedule.findIndex(d => d.dayId === currentDay.dayId);
    if (dayIndex === -1) return;

    if (editingExercise) {
      // Edit Mode
      const exercises = [...newSchedule[dayIndex].exercises];
      const exIndex = exercises.findIndex(e => e.id === editingExercise.id);
      if (exIndex !== -1) {
        exercises[exIndex] = { ...exercises[exIndex], ...exData } as WorkoutExercise;
        // Log history implicitly if weight changed? For now, manual tracking via "Finish" is better.
      }
      newSchedule[dayIndex].exercises = exercises;
    } else {
      // Add Mode
      const newExercise: WorkoutExercise = {
        id: Date.now().toString(),
        exerciseId: exData.exerciseId!,
        name: exData.name!,
        target: exData.target!,
        imageUrl: exData.imageUrl!,
        sets: exData.sets || 3,
        reps: exData.reps || 10,
        weight: exData.weight || 0,
        notes: exData.notes
      };
      newSchedule[dayIndex].exercises.push(newExercise);
    }

    storageService.saveSchedule(newSchedule);
    setSchedule(newSchedule);
    setCurrentDay(newSchedule[dayIndex]);
    setEditingExercise(undefined);
  };

  const handleDeleteExercise = (id: string) => {
    if (!currentDay) return;
    const newSchedule = [...schedule];
    const dayIndex = newSchedule.findIndex(d => d.dayId === currentDay.dayId);
    newSchedule[dayIndex].exercises = newSchedule[dayIndex].exercises.filter(e => e.id !== id);
    storageService.saveSchedule(newSchedule);
    setSchedule(newSchedule);
    setCurrentDay(newSchedule[dayIndex]);
  };

  const handleFinishWorkout = () => {
    if (!currentDay) return;
    
    // 1. Mark attendance
    storageService.markWorkoutComplete();

    // 2. Log history for all exercises
    currentDay.exercises.forEach(ex => {
      storageService.logSet({
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        date: new Date().toISOString(),
        weight: ex.weight,
        reps: ex.reps,
        sets: ex.sets
      });
    });

    alert('Treino concluído! Histórico salvo.');
    navigate('/');
  };

  if (!currentDay) return <div className="text-center p-8">Carregando...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" /> Voltar
        </button>
      </div>

      <div className="bg-gradient-to-br from-brand-900/50 to-dark-800 rounded-2xl p-6 border border-brand-500/20 shadow-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-1">{currentDay.dayName}</h2>
            {isEditingTitle ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-dark-900 border border-brand-500 rounded px-2 py-1 text-xl font-bold text-white outline-none w-full"
                  autoFocus
                />
                <button onClick={handleUpdateTitle} className="bg-brand-600 px-3 rounded text-sm font-bold">OK</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-3xl font-bold text-white">{currentDay.title}</h1>
                <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
            <p className="text-slate-400 mt-2 text-sm">{currentDay.exercises.length} exercícios planejados</p>
          </div>
          <button 
            onClick={handleFinishWorkout}
            className="flex flex-col items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Concluir</span>
          </button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {currentDay.exercises.map((ex) => (
          <div key={ex.id} className="bg-dark-800 rounded-xl p-4 border border-white/5 hover:border-brand-500/30 transition-all flex gap-4 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-dark-800/80 backdrop-blur rounded-bl-xl">
              <button 
                onClick={() => { setEditingExercise(ex); setIsModalOpen(true); }}
                className="p-1.5 hover:bg-brand-500/20 hover:text-brand-400 rounded-lg text-slate-400 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteExercise(ex.id)}
                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <img src={ex.imageUrl} alt={ex.name} className="w-20 h-20 rounded-lg object-cover bg-slate-700 shrink-0" />
            
            <div className="flex-1 pr-16 md:pr-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 leading-tight">{ex.name}</h3>
                  <span className="text-xs text-brand-500 font-medium capitalize block mt-1">
                    {MUSCLE_GROUPS.find(m => m.id === ex.target)?.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-dark-900 rounded-lg p-2 text-center border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Carga</span>
                  <span className="block text-lg font-mono text-white">{ex.weight}<span className="text-xs text-slate-500 ml-0.5">kg</span></span>
                </div>
                <div className="bg-dark-900 rounded-lg p-2 text-center border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Séries</span>
                  <span className="block text-lg font-mono text-white">{ex.sets}</span>
                </div>
                <div className="bg-dark-900 rounded-lg p-2 text-center border border-white/5">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Reps</span>
                  <span className="block text-lg font-mono text-white">{ex.reps}</span>
                </div>
              </div>
              
              {ex.notes && (
                <div className="mt-3 text-xs text-slate-400 italic border-l-2 border-slate-600 pl-2">
                  "{ex.notes}"
                </div>
              )}
            </div>
          </div>
        ))}

        <button 
          onClick={() => { setEditingExercise(undefined); setIsModalOpen(true); }}
          className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 font-medium hover:border-brand-500 hover:text-brand-500 hover:bg-brand-500/5 transition-all flex items-center justify-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          Adicionar Exercício
        </button>
      </div>

      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExercise}
        initialData={editingExercise}
      />
    </div>
  );
};

export default WorkoutDetail;