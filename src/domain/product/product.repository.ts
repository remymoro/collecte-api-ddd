import { Product } from './product.entity';

export interface ProductRepository {
  // Usage Collecte / Admin
  findByReference(reference: string): Promise<Product | null>;

  // Persistance
  save(product: Product): Promise<void>;

  // Catalogue
  findAll(): Promise<Product[]>;
  findAllActive(): Promise<Product[]>;
}
