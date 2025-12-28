import { Injectable } from "@nestjs/common";
import { Product } from "../../domain/product/product.entity";
import { ProductRepository } from "../../domain/product/product.repository";
import { PrismaService } from "../persistence/prisma/prisma.service";

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { reference: product.reference },
      create: {
        reference: product.reference,
        family: product.family,
        subFamily: product.subFamily ?? null,
        isActive: product.isActive,
      },
      update: {
        family: product.family,
        subFamily: product.subFamily ?? null,
        isActive: product.isActive,
      },
    });
  }

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      orderBy: { reference: 'asc' },
    });

    return rows.map((row) =>
      Product.rehydrate({
        reference: row.reference,
        family: row.family,
        subFamily: row.subFamily ?? undefined,
        isActive: row.isActive,
      }),
    );
  }

  async findAllActive(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { reference: 'asc' },
    });

    return rows.map((row) =>
      Product.rehydrate({
        reference: row.reference,
        family: row.family,
        subFamily: row.subFamily ?? undefined,
        isActive: row.isActive,
      }),
    );
  }

  async findByReference(reference: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { reference },
    });

    return row
      ? Product.rehydrate({
          reference: row.reference,
          family: row.family,
          subFamily: row.subFamily ?? undefined,
          isActive: row.isActive,
        })
      : null;
  }
}
