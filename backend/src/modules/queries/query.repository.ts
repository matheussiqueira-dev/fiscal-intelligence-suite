import { JsonStore } from '../../infrastructure/store/jsonStore.js';
import { QueryLog, QueryType } from '../../domain/types.js';

interface CreateQueryLogInput {
  userId: string;
  queryType: QueryType;
  prompt: string;
  status: 'success' | 'error';
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

export class QueryRepository {
  constructor(private readonly store: JsonStore) {}

  async create(input: CreateQueryLogInput): Promise<QueryLog> {
    const entity: QueryLog = {
      id: crypto.randomUUID(),
      userId: input.userId,
      queryType: input.queryType,
      prompt: input.prompt,
      status: input.status,
      latencyMs: input.latencyMs,
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };

    await this.store.update((draft) => {
      draft.queryLogs.unshift(entity);

      if (draft.queryLogs.length > 5000) {
        draft.queryLogs = draft.queryLogs.slice(0, 5000);
      }
    });

    return entity;
  }

  async listByUser(userId: string, limit: number): Promise<QueryLog[]> {
    const data = await this.store.read();
    return data.queryLogs.filter((item) => item.userId === userId).slice(0, limit);
  }

  async listAll(limit: number): Promise<QueryLog[]> {
    const data = await this.store.read();
    return data.queryLogs.slice(0, limit);
  }

  async removeByIdForUser(id: string, userId: string): Promise<boolean> {
    let removed = false;

    await this.store.update((draft) => {
      const previousSize = draft.queryLogs.length;
      draft.queryLogs = draft.queryLogs.filter((log) => !(log.id === id && log.userId === userId));
      removed = draft.queryLogs.length !== previousSize;
    });

    return removed;
  }
}
