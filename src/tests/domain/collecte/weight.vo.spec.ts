import { Weight } from '@domain/collecte/value-objects/weight.vo';
import { InvalidWeightError } from '@domain/collecte/errors/invalid-weight.error';

describe('Weight (Value Object)', () => {
  it('refuse un poids négatif ou nul', () => {
    expect(() => Weight.from(0)).toThrow(InvalidWeightError);
    expect(() => Weight.from(-1)).toThrow(InvalidWeightError);
  });

  it('arrondit le poids au kilogramme supérieur', () => {
    expect(Weight.from(10).valueKg).toBe(10);
    expect(Weight.from(5.3).valueKg).toBe(6);
  });
});