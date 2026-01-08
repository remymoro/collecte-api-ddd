import { Inject, Injectable } from '@nestjs/common';
import { Center } from '@domain/center/center.entity';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

@Injectable()
export class ReactivateCenterUseCase {
  constructor(
    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(centerId: string): Promise<Center> {
    const center = await this.centerRepository.findById(CenterId.from(centerId));

    if (!center) {
      throw new CenterNotFoundError(centerId);
    }

    const reactivatedCenter = center.activate();

    await this.centerRepository.save(reactivatedCenter);

    return reactivatedCenter;
  }
}
