import { InvalidWeightError } from '../errors/invalid-weight.error';

export class Weight {
  private constructor(private readonly value: number) {}

  static from(input: number): Weight {
    if (input <= 0) {
      throw new InvalidWeightError();
    }

    const roundedUp = Math.ceil(input);

    return new Weight(roundedUp);
  }

  get valueKg(): number {
    return this.value;
  }
}
