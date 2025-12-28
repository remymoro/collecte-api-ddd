import { User } from './user.entity';

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
}
