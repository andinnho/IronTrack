import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Dumbbell, BarChart, Loader2 } from 'lucide-react';
import { ExerciseDefinition, MuscleGroup, WorkoutExercise } from '../types';
import { MUSCLE_GROUPS } from '../constants';
import { api } from '../services/api';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Partial<WorkoutExercise>) => void;
  initialData?: WorkoutExercise;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [step, setStep] = useState<'select' | 'details'>(initialData ? 'details' : 'select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [allExercises, setAllExercises] = useState<ExerciseDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedDef, setSelectedDef] = useState<ExerciseDefinition | null>(
    initialData ? { id: initialData.exerciseId, name: initialData.name, target: initialData.target, imageUrl: initialData.imageUrl } as any : null
  );

  const [weight, setWeight] = useState(initialData?.weight || 0);
  const [sets, setSets] = useState(initialData?.sets || 3);
  const [reps, setReps] = useState(initialData?.reps || 10);
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getAllExercises().then(data => {
        setAllExercises(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen]);

  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.target === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleSelectExercise = (ex: ExerciseDefinition) => {
    setSelectedDef(ex);
    setStep('details');
  };

  const handleSave = () => {
    if (!selectedDef) return;

    onSave({
      exerciseId: selectedDef.id,
      name: selectedDef.name,
      target: selectedDef.target,
      imageUrl: selectedDef.imageUrl,
      weight,
      sets,
      reps,
      notes,
    });
    
    setStep('select');
    setSelectedDef(null);
    setWeight(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-dark-900">
          <h2 className="text-lg font-bold text-white">
            {step === 'select' ? 'Adicionar Exercício' : 'Configurar Série'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {step === 'select' ? (
            <div className="space-y-4">
              <div className="sticky top-0 bg-dark-800 pb-2 space-y-3 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar exercício..."
                    className="w-full bg-dark-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    onClick={() => setSelectedMuscle('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedMuscle === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Todos
                  </button>
                  {MUSCLE_GROUPS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedMuscle(g.id as MuscleGroup)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedMuscle === g.id ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                   <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                   <p>Carregando exercícios...</p>
                </div>
              ) : filteredExercises.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {filteredExercises.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex)}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-transparent hover:border-brand-500/50 transition-all text-left group"
                    >
                      <img src={ex.imageUrl} alt={ex.name} className="w-12 h-12 rounded-lg object-cover bg-slate-700" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-200 group-hover:text-brand-400">{ex.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                              {MUSCLE_GROUPS.find(m => m.id === ex.target)?.label}
                           </span>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-500 group-hover:text-brand-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <p>Nenhum exercício encontrado.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <img src={selectedDef?.imageUrl} alt={selectedDef?.name} className="w-16 h-16 rounded-lg object-cover bg-slate-700" />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDef?.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-brand-400 font-medium">
                        {MUSCLE_GROUPS.find(m => m.id === selectedDef?.target)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider text-center block">Carga (kg)</label>
                  <input
                    type="number"
                    className="w-full bg-dark-900 border border-slate-700 rounded-lg p-3 text-center text-xl font-mono text-white focus:border-brand-500 outline-none"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider text-center block">Séries</label>
                  <input
                    type="number"
                    className="w-full bg-dark-900 border border-slate-700 rounded-lg p-3 text-center text-xl font-mono text-white focus:border-brand-500 outline-none"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase font-bold tracking-wider text-center block">Reps</label>
                  <input
                    type="number"
                    className="w-full bg-dark-900 border border-slate-700 rounded-lg p-3 text-center text-xl font-mono text-white focus:border-brand-500 outline-none"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Observações de Progresso</label>
                <textarea
                  className="w-full bg-dark-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-brand-500 outline-none resize-none h-24"
                  placeholder="Ex: Tentar aumentar carga próxima semana..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98]"
              >
                Salvar Exercício
              </button>
              
              <button onClick={() => setStep('select')} className="w-full py-2 text-slate-400 text-sm hover:text-white">
                Voltar para seleção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;