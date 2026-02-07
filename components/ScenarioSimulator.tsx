import { useMemo, useState } from 'react';
import { StateData } from '../types';
import { formatCompactBRL, formatCurrencyBRL, formatPercentage } from '../utils/formatters';

interface ScenarioSimulatorProps {
  selectedState?: StateData;
}

const ScenarioSimulator = ({ selectedState }: ScenarioSimulatorProps) => {
  const [baseRevenue, setBaseRevenue] = useState(1200000000);
  const [deltaIcms, setDeltaIcms] = useState(0.5);
  const [deltaFcp, setDeltaFcp] = useState(0);

  const result = useMemo(() => {
    if (!selectedState) return null;

    const currentRate = selectedState.internalRate + selectedState.fcpRate;
    const projectedRate = Math.max(0, currentRate + deltaIcms + deltaFcp);
    const variationPercent = currentRate === 0 ? 0 : ((projectedRate - currentRate) / currentRate) * 100;
    const projectedRevenue = baseRevenue * (1 + variationPercent / 100);
    const deltaRevenue = projectedRevenue - baseRevenue;

    return {
      currentRate,
      projectedRate,
      variationPercent,
      projectedRevenue,
      deltaRevenue,
    };
  }, [baseRevenue, deltaFcp, deltaIcms, selectedState]);

  return (
    <section className="panel simulator-panel" aria-labelledby="scenario-title">
      <header className="panel__header">
        <h2 id="scenario-title">Simulador de Cenario Fiscal</h2>
        <p>
          Modelo linear para apoiar planejamento preliminar. Use como referencia de sensibilidade,
          nao como previsao oficial.
        </p>
      </header>

      {!selectedState && <p className="empty-state">Selecione uma UF para habilitar a simulacao.</p>}

      {selectedState && result && (
        <>
          <div className="simulator-grid">
            <label>
              Base de arrecadacao anual (R$)
              <input
                type="number"
                min={1000000}
                step={1000000}
                value={baseRevenue}
                onChange={(event) => setBaseRevenue(Number(event.target.value) || 0)}
              />
            </label>

            <label>
              Variacao ICMS (p.p.)
              <input
                type="number"
                step={0.1}
                value={deltaIcms}
                onChange={(event) => setDeltaIcms(Number(event.target.value) || 0)}
              />
            </label>

            <label>
              Variacao FCP (p.p.)
              <input
                type="number"
                step={0.1}
                value={deltaFcp}
                onChange={(event) => setDeltaFcp(Number(event.target.value) || 0)}
              />
            </label>
          </div>

          <div className="simulator-result">
            <article>
              <span>Aliquota efetiva atual</span>
              <strong>{formatPercentage(result.currentRate)}</strong>
            </article>
            <article>
              <span>Aliquota efetiva projetada</span>
              <strong>{formatPercentage(result.projectedRate)}</strong>
            </article>
            <article>
              <span>Variacao estimada</span>
              <strong>{formatPercentage(result.variationPercent)}</strong>
            </article>
            <article>
              <span>Arrecadacao projetada</span>
              <strong>{formatCompactBRL(result.projectedRevenue)}</strong>
              <small>{formatCurrencyBRL(result.projectedRevenue)}</small>
            </article>
          </div>

          <p className={`simulator-delta ${result.deltaRevenue >= 0 ? 'positive' : 'negative'}`}>
            Impacto estimado no caixa: {formatCurrencyBRL(result.deltaRevenue)}
          </p>
        </>
      )}
    </section>
  );
};

export default ScenarioSimulator;

