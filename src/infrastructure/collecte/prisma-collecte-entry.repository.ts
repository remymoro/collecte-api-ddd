import { Injectable } from '@nestjs/common';
import type { CollecteEntryRepository } from '@domain/collecte/collecte-entry.repository';
import { CollecteEntry } from '@domain/collecte/collecte-entry.entity';
import { DomainError } from '@domain/errors/domain-error';
import { PersistenceError } from '@domain/errors/persistence.error';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { CollecteEntryMapper } from './collecte-entry.mapper';
import { EntryNotFoundError } from '@domain/collecte/errors/entry-not-found.error';


@Injectable()
export class PrismaCollecteEntryRepository implements CollecteEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entry: CollecteEntry): Promise<void> {
    const data = CollecteEntryMapper.toPrisma(entry);

    try {
      await this.prisma.collecteEntry.upsert({
        where: { id: entry.id },
        create: data,
        update: {
          status: data.status,
          totalKg: data.totalKg,
          validatedAt: data.validatedAt,
          items: {
            deleteMany: {}, // reset items (safe car DRAFT only)
            create: data.items.create,
          },
        },
      });
    } catch (error: any) {
      throw this.mapPrismaError(error);
    }
  }

  async findAll(): Promise<CollecteEntry[]> {
    const rows = await this.prisma.collecteEntry.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => CollecteEntryMapper.toDomain(row));
  }

  async findById(id: string): Promise<CollecteEntry> {
    const row = await this.prisma.collecteEntry.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!row) {
      throw new EntryNotFoundError();
    }

    return CollecteEntryMapper.toDomain(row);
  }

  // =========================
  // Prisma → DomainError
  // =========================

  private mapPrismaError(error: any): DomainError {
    // On branchera des erreurs spécifiques plus tard
    void error;
    return new PersistenceError();
  }
}
