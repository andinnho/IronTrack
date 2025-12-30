import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Loader2, Dumbbell, Zap, Circle } from 'lucide-react';
import { WeekDayWorkout } from '../types';
import { api } from '../services/api';

const WeekView: React.FC = () => {
  const [schedule, setSchedule] = useState<WeekDayWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSchedule();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to load schedule", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  const isToday = (dayId: string) => {
    const map: Record<string, string> = {
      'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
      'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday'
    };
    return map[todayStr] === dayId;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Sincronizando sua rotina...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Treinos da Semana
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Mantenha a disciplina. Um dia de cada vez.
          </p>
        </div>
        <div className="hidden sm:flex bg-slate-800/50 backdrop-blur-sm border border-white/5 p-3 rounded-2xl shadow-xl">
          <Calendar className="w-5 h-5 text-brand-500" />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid gap-5">
        {schedule.map((day) => {
          const active = isToday(day.dayId);
          const hasExercises = day.exercises.length > 0;
          
          return (
            <div
              key={day.dayId}
              onClick={() => navigate(`/workout/${day.dayId}`)}
              className={`group relative flex flex-col rounded-[24px] transition-all duration-300 cursor-pointer active:scale-[0.98] ${
                active 
                  ? 'bg-slate-800/80 ring-2 ring-brand-500/40 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)]' 
                  : 'bg-slate-800/30 hover:bg-slate-800/50 border border-white/5 shadow-lg'
              }`}
            >
              {/* Active Highlight Glow */}
              {active && (
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-indigo-500/20 rounded-[26px] blur-xl -z-10 opacity-50"></div>
              )}

              <div className="p-6 flex items-center gap-5">
                {/* Day Marker / Icon */}
                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl shrink-0 transition-colors duration-300 ${
                  active ? 'bg-brand-500 text-white' : 'bg-slate-900 text-slate-500'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-tighter leading-none mb-1 opacity-80">
                    {day.dayName.substring(0, 3)}
                  </span>
                  <Dumbbell className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 opacity-40'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {active && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-brand-400" />
                        Hoje
                      </span>
                    )}
                    {!hasExercises && !active && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        Vazio
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-bold tracking-tight transition-colors truncate ${
                    active ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {day.title}
                  </h3>

                  {/* Exercise Preview Pill List */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {day.exercises.slice(0, 2).map((ex, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                        <Circle className="w-1.5 h-1.5 fill-slate-500 text-slate-500" />
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[80px]">
                          {ex.name}
                        </span>
                      </div>
                    ))}
                    {day.exercises.length > 2 && (
                      <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] text-brand-400 font-bold">
                        +{day.exercises.length - 2}
                      </div>
                    )}
                    {day.exercises.length === 0 && (
                      <p className="text-xs text-slate-500 font-medium italic group-hover:text-slate-400 transition-colors">
                        Planeje seu treino agora
                      </p>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className={`p-2 rounded-full transition-all duration-300 ${
                  active ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-600 group-hover:bg-brand-500/10 group-hover:text-brand-400'
                }`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Progress Bar (Bottom Line Decoration) */}
              {active && hasExercises && (
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full opacity-60"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Motivation */}
      <div className="text-center py-6 px-4">
        <p className="text-slate-600 text-xs font-medium uppercase tracking-[0.2em]">
          Feito para quem não aceita desculpas
        </p>
      </div>
    </div>
  );
};

export default WeekView;