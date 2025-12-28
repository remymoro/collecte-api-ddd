import { ProductArchivedError } from './errors/product-archived.error';

export type ProductSnapshot = {
  reference: string;
  family: string;
  subFamily?: string;
  isActive: boolean;
};

export class Product {
  private _family: string;
  private _subFamily?: string;
  private _isActive: boolean;

  private constructor(
    readonly reference: string,
    family: string,
    subFamily: string | undefined,
    isActive: boolean,
  ) {
    this._family = family;
    this._subFamily = subFamily;
    this._isActive = isActive;
  }

  // ======================
  // Création métier
  // ======================
  static create(input: {
    reference: string;
    family: string;
    subFamily?: string;
  }): Product {
    return new Product(
      input.reference,
      input.family,
      input.subFamily,
      true,
    );
  }

  // ======================
  // Rehydration (DB → Domain)
  // ======================
  static rehydrate(snapshot: ProductSnapshot): Product {
    return new Product(
      snapshot.reference,
      snapshot.family,
      snapshot.subFamily,
      snapshot.isActive,
    );
  }

  // ======================
  // Getters
  // ======================
  get family(): string {
    return this._family;
  }

  get subFamily(): string | undefined {
    return this._subFamily;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // ======================
  // Métier
  // ======================
  updateMetadata(input: { family: string; subFamily?: string }): void {
    this._family = input.family;

    if (input.subFamily !== undefined) {
      this._subFamily = input.subFamily;
    }
  }

  archive(): void {
    if (!this._isActive) {
      throw new ProductArchivedError(this.reference);
    }
    this._isActive = false;
  }
}
