import type { FC } from 'react';

interface QueryHistoryProps {
  history: string[];
  onReuse: (prompt: string) => void;
  onClear: () => void;
}

const QueryHistory: FC<QueryHistoryProps> = ({ history, onReuse, onClear }) => {
  return (
    <section className="panel history-panel" aria-labelledby="history-title">
      <header className="panel__header">
        <h2 id="history-title">Historico de Consultas</h2>
        <button type="button" onClick={onClear} disabled={!history.length}>
          Limpar
        </button>
      </header>

      {!history.length && (
        <p className="empty-state">As consultas enviadas ao assistente aparecem aqui para reutilizacao rapida.</p>
      )}

      {history.length > 0 && (
        <ul className="history-list">
          {history.map((item) => (
            <li key={item}>
              <button type="button" onClick={() => onReuse(item)}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default QueryHistory;

