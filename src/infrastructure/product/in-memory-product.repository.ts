import { Product } from '../../domain/product/product.entity';
import type { ProductRepository } from '../../domain/product/product.repository';

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  constructor(initial: Product[] = []) {
    for (const product of initial) {
      this.products.set(product.reference, product);
    }
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.reference, product);
  }

  async findByReference(reference: string): Promise<Product | null> {
    return this.products.get(reference) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findAllActive(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isActive,
    );
  }
}

