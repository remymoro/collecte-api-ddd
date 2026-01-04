import { IsUUID } from 'class-validator';

export class ActivateStoreDto {
  @IsUUID()
  storeId!: string;
}
