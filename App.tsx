import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import AIConsultant, { AIConsultantHandle } from './components/AIConsultant';
import KpiBoard from './components/KpiBoard';
import QueryHistory from './components/QueryHistory';
import ScenarioSimulator from './components/ScenarioSimulator';
import StateCard from './components/StateCard';
import StateComparator from './components/StateComparator';
import { BRAZIL_STATES, REGIONS, YEAR_RANGE } from './constants';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Region, UiSettings } from './types';
import { formatPercentage } from './utils/formatters';
import {
  buildComparisonPrompt,
  buildCompensationFundPrompt,
  buildMunicipalityPrompt,
  buildStatePrompt,
} from './utils/prompts';

type RegionFilter = 'Todas' | Region;

const HISTORY_LIMIT = 8;

const DEFAULT_UI_SETTINGS: UiSettings = {
  highContrast: false,
  compactMode: false,
  reducedMotion: false,
};

const App = () => {
  const chatRef = useRef<AIConsultantHandle>(null);

  const [selectedUF, setSelectedUF] = useState<string>(BRAZIL_STATES[0]?.uf || 'SP');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('Todas');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [muniName, setMuniName] = useState('');
  const [muniUF, setMuniUF] = useState('');

  const [favoriteUFs, setFavoriteUFs] = useLocalStorage<string[]>('fis.favorite-ufs', []);
  const [queryHistory, setQueryHistory] = useLocalStorage<string[]>('fis.query-history', []);
  const [uiSettings, setUiSettings] = useLocalStorage<UiSettings>('fis.ui-settings', DEFAULT_UI_SETTINGS);

  const debouncedSearch = useDebouncedValue(searchTerm, 180);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-high-contrast', uiSettings.highContrast);
    root.classList.toggle('theme-compact', uiSettings.compactMode);
    root.classList.toggle('theme-reduced-motion', uiSettings.reducedMotion);
  }, [uiSettings.compactMode, uiSettings.highContrast, uiSettings.reducedMotion]);

  const visibleStates = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return BRAZIL_STATES.filter((state) => {
      const matchesSearch =
        !normalizedSearch ||
        state.name.toLowerCase().includes(normalizedSearch) ||
        state.uf.toLowerCase().includes(normalizedSearch);

      const matchesRegion = regionFilter === 'Todas' || state.region === regionFilter;
      const matchesFavorite = !favoritesOnly || favoriteUFs.includes(state.uf);

      return matchesSearch && matchesRegion && matchesFavorite;
    });
  }, [debouncedSearch, favoriteUFs, favoritesOnly, regionFilter]);

  const selectedState = useMemo(() => {
    return BRAZIL_STATES.find((state) => state.uf === selectedUF) || visibleStates[0];
  }, [selectedUF, visibleStates]);

  const pushHistory = (prompt: string) => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) return;

    setQueryHistory((prev) => {
      const next = [normalizedPrompt, ...prev.filter((item) => item !== normalizedPrompt)];
      return next.slice(0, HISTORY_LIMIT);
    });
  };

  const triggerPrompt = async (prompt: string) => {
    if (!chatRef.current) return;

    await chatRef.current.triggerSearch(prompt);
    document.getElementById('consultant-anchor')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleMunicipalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!muniName.trim() || !muniUF.trim()) return;

    const prompt = buildMunicipalityPrompt(muniName, muniUF);
    await triggerPrompt(prompt);
    setMuniName('');
  };

  const toggleFavorite = (uf: string) => {
    setFavoriteUFs((prev) => {
      if (prev.includes(uf)) return prev.filter((item) => item !== uf);
      return [...prev, uf];
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('Todas');
    setFavoritesOnly(false);
  };

  const toggleUiSetting = (setting: keyof UiSettings) => {
    setUiSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteudo principal
      </a>

      <header className="site-header">
        <div>
          <p className="eyebrow">Fiscal Intelligence Suite</p>
          <h1>Painel Tributario para Decisao Executiva</h1>
          <p className="subtitle">
            Monitoramento de ICMS, FCP/FECOP e ISS entre {YEAR_RANGE.start} e {YEAR_RANGE.end} com
            assistente fiscal orientado por fontes oficiais.
          </p>
        </div>

        <div className="header-stats" aria-label="Resumo executivo">
          <article>
            <span>UFs catalogadas</span>
            <strong>{BRAZIL_STATES.length}</strong>
          </article>
          <article>
            <span>Faixa temporal</span>
            <strong>
              {YEAR_RANGE.start}-{YEAR_RANGE.end}
            </strong>
          </article>
          <article>
            <span>Favoritas</span>
            <strong>{favoriteUFs.length}</strong>
          </article>
        </div>
      </header>

      <main className="main-layout" id="main-content">
        <section className="column column--wide">
          <KpiBoard
            states={BRAZIL_STATES}
            visibleStates={visibleStates}
            favoriteCount={favoriteUFs.length}
          />

          <section className="panel controls-panel" aria-label="Filtros de exploracao">
            <div className="panel__header">
              <div>
                <h2>Filtros e Preferencias</h2>
                <p>{visibleStates.length} UFs encontradas com os filtros atuais.</p>
              </div>
              <button type="button" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>

            <div className="controls-grid">
              <label>
                Buscar UF ou estado
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Ex: SP, Rio de Janeiro, Norte"
                />
              </label>

              <label>
                Regiao
                <select
                  value={regionFilter}
                  onChange={(event) => setRegionFilter(event.target.value as RegionFilter)}
                >
                  <option value="Todas">Todas</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(event) => setFavoritesOnly(event.target.checked)}
                />
                Mostrar apenas favoritos
              </label>
            </div>

            <div className="prefs-grid" role="group" aria-label="Preferencias de acessibilidade">
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={uiSettings.highContrast}
                  onChange={() => toggleUiSetting('highContrast')}
                />
                Alto contraste
              </label>
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={uiSettings.compactMode}
                  onChange={() => toggleUiSetting('compactMode')}
                />
                Layout compacto
              </label>
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={uiSettings.reducedMotion}
                  onChange={() => toggleUiSetting('reducedMotion')}
                />
                Reduzir animacoes
              </label>
            </div>
          </section>

          <section className="state-grid" aria-label="Estados e aliquotas">
            {!visibleStates.length && (
              <p className="empty-state">
                Nenhum estado encontrado com os filtros atuais. Ajuste os criterios para retomar a analise.
              </p>
            )}

            {visibleStates.map((state) => (
              <StateCard
                key={state.uf}
                state={state}
                isSelected={selectedState?.uf === state.uf}
                isFavorite={favoriteUFs.includes(state.uf)}
                onSelect={() => setSelectedUF(state.uf)}
                onToggleFavorite={() => toggleFavorite(state.uf)}
              />
            ))}
          </section>

          {selectedState && (
            <section className="panel details-panel" aria-labelledby="state-title">
              <header className="panel__header">
                <div>
                  <h2 id="state-title">
                    {selectedState.name} ({selectedState.uf})
                  </h2>
                  <p>Regiao {selectedState.region}</p>
                </div>
                <button type="button" onClick={() => toggleFavorite(selectedState.uf)}>
                  {favoriteUFs.includes(selectedState.uf) ? 'Remover favorito' : 'Adicionar favorito'}
                </button>
              </header>

              <div className="detail-metrics">
                <article>
                  <span>Aliquota interna ICMS</span>
                  <strong>{formatPercentage(selectedState.internalRate)}</strong>
                </article>
                <article>
                  <span>FCP/FECOP</span>
                  <strong>{formatPercentage(selectedState.fcpRate)}</strong>
                </article>
                <article>
                  <span>Fundo de compensacao</span>
                  <strong>{selectedState.benefitFund ? 'Sim' : 'Nao'}</strong>
                </article>
              </div>

              <div className="quick-actions">
                <button type="button" onClick={() => void triggerPrompt(buildStatePrompt(selectedState))}>
                  Analise completa de arrecadacao
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => void triggerPrompt(buildCompensationFundPrompt(selectedState))}
                >
                  Fundos de compensacao e incentivos
                </button>
              </div>
            </section>
          )}

          <StateComparator
            primaryState={selectedState}
            states={BRAZIL_STATES}
            onRunComparison={(targetState) => {
              if (!selectedState) return;
              void triggerPrompt(buildComparisonPrompt(selectedState, targetState));
            }}
          />

          <section className="panel municipal-panel" aria-labelledby="municipal-title">
            <header className="panel__header">
              <div>
                <h2 id="municipal-title">Consulta Municipal Guiada</h2>
                <p>ISS + cota-parte de ICMS com rastreabilidade de fontes oficiais.</p>
              </div>
            </header>

            <form onSubmit={handleMunicipalSubmit} className="municipal-form">
              <label>
                Municipio
                <input
                  type="text"
                  value={muniName}
                  onChange={(event) => setMuniName(event.target.value)}
                  placeholder="Ex: Campinas"
                  required
                />
              </label>

              <label>
                UF
                <select value={muniUF} onChange={(event) => setMuniUF(event.target.value)} required>
                  <option value="">Selecione</option>
                  {BRAZIL_STATES.map((state) => (
                    <option key={state.uf} value={state.uf}>
                      {state.uf} - {state.name}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit">Consultar municipio</button>
            </form>
          </section>

          <ScenarioSimulator selectedState={selectedState} />
        </section>

        <aside className="column column--side" id="consultant-anchor">
          <AIConsultant onPromptSubmitted={pushHistory} ref={chatRef} />

          <QueryHistory
            history={queryHistory}
            onReuse={(prompt) => void triggerPrompt(prompt)}
            onClear={() => setQueryHistory([])}
          />

          <section className="panel source-panel" aria-labelledby="sources-title">
            <header className="panel__header">
              <h2 id="sources-title">Fontes Recomendadas</h2>
            </header>
            <ul>
              <li>
                <a href="https://siconfi.tesouro.gov.br/" target="_blank" rel="noreferrer noopener">
                  Siconfi - Tesouro Nacional
                </a>
              </li>
              <li>
                <a href="https://www.confaz.fazenda.gov.br/" target="_blank" rel="noreferrer noopener">
                  CONFAZ
                </a>
              </li>
              <li>
                <a href="https://www.gov.br/tesouronacional/" target="_blank" rel="noreferrer noopener">
                  Secretaria do Tesouro Nacional
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </main>

      <footer className="site-footer">
        <p>
          Fiscal Intelligence Suite - Plataforma de analise fiscal com foco em manutencao, escala,
          acessibilidade e rastreabilidade.
        </p>
      </footer>
    </div>
  );
};

export default App;
