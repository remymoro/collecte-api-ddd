import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/user.entity';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id.toString() },
      create: {
        id: user.id.toString(),
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        centerId: user.centerId?.toString() ?? null,
      },
      update: {
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        centerId: user.centerId?.toString() ?? null,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!row) {
      return null;
    }

    return User.hydrate({
      id: UserId.from(row.id),
      username: row.username,
      passwordHash: row.passwordHash,
      role: row.role,
      centerId: row.centerId ? CenterId.from(row.centerId) : null,
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });

    if (!row) {
      return null;
    }

    return User.hydrate({
      id: UserId.from(row.id),
      username: row.username,
      passwordHash: row.passwordHash,
      role: row.role,
      centerId: row.centerId ? CenterId.from(row.centerId) : null,
    });
  }
}
