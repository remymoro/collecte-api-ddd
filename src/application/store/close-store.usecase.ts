// src/application/store/close-store.usecase.ts

import { Injectable, Inject } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import type { StoreRepository } from '@domain/store/store.repository';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

export interface CloseStoreInput {
  storeId: string;
  userId: string;
  reason: string;
}

@Injectable()
export class CloseStoreUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: CloseStoreInput): Promise<Store> {
    const store = await this.storeRepository.findById(StoreId.from(input.storeId));

    const center = await this.centerRepository.findById(CenterId.from(store.centerId));
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }

    center.assertActive();

    store.close(input.userId, input.reason);

    await this.storeRepository.save(store);

    return store;
  }
}