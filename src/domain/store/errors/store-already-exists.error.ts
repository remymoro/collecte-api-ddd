// src/domain/store/errors/store-already-exists.error.ts

import { DomainError } from '@domain/errors/domain-error';


export class StoreAlreadyExistsAtAddressError extends DomainError {
  readonly code = 'STORE_ALREADY_EXISTS_AT_ADDRESS';

  constructor(
    centerId: string,
    address: string,
    postalCode: string,
    city: string,
  ) {
    super(
      `A store already exists at address "${address}, ${postalCode} ${city}" for center ${centerId}`,
    );
  }
}
