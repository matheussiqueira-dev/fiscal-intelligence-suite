export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export type QueryType =
  | 'state-analysis'
  | 'municipal-analysis'
  | 'comparison-analysis'
  | 'free-chat'
  | 'scenario-simulation';

export interface QueryLog {
  id: string;
  userId: string;
  queryType: QueryType;
  prompt: string;
  status: 'success' | 'error';
  latencyMs: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface StateTaxProfile {
  uf: string;
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  internalRate: number;
  fcpRate: number;
  benefitFund: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface StoreSchema {
  users: User[];
  queryLogs: QueryLog[];
}
