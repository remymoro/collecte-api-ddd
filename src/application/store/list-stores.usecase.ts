// src/application/store/list-stores.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { Store } from '@domain/store/store.entity';
import { StoreStatus } from '@domain/store/enums/store-status.enum';
import type { StoreRepository } from '@domain/store/store.repository';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

export interface ListStoresInput {
  centerId?: string;
  city?: string;
  status?: StoreStatus;
  statusIn?: StoreStatus[];
}

@Injectable()
export class ListStoresUseCase {
  constructor(
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,
  ) {}

  async execute(input: ListStoresInput): Promise<Store[]> {
    return this.storeRepository.findAll({
      centerId: input.centerId ? CenterId.from(input.centerId) : undefined,
      city: input.city,
      status: input.status,
      statusIn: input.statusIn,
    });
  }
}
