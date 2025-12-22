
import React, { useState, useMemo } from 'react';
import { BRAZIL_STATES } from './constants';
import StateCard from './components/StateCard';
import AIConsultant from './components/AIConsultant';
import { StateData } from './types';

const App: React.FC = () => {
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('Todas');
  const [activeTab, setActiveTab] = useState<'rates' | 'analytics'>('rates');

  const filteredStates = useMemo(() => {
    return BRAZIL_STATES.filter(state => {
      const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           state.uf.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'Todas' || state.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, regionFilter]);

  const selectedState = useMemo(() => 
    BRAZIL_STATES.find(s => s.uf === selectedUF), 
  [selectedUF]);

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/20">
              <i className="fas fa-chart-pie text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Fiscal Intelligence</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Brasil • Data Explorer</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex gap-6 h-16">
              <button 
                onClick={() => setActiveTab('rates')}
                className={`text-sm font-semibold transition-all px-2 border-b-2 h-full ${activeTab === 'rates' ? 'text-blue-700 border-blue-700' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
              >
                Explorador de Alíquotas
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`text-sm font-semibold transition-all px-2 border-b-2 h-full ${activeTab === 'analytics' ? 'text-blue-700 border-blue-700' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
              >
                Análise de Arrecadação
              </button>
            </nav>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
              <i className="fas fa-database text-blue-600 text-xs"></i>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-tight">Dataset 2018-2025</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Explorer */}
          <div className="lg:col-span-7 space-y-6">
            
            {activeTab === 'rates' ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Alíquotas e Indicadores Estaduais</h2>
                    <p className="text-sm text-slate-500">Dados base para ICMS e Fundo de Combate à Pobreza (FCP).</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                    >
                      <option>Todas</option>
                      <option>Norte</option>
                      <option>Nordeste</option>
                      <option>Centro-Oeste</option>
                      <option>Sudeste</option>
                      <option>Sul</option>
                    </select>
                    <div className="relative">
                      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                      <input 
                        type="text" 
                        placeholder="Buscar por UF ou Nome..."
                        className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredStates.map(state => (
                    <StateCard 
                      key={state.uf} 
                      state={state} 
                      isSelected={selectedUF === state.uf}
                      onClick={() => setSelectedUF(state.uf)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 block">Insights Estratégicos</span>
                    <h2 className="text-2xl font-bold mb-4">Análise Fiscal Transparente</h2>
                    <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                      Utilize nossa IA para buscar arrecadação de ISS municipal, cota-parte ICMS e fundos especiais diretamente em fontes oficiais (Siconfi/CONFAZ).
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <i className="fas fa-history text-blue-400 mb-2"></i>
                        <h4 className="font-bold text-sm">Série Histórica</h4>
                        <p className="text-[10px] text-slate-500">Dados consolidados de 2018 até as projeções de 2025.</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <i className="fas fa-city text-indigo-400 mb-2"></i>
                        <h4 className="font-bold text-sm">Visão Municipal</h4>
                        <p className="text-[10px] text-slate-500">Distribuição IPM e arrecadação de serviços (ISS).</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    Indicadores de Arrecadação 2024
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 font-bold text-slate-400 uppercase tracking-tighter">Categoria</th>
                          <th className="pb-3 font-bold text-slate-400 uppercase tracking-tighter">Fonte Oficial</th>
                          <th className="pb-3 font-bold text-slate-400 uppercase tracking-tighter">Status Atual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <tr>
                          <td className="py-4 font-semibold text-slate-700">ICMS Arrecadado</td>
                          <td className="py-4 text-blue-600">CONFAZ / Boletim Arrecadação</td>
                          <td className="py-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold text-[9px]">ATUALIZADO</span></td>
                        </tr>
                        <tr>
                          <td className="py-4 font-semibold text-slate-700">ISS Municipal</td>
                          <td className="py-4 text-blue-600">SICONFI / Tesouro</td>
                          <td className="py-4"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold text-[9px]">DISPONÍVEL</span></td>
                        </tr>
                        <tr>
                          <td className="py-4 font-semibold text-slate-700">Cota-Parte IPM</td>
                          <td className="py-4 text-blue-600">Tribunais de Contas (TCE)</td>
                          <td className="py-4"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold text-[9px]">SENSÍVEL</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {selectedState && activeTab === 'rates' && (
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-blue-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-700/20 border-4 border-white">
                      {selectedState.uf}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{selectedState.name}</h2>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">Região {selectedState.region}</span>
                        {selectedState.benefitFund && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase tracking-tighter flex items-center gap-1">
                            <i className="fas fa-gift"></i> Benefício Fiscal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUF(null)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ICMS Interno</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{selectedState.internalRate}</span>
                      <span className="text-lg font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2">Vigência 2024/2025</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-100 shadow-sm">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">FCP Adicional</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-blue-700">+{selectedState.fcpRate || 0}</span>
                      <span className="text-lg font-bold text-blue-400">%</span>
                    </div>
                    <p className="text-[9px] text-blue-400 mt-2">Fundo Combate Pobreza</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ISS Sugerido</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">5.0</span>
                      <span className="text-lg font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2">Teto Municipal Geral</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-100 shadow-sm">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Cota-Parte</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-indigo-700">25</span>
                      <span className="text-lg font-bold text-indigo-400">%</span>
                    </div>
                    <p className="text-[9px] text-indigo-400 mt-2">Destinado a Municípios</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-microchip text-sm"></i>
                    </div>
                    <h4 className="font-bold text-sm">Próximos passos de análise</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Para visualizar a arrecadação específica de {selectedState.name} de 2018 a 2025 ou ver o ranking IPM de seus municípios, utilize o consultor de IA ao lado.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => alert('Utilize o Consultor IA para esta busca específica')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold transition-all border border-white/10"
                    >
                      Ver Ranking Municípios
                    </button>
                    <button 
                      onClick={() => alert('Utilize o Consultor IA para esta busca específica')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold transition-all border border-white/10"
                    >
                      Simular Benefício Fiscal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Consultant */}
          <div className="lg:col-span-5 sticky top-24 pb-8">
            <AIConsultant />
            
            <div className="mt-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-external-link-alt text-blue-600"></i> Fontes de Dados Mestre
              </h4>
              <div className="space-y-3">
                <a href="https://www.confaz.fazenda.gov.br/" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-blue-200">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600">CZ</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700 uppercase">CONFAZ - Arrecadação</div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-400 text-[10px]"></i>
                </a>
                <a href="https://siconfi.tesouro.gov.br/" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-blue-200">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600">SC</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700 uppercase">SICONFI - Finanças Municipais</div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-400 text-[10px]"></i>
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center text-white">
                <i className="fas fa-chart-pie text-[10px]"></i>
              </div>
              <span className="font-black text-slate-900 uppercase text-sm tracking-tighter">Fiscal Intelligence Pro</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Plataforma analítica para exploração de dados tributários e financeiros do setor público brasileiro. 
              Utilizamos Inteligência Artificial conectada em tempo real com repositórios oficiais.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase mb-4">Metodologia</h5>
            <ul className="space-y-2 text-[10px] text-slate-500 font-medium">
              <li>• Busca Grounding em Fontes Gov</li>
              <li>• Validação Siconfi/Tesouro</li>
              <li>• Comparativo Histórico 2018-2025</li>
              <li>• Análise de Cota-Parte IPM</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase mb-4">Legal</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Os dados apresentados são para fins de consulta rápida. Sempre valide números críticos em Diários Oficiais ou Portais de Transparência do respectivo ente federativo.
            </p>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400 pb-8 uppercase tracking-widest font-bold">
          &copy; 2025 Fiscal Intelligence Dashboard • Empowered by Gemini 3 Pro
        </div>
      </footer>
    </div>
  );
};

export default App;
