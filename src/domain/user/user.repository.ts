import { User } from './user.entity';
import { UserId } from './value-objects/user-id.vo';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
}
