// src/presentation/store/dto/store-detail.dto.ts

export class StoreDetailDto {
  id: string;
  centerId: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  contactName?: string;
  status: string;
  statusChangedAt?: Date;
  statusChangedBy?: string;
  statusReason?: string;
}