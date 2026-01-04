// src/infrastructure/user/user.mapper.ts

import { User as PrismaUser } from '@generated/prisma/client';
import { User } from '@domain/user/user.entity';

export class UserMapper {
  static toDomain(prisma: PrismaUser): User {
    return User.hydrate({
      id: prisma.id,
      username: prisma.username,
      passwordHash: prisma.passwordHash,
      role: prisma.role,
      centerId: prisma.centerId,
    });
  }

  static toPersistence(domain: User): PrismaUser {
    return {
      id: domain.id,
      username: domain.username,
      passwordHash: domain.passwordHash,
      role: domain.role,
      centerId: domain.centerId,
      createdAt: new Date(),
    };
  }
}