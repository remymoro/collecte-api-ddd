// src/domain/campaign/value-objects/campaign-id.vo.spec.ts

import { CampaignId } from './campaign-id.vo';

describe('CampaignId Value Object', () => {
  describe('Règle métier : Validation UUID stricte', () => {
    it('refuse une string quelconque', () => {
      // POURQUOI : Empêche les IDs fantaisistes ("1", "abc", etc.)
      expect(() => CampaignId.from('invalid-id')).toThrow(
        /Invalid CampaignId.*not a valid UUID/,
      );
    });

    it('refuse une string vide', () => {
      // POURQUOI : Un ID vide n'a pas de sens
      expect(() => CampaignId.from('')).toThrow();
    });

    it('accepte un UUID v4 valide', () => {
      // POURQUOI : Format standard attendu en BDD
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = CampaignId.from(validUuid);
      expect(id.toString()).toBe(validUuid);
    });

    it('génère un UUID valide avec generate()', () => {
      // POURQUOI : Les nouveaux IDs doivent respecter le format
      const id = CampaignId.generate();
      expect(id.toString()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('Type Safety : Égalité entre IDs', () => {
    it('deux IDs avec la même valeur sont égaux', () => {
      // POURQUOI : Comparaison métier correcte
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = CampaignId.from(uuid);
      const id2 = CampaignId.from(uuid);
      expect(id1.equals(id2)).toBe(true);
    });

    it('deux IDs différents ne sont pas égaux', () => {
      // POURQUOI : Empêche les confusions métier
      const id1 = CampaignId.generate();
      const id2 = CampaignId.generate();
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
