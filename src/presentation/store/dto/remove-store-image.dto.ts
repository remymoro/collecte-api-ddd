// src/presentation/store/dto/remove-store-image.dto.ts

import { IsNotEmpty, IsUrl } from 'class-validator';

export class RemoveStoreImageDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @IsNotEmpty()
  url: string;
}
