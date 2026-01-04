import { Center } from '@domain/center/center.entity';
import { Center as PrismaCenter } from '@generated/prisma/client';

export class CenterMapper {
  static toDomain(row: PrismaCenter): Center {
    return Center.rehydrate({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      postalCode: row.postalCode,
      isActive: row.isActive,
    });
  }

  static toPersistence(center: Center) {
    return {
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }
}
