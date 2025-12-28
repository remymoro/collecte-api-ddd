import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/user.repository';
import { User } from '@domain/user/user.entity';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!row) {
      return null;
    }

    return new User(
      row.id,
      row.username,
      row.passwordHash,
      row.role,
      row.activeCenterId,
    );
  }
}
