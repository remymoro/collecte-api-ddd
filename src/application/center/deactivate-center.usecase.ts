import { Inject, Injectable } from '@nestjs/common';
import { Center } from '@domain/center/center.entity';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

@Injectable()
export class DeactivateCenterUseCase {
  constructor(
    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(centerId: string): Promise<Center> {
    const id = CenterId.from(centerId);
    const center = await this.centerRepository.findById(id);

    if (!center) {
      throw new CenterNotFoundError(centerId);
    }

    center.assertActive();

    const deactivatedCenter = center.deactivate();

    await this.centerRepository.save(deactivatedCenter);

    return deactivatedCenter;
  }
}
