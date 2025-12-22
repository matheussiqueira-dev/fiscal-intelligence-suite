
import React from 'react';
import { StateData } from '../types';

interface StateCardProps {
  state: StateData;
  isSelected: boolean;
  onClick: () => void;
}

const StateCard: React.FC<StateCardProps> = ({ state, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
        isSelected 
          ? 'bg-gradient-to-br from-blue-50 to-white border-blue-500 shadow-lg shadow-blue-500/10 translate-y-[-2px]' 
          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-tight ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors'}`}>
            {state.uf}
          </span>
          {state.benefitFund && (
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" title="Benefício Fiscal Ativo"></div>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-full">{state.region}</span>
      </div>
      
      <h3 className={`font-bold text-sm mb-4 truncate transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
        {state.name}
      </h3>
      
      <div className="flex items-end justify-between border-t border-slate-100 pt-3 mt-auto">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ICMS Interno</p>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-2xl font-black ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
              {state.internalRate}
            </span>
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>
        
        {state.fcpRate ? (
          <div className="text-right">
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">FCP</p>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">+{state.fcpRate}%</span>
          </div>
        ) : (
          <div className="text-right opacity-30">
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">FCP</p>
             <span className="text-xs font-bold text-slate-400">-</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateCard;
