// src/infrastructure/user/user.mapper.ts

import { User as PrismaUser } from '@generated/prisma/client';
import { User } from '@domain/user/user.entity';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

export class UserMapper {
  static toDomain(prisma: PrismaUser): User {
    return User.hydrate({
      id: UserId.from(prisma.id),
      username: prisma.username,
      passwordHash: prisma.passwordHash,
      role: prisma.role,
      centerId: prisma.centerId ? CenterId.from(prisma.centerId) : null,
    });
  }

  static toPersistence(domain: User): PrismaUser {
    return {
      id: domain.id.toString(),
      username: domain.username,
      passwordHash: domain.passwordHash,
      role: domain.role,
      centerId: domain.centerId?.toString() ?? null,
      createdAt: new Date(),
    };
  }
}