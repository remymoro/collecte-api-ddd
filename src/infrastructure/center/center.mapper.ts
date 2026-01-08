import { Center } from '@domain/center/center.entity';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { Center as PrismaCenter } from '@generated/prisma/client';

export class CenterMapper {
  static toDomain(row: PrismaCenter): Center {
    return Center.rehydrate({
      id: CenterId.from(row.id),
      name: row.name,
      address: row.address,
      city: row.city,
      postalCode: row.postalCode,
      isActive: row.isActive,
    });
  }

  static toPersistence(center: Center) {
    return {
      id: center.id.toString(),
      name: center.name,
      address: center.address,
      city: center.city,
      postalCode: center.postalCode,
      isActive: center.isActive,
    };
  }
}
