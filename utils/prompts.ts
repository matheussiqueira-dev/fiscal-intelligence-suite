import { YEAR_RANGE } from '../constants';
import { StateData } from '../types';

export const buildMunicipalityPrompt = (city: string, uf: string): string => {
  const normalizedCity = city.trim();
  const normalizedUf = uf.trim().toUpperCase();

  return [
    `Analise o municipio de ${normalizedCity} (${normalizedUf}) entre ${YEAR_RANGE.start} e ${YEAR_RANGE.end}.`,
    'Entregue uma tabela anual com ISS arrecadado, cota-parte de ICMS recebida e observacoes de variacao.',
    'Use apenas fontes oficiais (Siconfi, STN, SEFAZ/portais de transparencia) e destaque links usados.',
    'Quando houver dados parciais em 2024/2025, sinalize explicitamente como parcial/projecao.',
  ].join(' ');
};

export const buildStatePrompt = (state: StateData): string => {
  return [
    `Analise a arrecadacao de ICMS de ${state.name} (${state.uf}) de ${YEAR_RANGE.start} a ${YEAR_RANGE.end}.`,
    'Inclua secao obrigatoria para FCP/FECOP: aliquotas, base legal e peso na arrecadacao.',
    'Verifique se existe fundo de compensacao por beneficios fiscais (ou equivalente) e descreva mecanismo.',
    'Retorne com tabela anual, variacoes percentuais e citacao das fontes oficiais usadas.',
  ].join(' ');
};

export const buildCompensationFundPrompt = (state: StateData): string => {
  return [
    `Mapeie fundos de compensacao, estabilizacao ou incentivos fiscais vigentes em ${state.name} (${state.uf}).`,
    'Liste base legal, objetivo, governanca e impacto potencial no fluxo de ICMS.',
    'Priorize dados oficiais de SEFAZ, leis estaduais e CONFAZ.',
  ].join(' ');
};
