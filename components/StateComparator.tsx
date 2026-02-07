import { useEffect, useMemo, useState } from 'react';
import { StateData } from '../types';
import { formatPercentage } from '../utils/formatters';

interface StateComparatorProps {
  primaryState?: StateData;
  states: StateData[];
  onRunComparison: (targetState: StateData) => void;
}

const StateComparator = ({ primaryState, states, onRunComparison }: StateComparatorProps) => {
  const [secondaryUf, setSecondaryUf] = useState('');

  useEffect(() => {
    if (!primaryState) {
      setSecondaryUf('');
      return;
    }

    const fallback = states.find((state) => state.uf !== primaryState.uf)?.uf || '';
    setSecondaryUf((prev) => (prev && prev !== primaryState.uf ? prev : fallback));
  }, [primaryState, states]);

  const secondaryState = useMemo(() => {
    return states.find((state) => state.uf === secondaryUf);
  }, [secondaryUf, states]);

  const effectivePrimary = primaryState ? primaryState.internalRate + primaryState.fcpRate : 0;
  const effectiveSecondary = secondaryState ? secondaryState.internalRate + secondaryState.fcpRate : 0;
  const deltaEffective = effectivePrimary - effectiveSecondary;

  return (
    <section className="panel comparator-panel" aria-labelledby="comparator-title">
      <header className="panel__header">
        <div>
          <h2 id="comparator-title">Comparador de UFs</h2>
          <p>Comparacao rapida de carga efetiva e estrutura de compensacao.</p>
        </div>
      </header>

      {!primaryState && <p className="empty-state">Selecione uma UF para iniciar a comparacao.</p>}

      {primaryState && (
        <>
          <label>
            Comparar com
            <select value={secondaryUf} onChange={(event) => setSecondaryUf(event.target.value)}>
              {states
                .filter((state) => state.uf !== primaryState.uf)
                .map((state) => (
                  <option key={state.uf} value={state.uf}>
                    {state.uf} - {state.name}
                  </option>
                ))}
            </select>
          </label>

          {secondaryState && (
            <div className="comparison-grid" role="table" aria-label="Tabela comparativa entre estados">
              <article role="row">
                <span role="cell">Aliquota ICMS</span>
                <strong role="cell">{formatPercentage(primaryState.internalRate)}</strong>
                <strong role="cell">{formatPercentage(secondaryState.internalRate)}</strong>
              </article>
              <article role="row">
                <span role="cell">FCP/FECOP</span>
                <strong role="cell">{formatPercentage(primaryState.fcpRate)}</strong>
                <strong role="cell">{formatPercentage(secondaryState.fcpRate)}</strong>
              </article>
              <article role="row">
                <span role="cell">Carga efetiva</span>
                <strong role="cell">{formatPercentage(effectivePrimary)}</strong>
                <strong role="cell">{formatPercentage(effectiveSecondary)}</strong>
              </article>
              <article role="row">
                <span role="cell">Fundo compensatorio</span>
                <strong role="cell">{primaryState.benefitFund ? 'Sim' : 'Nao'}</strong>
                <strong role="cell">{secondaryState.benefitFund ? 'Sim' : 'Nao'}</strong>
              </article>
            </div>
          )}

          <p className={`comparison-delta ${deltaEffective >= 0 ? 'warning' : 'positive'}`}>
            Diferenca de carga efetiva: {deltaEffective >= 0 ? '+' : ''}{formatPercentage(deltaEffective)}
          </p>

          {secondaryState && (
            <button type="button" onClick={() => onRunComparison(secondaryState)}>
              Consultar comparacao no assistente
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default StateComparator;
