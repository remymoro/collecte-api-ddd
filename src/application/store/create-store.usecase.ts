// src/application/store/create-store.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { StoreAlreadyExistsAtAddressError } from '@domain/store/errors/store-already-exists.error';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

export interface CreateStoreInput {
  centerId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  contactName?: string;
}

@Injectable()
export class CreateStoreUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: CreateStoreInput): Promise<Store> {
    const center = await this.centerRepository.findById(CenterId.from(input.centerId));
    if (!center) {
      throw new CenterNotFoundError(input.centerId);
    }

    center.assertActive();

    // Vérifier l'unicité métier : centerId + address
    // Un même centre peut avoir plusieurs Lidl, MAIS pas à la même adresse
    const existingStore = await this.storeRepository.findByCenterIdAndAddress(
      CenterId.from(input.centerId),
      input.address,
      input.city,
      input.postalCode,
    );

    if (existingStore) {
      throw new StoreAlreadyExistsAtAddressError(
        input.centerId,
        input.address,
        input.postalCode,
        input.city,
      );
    }

    // Créer le magasin (naît toujours DISPONIBLE)
    const store = Store.create(
      input.centerId,
      input.name,
      input.address,
      input.city,
      input.postalCode,
      input.phone,
      input.contactName,
    );

    await this.storeRepository.save(store);

    return store;
  }
}
