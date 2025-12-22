
import React, { useState, useMemo, useRef } from 'react';
import { BRAZIL_STATES } from './constants';
import StateCard from './components/StateCard';
import AIConsultant, { AIConsultantHandle } from './components/AIConsultant';
import { StateData } from './types';

const App: React.FC = () => {
  const [selectedUF, setSelectedUF] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('Todas');
  const [activeTab, setActiveTab] = useState<'rates' | 'analytics'>('rates');
  
  // Municipal search state
  const [muniName, setMuniName] = useState('');
  const [muniUF, setMuniUF] = useState('');

  const chatRef = useRef<AIConsultantHandle>(null);

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

  const handleMunicipalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muniName || !muniUF) return;
    
    const prompt = `Qual a arrecadação de ISS do município de ${muniName} - ${muniUF} de 2018 a 2025? Por favor, valide em fontes oficiais como o Siconfi e apresente em uma tabela comparativa anual. Verifique também o repasse de cota-parte de ICMS do estado para este município.`;
    
    if (chatRef.current) {
      chatRef.current.triggerSearch(prompt);
      document.getElementById('chat-consultant')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const triggerStateAnalysis = (state: StateData) => {
    const prompt = `Analise a arrecadação de ICMS de ${state.name} (${state.uf}) de 2018 a 2025. Inclua detalhes obrigatórios sobre o Fundo de Combate à Pobreza (FCP/FECOP) e informe se existe Fundo de Compensação por Benefícios Fiscais ou fundos similares de estabilização.`;
    if (chatRef.current) {
      chatRef.current.triggerSearch(prompt);
      document.getElementById('chat-consultant')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
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
                    <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2 block">Painel de Arrecadação Histórica</span>
                    <h2 className="text-2xl font-bold mb-4">Série Temporal 2018-2025</h2>
                    <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                      Cruzamento de dados entre ICMS estadual e ISS municipal com foco em transparência e validação oficial (Siconfi/STN).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <i className="fas fa-city text-blue-400 mb-2"></i>
                        <h4 className="font-bold text-sm">ISS Municipal</h4>
                        <p className="text-[10px] text-slate-500">Arrecadação direta de serviços para 5.570 cidades.</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <i className="fas fa-landmark text-indigo-400 mb-2"></i>
                        <h4 className="font-bold text-sm">Cota-Parte</h4>
                        <p className="text-[10px] text-slate-500">Repasses de ICMS do estado para o município.</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <i className="fas fa-shield-alt text-green-400 mb-2"></i>
                        <h4 className="font-bold text-sm">Validado Gov</h4>
                        <p className="text-[10px] text-slate-500">Dados extraídos de fontes oficiais Siconfi.</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                    <i className="fas fa-search-location text-blue-600"></i> Consultar Arrecadação por Município
                  </h3>
                  <form onSubmit={handleMunicipalSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Município</label>
                      <input 
                        type="text" 
                        value={muniName}
                        onChange={(e) => setMuniName(e.target.value)}
                        placeholder="Ex: Campinas"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Estado (UF)</label>
                      <select 
                        value={muniUF}
                        onChange={(e) => setMuniUF(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {BRAZIL_STATES.map(s => <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button 
                        type="submit"
                        className="w-full bg-blue-700 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-800 transition-all shadow-md shadow-blue-700/10 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-search"></i> Pesquisar Arrecadação
                      </button>
                    </div>
                  </form>
                  <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
                    * A pesquisa utilizará Inteligência Artificial com Grounding em tempo real no Siconfi e Portais Municipais para gerar a série histórica 2018-2025.
                  </p>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monitoramento</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">2025</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2">Série Histórica Ativa</p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl border border-indigo-100 shadow-sm">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Cota-Parte</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-indigo-700">25</span>
                      <span className="text-lg font-bold text-indigo-400">%</span>
                    </div>
                    <p className="text-[9px] text-indigo-400 mt-2">Média Repasse</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-search-dollar text-sm"></i>
                    </div>
                    <h4 className="font-bold text-sm">Consultar Arrecadação Detalhada</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Obtenha uma análise completa de arrecadação, incluindo o <strong>FCP</strong> e <strong>Fundos de Compensação</strong> para {selectedState.name}.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => triggerStateAnalysis(selectedState)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold transition-all border border-white/10"
                    >
                      Análise ICMS + FCP {selectedState.uf}
                    </button>
                    <button 
                       onClick={() => {
                        if(chatRef.current) chatRef.current.triggerSearch(`Quais são os principais fundos de compensação e incentivos fiscais vigentes em ${selectedState.name} (${selectedState.uf})?`);
                        document.getElementById('chat-consultant')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold transition-all border border-white/10"
                    >
                      Incentivos & Compensação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div id="chat-consultant" className="lg:col-span-5 sticky top-24 pb-8">
            <AIConsultant ref={chatRef} />
            
            <div className="mt-6 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-external-link-alt text-blue-600"></i> Repositórios Oficiais
              </h4>
              <div className="space-y-3">
                <a href="https://siconfi.tesouro.gov.br/" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-blue-200">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600">STN</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700 uppercase">SICONFI - Tesouro Nacional</div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-400 text-[10px]"></i>
                </a>
                <a href="https://www.confaz.fazenda.gov.br/" target="_blank" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-blue-200">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600">CZ</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700 uppercase">CONFAZ - Arrecadação ICMS</div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-400 text-[10px]"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-center md:text-left">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center text-white">
                <i className="fas fa-chart-pie text-[10px]"></i>
              </div>
              <span className="font-black text-slate-900 uppercase text-sm tracking-tighter">Fiscal Intelligence Pro</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto md:mx-0">
              Monitoramento fiscal avançado 2018-2025. Dados de ISS, ICMS e Fundos Sociais validados via Inteligência Artificial.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase mb-4">Escopo do Dataset</h5>
            <ul className="space-y-2 text-[10px] text-slate-500 font-medium">
              <li>• ICMS Estaduais e FCP</li>
              <li>• ISS Municipal (Siconfi)</li>
              <li>• Fundos de Compensação</li>
              <li>• Cota-Parte ICMS</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase mb-4">Metodologia</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Grounding em tempo real conectando as APIs de busca aos repositórios de transparência fiscal do Brasil.
            </p>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400 pb-8 uppercase tracking-widest font-bold">
          &copy; 2025 Fiscal Intelligence Dashboard • Gemini 3 Pro Data Engine
        </div>
      </footer>
    </div>
  );
};

export default App;
