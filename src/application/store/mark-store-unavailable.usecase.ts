// src/application/store/mark-store-unavailable.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

export interface MarkStoreUnavailableInput {
  storeId: string;
  userId: string;
  reason: string;
}

export interface MarkStoreAvailableInput {
  storeId: string;
  userId: string;
}

@Injectable()
export class MarkStoreUnavailableUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: MarkStoreUnavailableInput): Promise<Store> {
    const store = await this.storeRepository.findById(input.storeId);

    const center = await this.centerRepository.findById(store.centerId);
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }

    center.assertActive();

    store.markAsUnavailable(input.userId, input.reason);

    await this.storeRepository.save(store);

    return store;
  }
}

@Injectable()
export class MarkStoreAvailableUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: MarkStoreAvailableInput): Promise<Store> {
    const store = await this.storeRepository.findById(input.storeId);

    const center = await this.centerRepository.findById(store.centerId);
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }

    center.assertActive();

    store.markAsAvailable(input.userId);

    await this.storeRepository.save(store);

    return store;
  }
}
