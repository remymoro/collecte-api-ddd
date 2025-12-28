import { ProductArchivedError } from '@domain/product/errors/product-archived.error';
import { Product } from '@domain/product/product.entity';

describe('Product (Domain)', () => {
  describe('Création', () => {
    it('crée un produit avec référence et famille', () => {
      const product = Product.create({
        reference: 'PROD_1',
        family: 'Protéines',
      });

      expect(product.reference).toBe('PROD_1');
      expect(product.family).toBe('Protéines');
      expect(product.subFamily).toBeUndefined();
    });

    it('crée un produit avec sous-famille', () => {
      const product = Product.create({
        reference: 'PROD_2',
        family: 'Protéines',
        subFamily: 'Sans porc',
      });

      expect(product.reference).toBe('PROD_2');
      expect(product.family).toBe('Protéines');
      expect(product.subFamily).toBe('Sans porc');
    });

    it('est actif par défaut', () => {
      const product = Product.create({
        reference: 'PROD_1',
        family: 'Protéines',
      });

      expect(product.isActive).toBe(true);
    });
  });

  describe('Mise à jour des métadonnées', () => {
    it('met à jour family et subFamily via une intention métier', () => {
      const product = Product.create({
        reference: 'PROD_3',
        family: 'Ancienne famille',
      });

      product.updateMetadata({
        family: 'Famille corrigée',
        subFamily: 'Sous-famille corrigée',
      });

      expect(product.reference).toBe('PROD_3'); // identité inchangée
      expect(product.family).toBe('Famille corrigée');
      expect(product.subFamily).toBe('Sous-famille corrigée');
    });

    it('permet de mettre à jour uniquement la famille', () => {
      const product = Product.create({
        reference: 'PROD_4',
        family: 'Ancienne',
        subFamily: 'Sous-ancienne',
      });

      product.updateMetadata({
        family: 'Nouvelle',
      });

      expect(product.family).toBe('Nouvelle');
      expect(product.subFamily).toBe('Sous-ancienne'); // inchangée
    });
  });

  describe('Archivage', () => {
    it('peut être archivé', () => {
      const product = Product.create({
        reference: 'PROD_5',
        family: 'Divers',
      });

      product.archive();

      expect(product.isActive).toBe(false);
    });

    it('ne peut pas être archivé deux fois', () => {
      const product = Product.create({
        reference: 'PROD_6',
        family: 'Divers',
      });

      product.archive();

      expect(() => product.archive()).toThrow(ProductArchivedError);
    });
  });
});
