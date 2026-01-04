// src/application/store/add-store-image.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

export interface AddStoreImageInput {
  storeId: string;
  imageUrl: string;
  isPrimary?: boolean;
}

/**
 * Use Case : Ajouter une image à un Store
 *
 * Règle métier :
 * - Une seule image primaire autorisée
 * - URL HTTPS validée par le Value Object
 * - Pas de logique d'upload ici (déjà fait sur Azure)
 */
@Injectable()
export class AddStoreImageUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: AddStoreImageInput): Promise<Store> {
    const store = await this.storeRepository.findById(input.storeId);

    const center = await this.centerRepository.findById(store.centerId);
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }
    center.assertActive();

    // Règle métier déléguée au domaine
    store.addImage(input.imageUrl, input.isPrimary ?? false);

    await this.storeRepository.save(store);

    return store;
  }
}
