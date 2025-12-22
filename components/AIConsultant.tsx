
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
    { role: 'model', text: 'Olá! Sou seu Analista Fiscal especializado. 📊\n\nPosso levantar dados oficiais de arrecadação (ISS, ICMS) e detalhar fundos estaduais (FCP). O que vamos analisar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

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
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-white flex flex-col h-[750px] overflow-hidden ring-1 ring-slate-100">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">Consultor Fiscal</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">AI Online • Base 2025</span>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 transition-all duration-300 ${isLoading ? 'bg-green-50 border-green-200 shadow-inner' : ''}`}>
          <i className={`fas fa-database text-[10px] ${isLoading ? 'text-green-500 animate-pulse' : 'text-slate-400'}`}></i>
          <span className={`text-[10px] font-bold tracking-tight ${isLoading ? 'text-green-600' : 'text-slate-400'}`}>
            {isLoading ? 'SYNCING...' : 'SICONFI READY'}
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
            
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-1 shadow-sm flex-shrink-0">
                <i className="fas fa-robot text-blue-600 text-xs"></i>
              </div>
            )}

            <div className={`max-w-[85%] relative ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              {/* Message Bubble */}
              <div className={`p-5 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-xl shadow-slate-900/10' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
              
              {/* Sources Section */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pl-2">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 rounded-full">Fontes</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                   </div>
                   <div className="grid grid-cols-1 gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <a 
                        key={sIdx}
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex flex-col p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-xl transition-all hover:shadow-md group/source text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fas fa-external-link-alt text-[10px] text-blue-500"></i>
                          <span className="text-[11px] font-bold text-slate-700 group-hover/source:text-blue-700 truncate">{src.title}</span>
                        </div>
                        {src.snippet && (
                           <p className="text-[10px] text-slate-500 line-clamp-2 pl-4 border-l-2 border-slate-100 group-hover/source:border-blue-200">
                             {src.snippet}
                           </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Time/Meta (Optional Visual) */}
              <div className={`mt-1 text-[10px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'text-right pr-1' : 'text-left pl-1'}`}>
                {msg.role === 'user' ? 'Você' : 'Assistente Fiscal'}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center ml-3 mt-1 shadow-sm flex-shrink-0 overflow-hidden">
                 <i className="fas fa-user text-slate-400 text-xs"></i>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-1 shadow-sm flex-shrink-0 animate-pulse">
                <i className="fas fa-robot text-blue-600 text-xs"></i>
              </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                Analisando dados fiscais...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100">
        {messages.length < 3 && !isLoading && (
          <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide snap-x">
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap snap-start px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre ISS, ICMS, Cota-Parte..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-14 py-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-90"
          >
            {isLoading ? (
               <i className="fas fa-spinner fa-spin text-xs"></i>
            ) : (
               <i className="fas fa-paper-plane text-xs"></i>
            )}
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-300 font-medium">Powered by Gemini 3 Pro • Siconfi Grounding</p>
        </div>
      </div>
    </div>
  );
});

export default AIConsultant;
