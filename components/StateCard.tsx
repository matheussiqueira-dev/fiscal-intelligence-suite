
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
      className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
        isSelected 
          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
          : 'bg-white border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase">
          {state.uf}
        </span>
        <span className="text-xs text-slate-400">{state.region}</span>
      </div>
      <h3 className="font-semibold text-slate-800 truncate">{state.name}</h3>
      <div className="mt-3 flex items-baseline">
        <span className="text-2xl font-bold text-slate-900">{state.internalRate}%</span>
        <span className="ml-1 text-xs text-slate-500 font-medium">Alíquota Interna</span>
      </div>
    </div>
  );
};

export default StateCard;
