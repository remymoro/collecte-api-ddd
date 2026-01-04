import { Center } from "@domain/center/center.entity";
import { CenterRepository } from "@domain/center/center.repository";
import { CENTER_REPOSITORY } from "@domain/center/center.tokens";
import { CenterAlreadyExistsError } from "@domain/center/errors/center-already-exists.error";
import { Inject } from "@nestjs/common";


export type CreateCenterInput = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
};

export class CreateCenterUsecase {
   constructor(
    @Inject(CENTER_REPOSITORY)
    private readonly repository: CenterRepository,
  ) {}


  async execute(input: CreateCenterInput): Promise<Center> {
    const existing = await this.repository.findByNameAndCity(
      input.name.trim(),
      input.city.trim(),
    );

    if (existing) {
      throw new CenterAlreadyExistsError(
        input.name,
        input.city,
      );
    }

    const center = Center.create(input);
    await this.repository.save(center);

    return center;
  }
}
