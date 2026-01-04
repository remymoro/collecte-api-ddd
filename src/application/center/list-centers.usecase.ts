import { Inject, Injectable } from '@nestjs/common';
import { Center } from '@domain/center/center.entity';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';

@Injectable()
export class ListCentersUseCase {
  constructor(
    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(): Promise<Center[]> {
    return this.centerRepository.findAll();
  }
}
