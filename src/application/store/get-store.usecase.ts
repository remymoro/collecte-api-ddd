// src/application/store/get-store.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';

export interface GetStoreInput {
  storeId: string;
}

@Injectable()
export class GetStoreUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,
  ) {}

  async execute(input: GetStoreInput): Promise<Store> {
    return this.storeRepository.findById(StoreId.from(input.storeId));
  }
}
