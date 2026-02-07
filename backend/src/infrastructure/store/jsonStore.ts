import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { StoreSchema } from '../../domain/types.js';

const DEFAULT_STORE: StoreSchema = {
  users: [],
  queryLogs: [],
};

export class JsonStore {
  private data: StoreSchema = DEFAULT_STORE;
  private initialized = false;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async init(): Promise<void> {
    if (this.initialized) return;

    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as StoreSchema;
      this.data = {
        users: parsed.users ?? [],
        queryLogs: parsed.queryLogs ?? [],
      };
    } catch {
      this.data = structuredClone(DEFAULT_STORE);
      await this.persist();
    }

    this.initialized = true;
  }

  private async persist(): Promise<void> {
    const serialized = JSON.stringify(this.data, null, 2);

    this.writeQueue = this.writeQueue.then(async () => {
      await writeFile(this.filePath, serialized, 'utf8');
    });

    await this.writeQueue;
  }

  async read(): Promise<StoreSchema> {
    await this.init();
    return structuredClone(this.data);
  }

  async update(mutator: (draft: StoreSchema) => void): Promise<StoreSchema> {
    await this.init();
    mutator(this.data);
    await this.persist();
    return structuredClone(this.data);
  }
}
