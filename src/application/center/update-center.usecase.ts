import { Inject, Injectable } from '@nestjs/common';
import { Center } from '@domain/center/center.entity';
import { CenterId } from '@domain/center/value-objects/center-id.vo';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';

export interface UpdateCenterInput {
  centerId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
}

@Injectable()
export class UpdateCenterUseCase {
  constructor(
    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(input: UpdateCenterInput): Promise<Center> {
    const id = CenterId.from(input.centerId);
    const center = await this.centerRepository.findById(id);

    if (!center) {
      throw new CenterNotFoundError(input.centerId);
    }

    center.assertActive();

    const updatedCenter = center.updateInfo(
      input.name,
      input.address,
      input.city,
      input.postalCode,
    );

    await this.centerRepository.save(updatedCenter);

    return updatedCenter;
  }
}
