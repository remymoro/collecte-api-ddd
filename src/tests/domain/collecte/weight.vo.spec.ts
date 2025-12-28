import { Weight } from '@domain/collecte/value-objects/weight.vo';
import { InvalidWeightError } from '@domain/collecte/errors/invalid-weight.error';

describe('Weight (Value Object)', () => {
  describe('Création valide', () => {
    it('crée un poids avec une valeur entière', () => {
      const weight = Weight.from(10);

      expect(weight.valueKg).toBe(10);
    });

    it('arrondit au kg supérieur pour une valeur décimale', () => {
      const weight = Weight.from(5.3);

      expect(weight.valueKg).toBe(6);
    });

    it('arrondit 0.1 kg à 1 kg', () => {
      const weight = Weight.from(0.1);

      expect(weight.valueKg).toBe(1);
    });

    it('arrondit 9.9 kg à 10 kg', () => {
      const weight = Weight.from(9.9);

      expect(weight.valueKg).toBe(10);
    });

    it('conserve une valeur déjà entière', () => {
      const weight = Weight.from(25);

      expect(weight.valueKg).toBe(25);
    });
  });

  describe('Validation des erreurs', () => {
    it('refuse un poids de 0 kg', () => {
      expect(() => Weight.from(0)).toThrow(InvalidWeightError);
    });

    it('refuse un poids négatif', () => {
      expect(() => Weight.from(-5)).toThrow(InvalidWeightError);
    });

    it('refuse un poids négatif décimal', () => {
      expect(() => Weight.from(-0.5)).toThrow(InvalidWeightError);
    });
  });

  describe('Immutabilité', () => {
    it('est immutable après création', () => {
      const weight = Weight.from(10);

      // Le getter valueKg est en lecture seule
      expect(() => {
        // @ts-expect-error - Test d'immutabilité
        weight.valueKg = 20;
      }).toThrow();
    });
  });

  describe('Cas limites', () => {
    it('gère les très grands nombres', () => {
      const weight = Weight.from(999999.9);

      expect(weight.valueKg).toBe(1000000);
    });

    it('gère les très petits nombres positifs', () => {
      const weight = Weight.from(0.001);

      expect(weight.valueKg).toBe(1);
    });
  });
});