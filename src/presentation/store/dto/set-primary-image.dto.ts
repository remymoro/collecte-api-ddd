// src/presentation/store/dto/set-primary-image.dto.ts

import { IsNotEmpty, IsUrl } from 'class-validator';

export class SetPrimaryImageDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @IsNotEmpty()
  url: string;
}
