// src/application/store/update-store.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

export interface UpdateStoreInput {
  storeId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  contactName?: string;
}

@Injectable()
export class UpdateStoreUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: UpdateStoreInput): Promise<Store> {
    const store = await this.storeRepository.findById(StoreId.from(input.storeId));

    const center = await this.centerRepository.findById(CenterId.from(store.centerId));
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }

    center.assertActive();

    store.updateInfo(
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
