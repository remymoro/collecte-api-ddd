import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/user.entity';

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}

  async save(user: User): Promise<void> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
      return;
    }
    this.users.push(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find(u => u.username === username) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }
}
