interface WorkflowGuideProps {
  hasSelectedState: boolean;
  hasFavorites: boolean;
  hasHistory: boolean;
  visibleStatesCount: number;
}

const WorkflowGuide = ({ hasSelectedState, hasFavorites, hasHistory, visibleStatesCount }: WorkflowGuideProps) => {
  const steps = [
    {
      title: 'Filtrar e explorar UFs',
      description: `${visibleStatesCount} estados elegiveis no contexto atual`,
      done: visibleStatesCount > 0,
    },
    {
      title: 'Priorizar estados estrategicos',
      description: hasSelectedState ? 'Estado em foco selecionado para comparacao' : 'Selecione uma UF para priorizar',
      done: hasSelectedState,
    },
    {
      title: 'Construir hipoteses fiscais',
      description: hasFavorites ? 'Favoritos definidos para acompanhamento continuo' : 'Marque favoritos para monitorar',
      done: hasFavorites,
    },
    {
      title: 'Validar com IA e fontes',
      description: hasHistory ? 'Historico de consultas registrado' : 'Envie uma consulta para iniciar trilha',
      done: hasHistory,
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <section className="panel workflow-panel" aria-labelledby="workflow-title">
      <header className="panel__header workflow-panel__header">
        <div>
          <h2 id="workflow-title">Roteiro de Decisao UX</h2>
          <p>Fluxo orientado para reduzir friccao e acelerar analises confiaveis.</p>
        </div>
        <div className="workflow-progress" aria-label={`Progresso ${progress}%`}>
          <strong>{progress}%</strong>
          <span>concluido</span>
        </div>
      </header>

      <ol className="workflow-list">
        {steps.map((step, index) => (
          <li key={step.title} className={step.done ? 'workflow-list__item workflow-list__item--done' : 'workflow-list__item'}>
            <span className="workflow-index" aria-hidden="true">{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default WorkflowGuide;
