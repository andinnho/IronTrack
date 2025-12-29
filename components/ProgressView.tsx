import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { storageService } from '../services/storage';
import { ExerciseDefinition } from '../types';

const ProgressView: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const allExercises = storageService.getAllExercises();
  const history = storageService.getHistory();
  const completions = storageService.getCompletions();

  // Helper to get exercise data
  const exerciseData = useMemo(() => {
    if (!selectedExerciseId) return [];
    const logs = history.filter(h => h.exerciseId === selectedExerciseId);
    
    // Group by date, take max weight for that day
    const grouped = logs.reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date] || acc[date] < curr.weight) {
        acc[date] = curr.weight;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, weight]) => ({ date, weight }));
  }, [selectedExerciseId, history]);

  // Attendance Data (Last 4 weeks)
  const attendanceData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 4 weeks
    for(let i=3; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i * 7));
      const weekLabel = `Semana ${4-i}`;
      weeks[weekLabel] = 0;
    }

    // Really naive week bucketing for demo purposes
    // In production, use date-fns `getWeek`
    completions.forEach(log => {
      // Just mock distributing them for visual effect if date logic is complex without library
      // Let's count total recent workouts
      const date = new Date(log.date);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if(diffDays <= 7) weeks['Semana 4'] = (weeks['Semana 4'] || 0) + 1;
      else if(diffDays <= 14) weeks['Semana 3'] = (weeks['Semana 3'] || 0) + 1;
      else if(diffDays <= 21) weeks['Semana 2'] = (weeks['Semana 2'] || 0) + 1;
      else if(diffDays <= 28) weeks['Semana 1'] = (weeks['Semana 1'] || 0) + 1;
    });

    return Object.entries(weeks).map(([name, count]) => ({ name, count }));
  }, [completions]);

  // Set default exercise if none selected
  if (!selectedExerciseId && allExercises.length > 0) {
     // Try to find one with history first
     const exWithHistory = allExercises.find(ex => history.some(h => h.exerciseId === ex.id));
     setSelectedExerciseId(exWithHistory?.id || allExercises[0].id);
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Seu Progresso</h2>
        <p className="text-slate-400 text-sm">Acompanhe sua evolução e consistência</p>
      </div>

      {/* Consistency Chart */}
      <div className="bg-dark-800 p-6 rounded-2xl border border-white/5 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
          Assiduidade (Últimos 30 dias)
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Load Progression Chart */}
      <div className="bg-dark-800 p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Evolução de Carga
          </h3>
          <select 
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
          >
            {allExercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        {exerciseData.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="kg" dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
            <p>Sem dados registrados para este exercício.</p>
            <p className="text-xs mt-2">Conclua treinos para ver o gráfico.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressView;