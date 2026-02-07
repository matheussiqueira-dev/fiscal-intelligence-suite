import { QueryLog, QueryType } from '../../domain/types.js';
import { QueryRepository } from './query.repository.js';

interface RecordQueryInput {
  userId: string;
  queryType: QueryType;
  prompt: string;
  status: 'success' | 'error';
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

export class QueryService {
  constructor(private readonly queryRepository: QueryRepository) {}

  async recordQuery(input: RecordQueryInput): Promise<QueryLog> {
    return this.queryRepository.create(input);
  }

  async listUserHistory(userId: string, limit: number): Promise<QueryLog[]> {
    return this.queryRepository.listByUser(userId, limit);
  }

  async listGlobalHistory(limit: number): Promise<QueryLog[]> {
    return this.queryRepository.listAll(limit);
  }

  async deleteUserHistoryItem(id: string, userId: string): Promise<boolean> {
    return this.queryRepository.removeByIdForUser(id, userId);
  }
}
