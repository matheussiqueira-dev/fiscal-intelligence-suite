import { Region, StateData } from './types';

export const REGIONS: Region[] = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

export const YEAR_RANGE = {
  start: 2018,
  end: 2025,
} as const;

export const QUERY_SUGGESTIONS: string[] = [
  'Comparar arrecadacao de ICMS de SP e MG em 2023 e 2024',
  'Mapa de fundos de compensacao ativos no Sul em 2025',
  'Serie ISS de Recife com validacao Siconfi',
  'Riscos fiscais para estados com FCP acima de 2%',
  'Cota-parte de ICMS para Campinas/SP de 2021 a 2025',
];

export const BRAZIL_STATES: StateData[] = [
  { uf: 'AC', name: 'Acre', internalRate: 19, region: 'Norte', fcpRate: 2, benefitFund: false },
  { uf: 'AL', name: 'Alagoas', internalRate: 19, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'AP', name: 'Amapa', internalRate: 18, region: 'Norte', fcpRate: 0, benefitFund: false },
  { uf: 'AM', name: 'Amazonas', internalRate: 20, region: 'Norte', fcpRate: 2, benefitFund: false },
  { uf: 'BA', name: 'Bahia', internalRate: 20.5, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'CE', name: 'Ceara', internalRate: 20, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'DF', name: 'Distrito Federal', internalRate: 20, region: 'Centro-Oeste', fcpRate: 2, benefitFund: false },
  { uf: 'ES', name: 'Espirito Santo', internalRate: 17, region: 'Sudeste', fcpRate: 0, benefitFund: true },
  { uf: 'GO', name: 'Goias', internalRate: 19, region: 'Centro-Oeste', fcpRate: 2, benefitFund: true },
  { uf: 'MA', name: 'Maranhao', internalRate: 22, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'MT', name: 'Mato Grosso', internalRate: 17, region: 'Centro-Oeste', fcpRate: 2, benefitFund: true },
  { uf: 'MS', name: 'Mato Grosso do Sul', internalRate: 17, region: 'Centro-Oeste', fcpRate: 2, benefitFund: true },
  { uf: 'MG', name: 'Minas Gerais', internalRate: 18, region: 'Sudeste', fcpRate: 2, benefitFund: true },
  { uf: 'PA', name: 'Para', internalRate: 19, region: 'Norte', fcpRate: 0, benefitFund: false },
  { uf: 'PB', name: 'Paraiba', internalRate: 20, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'PR', name: 'Parana', internalRate: 19, region: 'Sul', fcpRate: 2, benefitFund: true },
  { uf: 'PE', name: 'Pernambuco', internalRate: 20.5, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'PI', name: 'Piaui', internalRate: 21, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'RJ', name: 'Rio de Janeiro', internalRate: 20, region: 'Sudeste', fcpRate: 2, benefitFund: true },
  { uf: 'RN', name: 'Rio Grande do Norte', internalRate: 18, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'RS', name: 'Rio Grande do Sul', internalRate: 17, region: 'Sul', fcpRate: 2, benefitFund: true },
  { uf: 'RO', name: 'Rondonia', internalRate: 21, region: 'Norte', fcpRate: 2, benefitFund: false },
  { uf: 'RR', name: 'Roraima', internalRate: 20, region: 'Norte', fcpRate: 2, benefitFund: false },
  { uf: 'SC', name: 'Santa Catarina', internalRate: 17, region: 'Sul', fcpRate: 0, benefitFund: true },
  { uf: 'SP', name: 'Sao Paulo', internalRate: 18, region: 'Sudeste', fcpRate: 2, benefitFund: true },
  { uf: 'SE', name: 'Sergipe', internalRate: 19, region: 'Nordeste', fcpRate: 2, benefitFund: false },
  { uf: 'TO', name: 'Tocantins', internalRate: 20, region: 'Norte', fcpRate: 2, benefitFund: false },
];
