import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Loader2, Dumbbell, Zap, Circle, CheckCircle2 } from 'lucide-react';
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
        <p className="text-slate-500 font-medium animate-pulse">Preparando sua semana...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-500">
             <Calendar className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-widest opacity-80">Cronograma Fitness</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Treinos da Semana
          </h2>
          <p className="text-slate-400 text-base max-w-md leading-relaxed">
            Sua jornada é construída na constância. Gerencie seus treinos e supere seus limites diários.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-dark-800/40 backdrop-blur-xl border border-white/5 p-4 rounded-3xl shadow-2xl">
           <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-400" />
           </div>
           <div>
              <p className="text-white font-bold text-sm">Foco Total</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Meta: Progressive Overload</p>
           </div>
        </div>
      </div>

      {/* Grid of Day Cards */}
      <div className="grid gap-6">
        {schedule.map((day) => {
          const active = isToday(day.dayId);
          const hasExercises = day.exercises.length > 0;
          
          return (
            <div
              key={day.dayId}
              onClick={() => navigate(`/workout/${day.dayId}`)}
              className={`group relative flex flex-col rounded-[32px] transition-all duration-500 cursor-pointer overflow-hidden ${
                active 
                  ? 'bg-gradient-to-br from-dark-800 to-slate-900 border-2 border-brand-500/30 shadow-[0_30px_60px_-15px_rgba(14,165,233,0.15)] scale-[1.02]' 
                  : 'bg-dark-800/40 hover:bg-dark-800/60 border border-white/5 shadow-xl hover:-translate-y-1'
              }`}
            >
              {/* Highlight Glow for active card */}
              {active && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
              )}

              <div className="p-8 flex items-center gap-6">
                {/* Visual Identity for the Day */}
                <div className="relative shrink-0">
                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-3xl transition-all duration-500 ${
                    active 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 rotate-3 group-hover:rotate-0' 
                      : 'bg-slate-900/80 text-slate-500 group-hover:text-brand-400'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">
                      {day.dayName.substring(0, 3)}
                    </span>
                    <Dumbbell className={`w-6 h-6 ${active ? 'text-white' : 'text-slate-600 opacity-40'}`} />
                  </div>
                  {active && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                      active ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-900/50 text-slate-500 group-hover:bg-brand-500/10 group-hover:text-brand-500'
                    }`}>
                      {day.dayName}
                    </span>
                    {active && (
                      <span className="flex items-center gap-1 text-brand-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                        <Circle className="w-1.5 h-1.5 fill-brand-400" />
                        Dia Atual
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-black tracking-tight transition-colors truncate ${
                    active ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {day.title}
                  </h3>

                  {/* Summary Footer of the Card */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      {hasExercises ? (
                        <div className="flex -space-x-2">
                          {day.exercises.slice(0, 3).map((ex, i) => (
                            <div 
                              key={i} 
                              className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden"
                            >
                               <img src={ex.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                            </div>
                          ))}
                          {day.exercises.length > 3 && (
                            <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-brand-500 flex items-center justify-center text-[9px] font-black text-white">
                              +{day.exercises.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                          Toque para adicionar exercícios
                        </span>
                      )}
                      
                      {hasExercises && (
                         <p className="text-[11px] text-slate-500 font-medium ml-2">
                           {day.exercises.length} movimentos planejados
                         </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interaction Indicator */}
                <div className={`hidden sm:flex p-3 rounded-2xl transition-all duration-500 ${
                  active 
                    ? 'bg-brand-500 text-white translate-x-1' 
                    : 'bg-slate-900 text-slate-700 group-hover:bg-brand-500/20 group-hover:text-brand-400 group-hover:translate-x-1'
                }`}>
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* Decorative progress bar for active card */}
              {active && (
                <div className="h-1 w-full bg-slate-800/50 mt-auto">
                   <div className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-500 w-full opacity-60"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Footer */}
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
           <Zap className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] text-center max-w-[200px] leading-loose">
          Disciplina supera talento todos os dias
        </p>
      </div>
    </div>
  );
};

export default WeekView;