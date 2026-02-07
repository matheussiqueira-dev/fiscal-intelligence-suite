import type { FC } from 'react';
import { StateData } from '../types';
import { formatPercentage } from '../utils/formatters';

interface StateCardProps {
  state: StateData;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

const StateCard: FC<StateCardProps> = ({
  state,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <article className={`state-card ${isSelected ? 'state-card--selected' : ''}`}>
      <div className="state-card__top">
        <button type="button" className="state-card__uf" onClick={onSelect} aria-label={`Abrir detalhes de ${state.name}`}>
          {state.uf}
        </button>
        <button
          type="button"
          className={`favorite-toggle ${isFavorite ? 'favorite-toggle--active' : ''}`}
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remover ${state.name} dos favoritos` : `Adicionar ${state.name} aos favoritos`}
        >
          {isFavorite ? 'Favorito' : 'Favoritar'}
        </button>
      </div>

      <button type="button" className="state-card__content" onClick={onSelect}>
        <h3>{state.name}</h3>
        <p>{state.region}</p>
      </button>

      <div className="state-card__metrics">
        <div>
          <span>ICMS</span>
          <strong>{formatPercentage(state.internalRate)}</strong>
        </div>
        <div>
          <span>FCP</span>
          <strong>{formatPercentage(state.fcpRate)}</strong>
        </div>
      </div>

      {state.benefitFund && <p className="state-card__tag">Possui fundo de compensacao</p>}
    </article>
  );
};

export default StateCard;

