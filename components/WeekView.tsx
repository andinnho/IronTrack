import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar } from 'lucide-react';
import { WeekDayWorkout } from '../types';
import { storageService } from '../services/storage';

const WeekView: React.FC = () => {
  const [schedule, setSchedule] = useState<WeekDayWorkout[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSchedule(storageService.getSchedule());
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Mapping standard JS getDay to our dayId keys if needed, 
  // but simplistic approach: check if dayId includes today's name loosely.
  const isToday = (dayId: string) => {
    const map: Record<string, string> = {
      'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
      'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday'
    };
    return map[today] === dayId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Treinos da Semana</h2>
          <p className="text-slate-400 text-sm">Organize sua rotina e mantenha o foco</p>
        </div>
        <div className="bg-brand-500/10 p-2 rounded-lg">
          <Calendar className="w-6 h-6 text-brand-500" />
        </div>
      </div>

      <div className="grid gap-4">
        {schedule.map((day) => {
          const active = isToday(day.dayId);
          return (
            <div
              key={day.dayId}
              onClick={() => navigate(`/workout/${day.dayId}`)}
              className={`relative overflow-hidden rounded-xl p-0.5 transition-all cursor-pointer group ${
                active 
                  ? 'bg-gradient-to-r from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20' 
                  : 'bg-dark-800 hover:bg-slate-700'
              }`}
            >
              <div className="bg-dark-800 h-full rounded-[10px] p-5 flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      active ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {day.dayName}
                    </span>
                    {active && <span className="text-xs text-brand-400 animate-pulse font-medium">● Hoje</span>}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                    {day.title}
                  </h3>

                  <div className="space-y-1">
                    {day.exercises.slice(0, 3).map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                        {ex.name}
                      </div>
                    ))}
                    {day.exercises.length > 3 && (
                      <div className="text-xs text-slate-500 pl-3">
                        + {day.exercises.length - 3} exercícios
                      </div>
                    )}
                    {day.exercises.length === 0 && (
                      <div className="text-xs text-slate-600 italic">Toque para adicionar exercícios</div>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                  active ? 'text-brand-500' : 'text-slate-600'
                }`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;