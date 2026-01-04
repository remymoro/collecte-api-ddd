// src/presentation/store/dto/store-created.dto.ts

export class StoreCreatedDto {
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