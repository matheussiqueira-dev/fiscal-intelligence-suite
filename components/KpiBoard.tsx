import { useMemo } from 'react';
import { StateData } from '../types';
import { formatPercentage } from '../utils/formatters';

interface KpiBoardProps {
  states: StateData[];
  visibleStates: StateData[];
  favoriteCount: number;
}

const KpiBoard = ({ states, visibleStates, favoriteCount }: KpiBoardProps) => {
  const kpis = useMemo(() => {
    const avgRate = visibleStates.length
      ? visibleStates.reduce((acc, item) => acc + item.internalRate, 0) / visibleStates.length
      : 0;

    const avgFcp = visibleStates.length
      ? visibleStates.reduce((acc, item) => acc + item.fcpRate, 0) / visibleStates.length
      : 0;

    const withCompensation = visibleStates.filter((item) => item.benefitFund).length;

    return [
      {
        label: 'UFs mapeadas',
        value: `${visibleStates.length}/${states.length}`,
        helper: 'Cobertura atual do filtro',
      },
      {
        label: 'Media ICMS',
        value: formatPercentage(avgRate),
        helper: 'Aliquota interna media',
      },
      {
        label: 'Media FCP',
        value: formatPercentage(avgFcp),
        helper: 'Adicional social medio',
      },
      {
        label: 'Fundos ativos',
        value: String(withCompensation),
        helper: `${favoriteCount} UFs favoritas`,
      },
    ];
  }, [favoriteCount, states, visibleStates]);

  return (
    <section className="kpi-board" aria-label="Indicadores rapidos">
      {kpis.map((kpi) => (
        <article key={kpi.label} className="kpi-card">
          <p>{kpi.label}</p>
          <strong>{kpi.value}</strong>
          <span>{kpi.helper}</span>
        </article>
      ))}
    </section>
  );
};

export default KpiBoard;

