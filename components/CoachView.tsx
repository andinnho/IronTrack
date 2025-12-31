import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Send, Loader2, Sparkles, User, Dumbbell, Zap } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CoachView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o IronCoach. Analisei seus dados e estou pronto para otimizar seus resultados. Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar contexto do usuário para a IA
  useEffect(() => {
    const prepareContext = async () => {
      try {
        const [schedule, history] = await Promise.all([
          api.getSchedule(),
          api.getHistory()
        ]);

        const recentHistory = history.slice(-10).map(h => 
          `${h.date}: ${h.exerciseName} - ${h.sets}x${h.reps} @ ${h.weight}kg`
        ).join('\n');

        const currentSchedule = schedule.map(s => 
          `${s.dayName}: ${s.title} (${s.exercises.length} exercícios)`
        ).join('\n');

        setUserContext(`
          O usuário treina na seguinte divisão semanal:
          ${currentSchedule}

          Histórico recente de cargas:
          ${recentHistory || 'Nenhum treino registrado ainda.'}
        `);
      } catch (err) {
        console.error("Erro ao preparar contexto da IA", err);
      }
    };
    prepareContext();
  }, []);

  // Auto-scroll para o fim do chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';

      const systemInstruction = `
        Você é o "IronCoach", um treinador de elite especializado em musculação e performance.
        Seu tom é profissional, científico, motivador e direto.
        Use o seguinte contexto real do usuário para responder:
        ${userContext}
        
        Regras:
        1. Se o usuário perguntar sobre progresso, analise as cargas mencionadas no contexto.
        2. Seja encorajador mas foque na técnica e segurança.
        3. Responda em Português do Brasil.
        4. Mantenha as respostas concisas e formatadas com bullet points se necessário.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `Instrução de Sistema: ${systemInstruction}\n\nPergunta do Usuário: ${userMsg}` }] }
        ],
      });

      const aiText = response.text || 'Desculpe, tive um problema ao processar sua solicitação.';
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: 'Ops! Meu sistema de análise falhou. Verifique sua conexão.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] animate-in fade-in duration-500">
      {/* Coach Header */}
      <div className="bg-dark-800/40 backdrop-blur-xl border border-white/5 p-6 rounded-t-[32px] flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">IronCoach <span className="text-brand-400 text-xs font-bold ml-1 px-2 py-0.5 bg-brand-500/10 rounded-full">IA</span></h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online e Analisando
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
           <button onClick={() => setMessages([{ role: 'model', text: 'Chat reiniciado. Como posso ajudar?' }])} className="p-2 text-slate-500 hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-850/20 no-scrollbar border-x border-white/5"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-brand-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-dark-800/80 text-slate-200 border border-white/5 rounded-tl-none'
              }`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-dark-800/40 p-4 rounded-2xl rounded-tl-none border border-white/5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-dark-900 border border-white/5 rounded-b-[32px] shadow-2xl">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre sua evolução ou peça um ajuste..."
            className="w-full bg-dark-800/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-all ${
              input.trim() ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-3 flex justify-center gap-4">
           <button onClick={() => setInput('Como foi meu progresso de carga no último mês?')} className="text-[10px] font-bold text-slate-500 hover:text-brand-400 transition-colors uppercase tracking-wider">📊 Analisar Progresso</button>
           <button onClick={() => setInput('Sugira um ajuste para o meu treino de pernas.')} className="text-[10px] font-bold text-slate-500 hover:text-brand-400 transition-colors uppercase tracking-wider">🦵 Ajustar Pernas</button>
        </div>
      </div>
    </div>
  );
};

export default CoachView;