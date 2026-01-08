// src/domain/center/center.entity.spec.ts

import { Center } from './center.entity';
import { CenterInactiveReadOnlyError } from './errors/center-inactive-read-only.error';

describe('Center Entity', () => {
  describe('Règle métier : Center créé = actif par défaut', () => {
    it('crée un center actif', () => {
      // POURQUOI : Un center naît toujours actif (règle métier)
      const center = Center.create({
        name: 'Centre Paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
      });

      expect(center.isActive).toBe(true);
    });
  });

  describe('Règle métier : Center inactif = READ-ONLY', () => {
    it('refuse la modification d un center inactif', () => {
      // POURQUOI : Un center désactivé ne peut plus être modifié
      const center = Center.create({
        name: 'Centre Paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
      });

      const inactiveCenter = center.deactivate();

      expect(() =>
        inactiveCenter.updateInfo(
          'Nouveau nom',
          '20 rue de Rivoli',
          'Paris',
          '75001',
        ),
      ).toThrow(CenterInactiveReadOnlyError);
    });

    it('assertActive() lance une erreur si center inactif', () => {
      // POURQUOI : Protection explicite contre les modifications interdites
      const center = Center.create({
        name: 'Centre Paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
      });

      const inactiveCenter = center.deactivate();

      expect(() => inactiveCenter.assertActive()).toThrow(
        CenterInactiveReadOnlyError,
      );
    });
  });

  describe('Règle métier : Transitions activation/désactivation', () => {
    it('désactive un center actif', () => {
      // POURQUOI : Désactivation métier (fermeture temporaire ou définitive)
      const center = Center.create({
        name: 'Centre Paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
      });

      const inactiveCenter = center.deactivate();

      expect(inactiveCenter.isActive).toBe(false);
    });

    it('réactive un center inactif', () => {
      // POURQUOI : Réouverture du centre après fermeture temporaire
      const center = Center.create({
        name: 'Centre Paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
      });

      const inactiveCenter = center.deactivate();
      const reactivatedCenter = inactiveCenter.activate();

      expect(reactivatedCenter.isActive).toBe(true);
    });
  });

  describe('Immutabilité (Entity avec Value Object)', () => {
    it('updateInfo retourne un nouveau Center', () => {
      // POURQUOI : Pattern immutable, l'entité d'origine reste intacte
      const center = Center.create({
        name: 'Centre Paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
      });

      const updatedCenter = center.updateInfo(
        'Centre Paris Nord',
        '20 rue de Rivoli',
        'Paris',
        '75002',
      );

      // Original non modifié
      expect(center.name).toBe('Centre Paris');
      expect(center.postalCode).toBe('75001');

      // Nouveau center créé
      expect(updatedCenter.name).toBe('Centre Paris Nord');
      expect(updatedCenter.postalCode).toBe('75002');
      expect(updatedCenter.id.equals(center.id)).toBe(true); // Même identité
    });
  });
});
