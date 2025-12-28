import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/user.entity';

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find(u => u.username === username) ?? null;
  }
}
