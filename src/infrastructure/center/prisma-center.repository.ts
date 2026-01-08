// src/infrastructure/persistence/center/prisma-center.repository.ts

import { Injectable } from '@nestjs/common';
import { Center } from '@domain/center/center.entity';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { CenterRepository } from '@domain/center/center.repository';
import { PrismaService } from '@infrastructure/persistence/prisma/prisma.service';
import { CenterMapper } from './center.mapper';

@Injectable()
export class PrismaCenterRepository implements CenterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ✅ Trouve un centre par ID
   */
  async findById(id: CenterId): Promise<Center | null> {
    const row = await this.prisma.center.findUnique({
      where: { id: id.toString() },
    });

    if (!row) return null;

    return CenterMapper.toDomain(row);
  }

  /**
   * ✅ Trouve un centre par nom et ville
   */
  async findByNameAndCity(
    name: string,
    city: string,
  ): Promise<Center | null> {
    const row = await this.prisma.center.findFirst({
      where: {
        name,
        city,
      },
    });

    if (!row) return null;

    return CenterMapper.toDomain(row);
  }

  /**
   * ✅ Récupère tous les centres
   */
  async findAll(): Promise<Center[]> {
    const rows = await this.prisma.center.findMany({
      orderBy: {
        name: 'asc',  // Tri alphabétique par nom
      },
    });

    return rows.map((row) => CenterMapper.toDomain(row));
  }

  /**
   * ✅ Sauvegarde un centre (create ou update)
   */
  async save(center: Center): Promise<void> {
    const data = CenterMapper.toPersistence(center);

    await this.prisma.center.upsert({
      where: { id: center.id.toString() },
      create: data,
      update: data,
    });
  }

  /**
   * ✅ Supprime un centre par ID
   */
  async delete(id: CenterId): Promise<void> {
    await this.prisma.center.delete({
      where: { id: id.toString() },
    });
  }
}