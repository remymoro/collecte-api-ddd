// src/application/store/set-primary-store-image.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

export interface SetPrimaryStoreImageInput {
  storeId: string;
  imageUrl: string;
}

/**
 * Use Case : Définir l'image primaire d'un Store
 *
 * Règle métier :
 * - Retire automatiquement le statut primaire des autres images
 * - Erreur si l'image n'existe pas
 */
@Injectable()
export class SetPrimaryStoreImageUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: SetPrimaryStoreImageInput): Promise<Store> {
    const store = await this.storeRepository.findById(input.storeId);

    const center = await this.centerRepository.findById(store.centerId);
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }
    center.assertActive();

    store.setPrimaryImage(input.imageUrl);

    await this.storeRepository.save(store);

    return store;
  }
}
