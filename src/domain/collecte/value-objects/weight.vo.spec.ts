// src/domain/collecte/value-objects/weight.vo.spec.ts

import { Weight } from './weight.vo';
import { InvalidWeightError } from '../errors/invalid-weight.error';

describe('Weight Value Object', () => {
  describe('Règle métier : Le poids doit être strictement positif', () => {
    it('refuse un poids de 0 kg', () => {
      // POURQUOI : Un produit de 0kg n'a pas de sens métier
      expect(() => Weight.from(0)).toThrow(InvalidWeightError);
    });

    it('refuse un poids négatif', () => {
      // POURQUOI : Un poids négatif est physiquement impossible
      expect(() => Weight.from(-5)).toThrow(InvalidWeightError);
    });

    it('accepte un poids strictement positif', () => {
      // POURQUOI : Valeur métier valide
      const weight = Weight.from(10);
      expect(weight.valueKg).toBe(10);
    });
  });

  describe('Règle métier : Arrondi supérieur automatique (sécurité)', () => {
    it('arrondit 5.2 kg à 6 kg', () => {
      // POURQUOI : Évite la sous-estimation du tonnage collecté
      // Règle métier explicite : on arrondit TOUJOURS au supérieur
      const weight = Weight.from(5.2);
      expect(weight.valueKg).toBe(6);
    });

    it('arrondit 0.1 kg à 1 kg', () => {
      // POURQUOI : Même un petit reste doit être comptabilisé
      const weight = Weight.from(0.1);
      expect(weight.valueKg).toBe(1);
    });

    it('ne modifie pas un entier (déjà arrondi)', () => {
      // POURQUOI : 10 kg reste 10 kg
      const weight = Weight.from(10);
      expect(weight.valueKg).toBe(10);
    });
  });

  describe('Immutabilité (Value Object)', () => {
    it('retourne toujours la même valeur', () => {
      // POURQUOI : Un Value Object ne doit jamais changer après création
      const weight = Weight.from(5);
      expect(weight.valueKg).toBe(5);
      expect(weight.valueKg).toBe(5); // deuxième lecture = même valeur
    });
  });
});
