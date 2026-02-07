export type Region = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export interface StateData {
  uf: string;
  name: string;
  internalRate: number;
  region: Region;
  fcpRate: number;
  benefitFund: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
  isError?: boolean;
  sources?: GroundingSource[];
}

export interface ScenarioResult {
  currentEffectiveRate: number;
  projectedEffectiveRate: number;
  variationPercent: number;
  projectedRevenue: number;
  deltaRevenue: number;
}

export interface UiSettings {
  highContrast: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
}
