import { JsonStore } from '../../infrastructure/store/jsonStore.js';
import { User } from '../../domain/types.js';

export class UserRepository {
  constructor(private readonly store: JsonStore) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    const data = await this.store.read();
    return data.users.find((user) => user.email === normalized);
  }

  async findById(id: string): Promise<User | undefined> {
    const data = await this.store.read();
    return data.users.find((user) => user.id === id);
  }

  async list(): Promise<User[]> {
    const data = await this.store.read();
    return data.users;
  }

  async createMany(users: User[]): Promise<void> {
    await this.store.update((draft) => {
      const existingEmails = new Set(draft.users.map((user) => user.email));

      users.forEach((user) => {
        if (!existingEmails.has(user.email)) {
          draft.users.push(user);
          existingEmails.add(user.email);
        }
      });
    });
  }
}
