import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../services/api';
import { ExerciseDefinition, HistoryLog, CompletionLog } from '../types';
import { Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ProgressView: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [allExercises, setAllExercises] = useState<ExerciseDefinition[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [completions, setCompletions] = useState<CompletionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Generation State
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0, label: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ex, hist, comp] = await Promise.all([
        api.getAllExercises(),
        api.getHistory(),
        api.getCompletions()
      ]);
      setAllExercises(ex);
      setHistory(hist);
      setCompletions(comp);
      
      if (ex.length > 0 && !selectedExerciseId) {
           const exWithHistory = ex.find(e => hist.some(h => h.exerciseId === e.id));
           setSelectedExerciseId(exWithHistory?.id || ex[0].id);
      }
    } catch (e) {
      console.error("Error loading progress data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateImages = async () => {
    if (!confirm('Deseja iniciar a geração de imagens para todos os exercícios? Isso pode levar alguns minutos.')) return;
    
    setGenerating(true);
    try {
      const rawExercises = await api.getRawExercises();
      setGenProgress({ current: 0, total: rawExercises.length, label: 'Iniciando Laboratório de IA...' });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      for (let i = 0; i < rawExercises.length; i++) {
        const ex = rawExercises[i];
        setGenProgress(prev => ({ ...prev, current: i + 1, label: `Gerando imagem para: ${ex.nome}` }));

        try {
          const prompt = `${ex.imagem_prompt || `Realistic fitness illustration of ${ex.nome}`}. High quality, cinematic lighting, 3D render style, professional fitness photography look.`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: prompt }],
            },
            config: {
              imageConfig: { aspectRatio: "1:1" }
            }
          });

          let base64Image = '';
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              base64Image = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }

          if (base64Image) {
            await api.updateExerciseImage(ex.id, base64Image);
          }
        } catch (exError) {
          console.error(`Falha ao gerar para ${ex.nome}:`, exError);
          // Continue with next exercise even if one fails
        }
      }

      setGenProgress(prev => ({ ...prev, label: 'Concluído com sucesso!' }));
      setTimeout(() => setGenerating(false), 3000);
      loadData(); // Refresh UI images
    } catch (err: any) {
      alert("Erro no processo de geração: " + err.message);
      setGenerating(false);
    }
  };

  // Helper to get exercise data
  const exerciseData = useMemo(() => {
    if (!selectedExerciseId) return [];
    const logs = history.filter(h => h.exerciseId === selectedExerciseId);
    
    const grouped = logs.reduce((acc, curr) => {
      const date = new Date(curr.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!acc[date] || acc[date] < curr.weight) {
        acc[date] = curr.weight;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, weight]) => ({ date, weight }));
  }, [selectedExerciseId, history]);

  const attendanceData = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    for(let i=3; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i * 7));
      const weekLabel = `Semana ${4-i}`;
      weeks[weekLabel] = 0;
    }

    completions.forEach(log => {
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

  if (loading) {
     return (
        <div className="flex justify-center pt-20">
           <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
     );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Seu Progresso</h2>
          <p className="text-slate-400 text-sm">Acompanhe sua evolução e consistência</p>
        </div>
      </div>

      {/* IA Generator Section */}
      <div className="bg-dark-800 p-6 rounded-2xl border border-brand-500/20 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-brand-500" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Laboratório de IA
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            Gere imagens realistas para todos os seus exercícios usando Inteligência Artificial.
          </p>

          {generating ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end text-xs font-medium uppercase tracking-wider mb-1">
                <span className="text-brand-400">{genProgress.label}</span>
                <span className="text-slate-500">{genProgress.current} / {genProgress.total}</span>
              </div>
              <div className="w-full bg-dark-900 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-brand-500 h-full transition-all duration-500" 
                  style={{ width: `${(genProgress.current / genProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Gerando imagens de alta fidelidade...
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerateImages}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Imagens com IA
            </button>
          )}
        </div>
      </div>

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