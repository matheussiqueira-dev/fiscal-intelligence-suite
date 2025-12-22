
export interface StateData {
  uf: string;
  name: string;
  internalRate: number; // Standard ICMS rate for the state
  region: string;
  fcpRate?: number; // Fundo de Combate à Pobreza
  benefitFund?: boolean; // Fundo de Compensação por Benefício Fiscal
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

export interface TaxMetrics {
  year: number;
  icmsCollection: number;
  issCollection: number;
  cotaParteDistribution: number;
}
