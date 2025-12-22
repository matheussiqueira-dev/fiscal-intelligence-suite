
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { askGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
  "ISS de São Paulo (Capital) 2018-2025",
  "Arrecadação ICMS de SP (2024 vs 2023)",
  "Repasse de cota-parte ICMS em Campinas/SP",
  "ISS de Curitiba vs Porto Alegre em 2024",
  "Alíquota FCP de São Paulo 2025"
];

interface AIConsultantProps {}

export interface AIConsultantHandle {
  triggerSearch: (prompt: string) => void;
}

const AIConsultant = forwardRef<AIConsultantHandle, AIConsultantProps>((props, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Analista Fiscal especializado em finanças públicas brasileiras pronto. Posso consultar arrecadação histórica (2018-2025) de ICMS e ISS, cota-parte municipal e detalhes técnicos de fundos especiais. Como posso ajudar na sua pesquisa orçamentária?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useImperativeHandle(ref, () => ({
    triggerSearch: (prompt: string) => {
      handleSend(prompt);
    }
  }));

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await askGemini(text, messages);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-[700px] overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <i className="fas fa-search-dollar text-white"></i>
          </div>
          <div>
            <h2 className="font-bold leading-none">Consultor de Arrecadação</h2>
            <span className="text-[10px] text-blue-200 font-medium uppercase tracking-wider">Histórico 2018-2025 • Municipal</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30 transition-all duration-500 ${isLoading ? 'animate-pulse scale-105 shadow-lg shadow-green-500/20' : ''}`}>
          <i className={`fas fa-satellite-dish text-[10px] text-green-300 ${isLoading ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}></i>
          <span className="text-[10px] font-bold text-green-300">GROUNDING ON</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto prose prose-sm max-w-none">
                {msg.text}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-1.5 tracking-widest">
                    <i className="fas fa-file-alt text-blue-500"></i> Fontes e Evidências Oficiais
                  </p>
                  <div className="space-y-3">
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} className="group">
                        <a 
                          href={src.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors mb-1"
                        >
                          <i className="fas fa-external-link-alt text-[9px]"></i>
                          <span className="underline decoration-blue-200 group-hover:decoration-blue-700">{src.title}</span>
                        </a>
                        {src.snippet && (
                          <div className="ml-4 p-2 bg-slate-100/50 rounded-lg border-l-2 border-slate-200">
                            <p className="text-[10px] text-slate-500 italic leading-snug">
                              "{src.snippet.length > 200 ? src.snippet.substring(0, 197) + '...' : src.snippet}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 rounded-tl-none shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-slate-500 font-medium italic">Cruzando dados de arrecadação (2018-2025)...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t space-y-3">
        {messages.length < 3 && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleSend(s)}
                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-all border border-slate-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Arrecadação ISS de Salvador 2024"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white w-12 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
          >
            <i className="fas fa-arrow-up"></i>
          </button>
        </form>
      </div>
    </div>
  );
});

export default AIConsultant;
